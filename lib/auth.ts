import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabase } from "./supabase"
import bcrypt from "bcryptjs"
import { verify2FAToken, verifyBackupCode } from "./two-factor"
import { monitorFailedLogins, monitorAccountLock } from "./security-monitor"

const MAX_LOGIN_ATTEMPTS = 5
const LOCK_DURATION_MINUTES = 30

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Auth: Missing credentials")
          return null
        }

        const email = credentials.email.trim().toLowerCase()
        console.log(`Auth Attempt: Email=${email} (Supabase Engine)`)

        // Buscar usuario en Supabase
        const { data: user, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single()

        if (fetchError || !user) {
          console.log(`Auth: User not found: ${email}`)
          return null
        }

        // Verificar si el usuario está activo
        if (!user.activo) {
          console.log(`Auth: User inactive: ${email}`)
          throw new Error("INACTIVE_USER")
        }

        // Verificar si la cuenta está bloqueada
        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
          const minutesLeft = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000)
          console.log(`Auth: Account locked for ${minutesLeft} more minutes`)
          throw new Error(`ACCOUNT_LOCKED:${minutesLeft}`)
        }

        // Si el bloqueo expiró, resetear intentos fallidos
        if (user.lockedUntil && new Date(user.lockedUntil) <= new Date()) {
          await supabase.from('users').update({
            failedLoginAttempts: 0,
            lockedUntil: null
          }).eq('id', user.id)
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          const newAttempts = (user.failedLoginAttempts || 0) + 1
          const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS

          await supabase.from('users').update({
            failedLoginAttempts: newAttempts,
            lockedUntil: shouldLock
              ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000).toISOString()
              : null
          }).eq('id', user.id)

          await monitorFailedLogins(user.id, newAttempts)

          // Auditoría en Supabase
          await supabase.from('audit_logs').insert({
            accion: "LOGIN",
            entidad: "User",
            entidadId: user.id,
            descripcion: `Intento de login fallido (${newAttempts}/${MAX_LOGIN_ATTEMPTS})`,
            usuarioId: user.id,
            datosNuevos: { failedAttempts: newAttempts, locked: shouldLock }
          })

          if (shouldLock) {
            await monitorAccountLock(user.id, LOCK_DURATION_MINUTES)
            throw new Error(`ACCOUNT_LOCKED:${LOCK_DURATION_MINUTES}`)
          }

          const attemptsLeft = MAX_LOGIN_ATTEMPTS - newAttempts
          throw new Error(`INVALID_PASSWORD:${attemptsLeft}`)
        }

        // 2FA Logic
        if (user.twoFactorEnabled) {
          const twoFactorCode = credentials.twoFactorCode
          if (!twoFactorCode) throw new Error("2FA_REQUIRED")

          let isValid2FA = false
          if (user.twoFactorSecret) {
            isValid2FA = verify2FAToken(twoFactorCode, user.twoFactorSecret)
          }

          if (!isValid2FA && user.twoFactorBackupCodes?.length > 0) {
            const backupResult = verifyBackupCode(twoFactorCode, user.twoFactorBackupCodes)
            if (backupResult.isValid) {
              await supabase.from('users').update({
                twoFactorBackupCodes: backupResult.remainingCodes || []
              }).eq('id', user.id)
              isValid2FA = true
            }
          }

          if (!isValid2FA) throw new Error("INVALID_2FA")
        }

        // Success Update
        await supabase.from('users').update({
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date().toISOString()
        }).eq('id', user.id)

        console.log(`Auth: Login successful for: ${email} [${user.role}]`)

        return {
          id: user.id,
          email: user.email,
          name: `${user.nombre} ${user.apellido || ""}`.trim(),
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
          deniedModules: user.deniedModules || [],
          sessionVersion: user.sessionVersion || 1
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
        token.twoFactorEnabled = (user as any).twoFactorEnabled
        token.deniedModules = (user as any).deniedModules
        token.sessionVersion = (user as any).sessionVersion
      }

      if (token.id && token.id !== "test") {
        try {
          const { data: dbUser } = await supabase
            .from('users')
            .select('sessionVersion, role, deniedModules, activo')
            .eq('id', token.id)
            .single()

          if (!dbUser || !dbUser.activo) return { ...token, error: "RefreshAccessTokenError" }

          if (dbUser.sessionVersion && dbUser.sessionVersion !== token.sessionVersion) {
            token.role = dbUser.role
            token.deniedModules = dbUser.deniedModules
            token.sessionVersion = dbUser.sessionVersion
          }
        } catch (error) {
          console.error("Auth: Session refresh error", error)
        }
      }
      return token
    },
    async session({ session, token }) {
      if ((token as any).error === "RefreshAccessTokenError") return null as any
      if (session.user) {
        session.user.role = token.role as any
        session.user.id = token.id as string
        ;(session.user as any).twoFactorEnabled = token.twoFactorEnabled
        ;(session.user as any).deniedModules = token.deniedModules || []
        ;(session.user as any).sessionVersion = token.sessionVersion
      }
      return session
    }
  },
  pages: { signIn: "/auth/login", error: "/auth/login" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET || "sisgob-secret-2026-key",
};

