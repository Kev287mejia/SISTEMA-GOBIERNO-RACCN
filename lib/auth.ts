import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"
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
        console.log(`Auth Attempt: Email=${email}`)

        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user) {
          console.log(`Auth: User not found: ${email}`)
          return null
        }

        // Verificar si el usuario está activo
        if (!user.activo) {
          console.log(`Auth: User inactive: ${email}`)
          throw new Error("INACTIVE_USER")
        }

        // Verificar si la cuenta está bloqueada
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000)
          console.log(`Auth: Account locked for ${minutesLeft} more minutes`)
          throw new Error(`ACCOUNT_LOCKED:${minutesLeft}`)
        }

        // Si el bloqueo expiró, resetear intentos fallidos
        if (user.lockedUntil && user.lockedUntil <= new Date()) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lockedUntil: null
            }
          })
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          // Incrementar intentos fallidos
          const newAttempts = user.failedLoginAttempts + 1
          const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: newAttempts,
              lockedUntil: shouldLock
                ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
                : null
            }
          })

          // Monitorear intentos fallidos
          await monitorFailedLogins(user.id, newAttempts)

          // Registrar intento fallido en auditoría
          await prisma.auditLog.create({
            data: {
              accion: "LOGIN",
              entidad: "User",
              entidadId: user.id,
              descripcion: `Intento de login fallido (${newAttempts}/${MAX_LOGIN_ATTEMPTS})`,
              usuarioId: user.id,
              datosNuevos: {
                failedAttempts: newAttempts,
                locked: shouldLock
              }
            }
          })

          if (shouldLock) {
            await monitorAccountLock(user.id, LOCK_DURATION_MINUTES)
            console.log(`Auth: Account locked after ${MAX_LOGIN_ATTEMPTS} failed attempts`)
            throw new Error(`ACCOUNT_LOCKED:${LOCK_DURATION_MINUTES}`)
          }

          const attemptsLeft = MAX_LOGIN_ATTEMPTS - newAttempts
          console.log(`Auth: Invalid password. ${attemptsLeft} attempts left`)
          throw new Error(`INVALID_PASSWORD:${attemptsLeft}`)
        }

        // Si 2FA está habilitado, verificar código
        if (user.twoFactorEnabled) {
          const twoFactorCode = credentials.twoFactorCode

          if (!twoFactorCode) {
            throw new Error("2FA_REQUIRED")
          }

          // Verificar código TOTP
          let isValid2FA = false
          if (user.twoFactorSecret) {
            isValid2FA = verify2FAToken(twoFactorCode, user.twoFactorSecret)
          }

          // Si no es válido, intentar con código de respaldo
          if (!isValid2FA && user.twoFactorBackupCodes.length > 0) {
            const backupResult = verifyBackupCode(twoFactorCode, user.twoFactorBackupCodes)

            if (backupResult.isValid) {
              // Actualizar códigos de respaldo (remover el usado)
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  twoFactorBackupCodes: backupResult.remainingCodes || []
                }
              })

              isValid2FA = true

              // Registrar uso de código de respaldo
              await prisma.auditLog.create({
                data: {
                  accion: "LOGIN",
                  entidad: "User",
                  entidadId: user.id,
                  descripcion: "Login con código de respaldo 2FA",
                  usuarioId: user.id,
                  datosNuevos: {
                    backupCodesRemaining: backupResult.remainingCodes?.length || 0
                  }
                }
              })
            }
          }

          if (!isValid2FA) {
            console.log("Auth: Invalid 2FA code")
            throw new Error("INVALID_2FA")
          }
        }

        // Login exitoso - resetear intentos fallidos y actualizar último login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date()
          }
        })

        // Registrar login exitoso en auditoría
        await prisma.auditLog.create({
          data: {
            accion: "LOGIN",
            entidad: "User",
            entidadId: user.id,
            descripcion: `Login exitoso${user.twoFactorEnabled ? ' (2FA)' : ''}`,
            usuarioId: user.id
          }
        })

        console.log(`Auth: Login successful for: ${email} [${user.role}]`)

        return {
          id: user.id,
          email: user.email,
          name: `${user.nombre} ${user.apellido || ""}`.trim(),
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
          deniedModules: user.deniedModules,
          sessionVersion: user.sessionVersion
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
        token.twoFactorEnabled = (user as any).twoFactorEnabled
        token.deniedModules = (user as any).deniedModules
        token.sessionVersion = (user as any).sessionVersion
      }

      // Check DB for critical updates (Security: Absolute Immediate)
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: {
              sessionVersion: true,
              role: true,
              deniedModules: true,
              activo: true
            }
          })

          // Invalidate if user not found or inactive
          if (!dbUser || !dbUser.activo) {
            return { ...token, error: "RefreshAccessTokenError" }
          }

          // Update token if version changed (Permission Update)
          if (dbUser.sessionVersion && dbUser.sessionVersion !== token.sessionVersion) {
            token.role = dbUser.role
            token.deniedModules = dbUser.deniedModules
            token.sessionVersion = dbUser.sessionVersion
          }
        } catch (error) {
          console.error("Error checking session version", error)
        }
      }

      return token
    },
    async session({ session, token }) {
      // If token has error, invalidate session
      if ((token as any).error === "RefreshAccessTokenError") {
        return null as any
      }

      if (session.user) {
        session.user.role = token.role as Role
        session.user.id = token.id as string
          ; (session.user as any).twoFactorEnabled = token.twoFactorEnabled
          ; (session.user as any).deniedModules = token.deniedModules || []
          ; (session.user as any).sessionVersion = token.sessionVersion
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas
  },
  secret: process.env.NEXTAUTH_SECRET,
}
