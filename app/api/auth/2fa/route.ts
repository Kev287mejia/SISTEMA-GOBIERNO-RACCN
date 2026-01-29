import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
    generate2FASecret,
    generate2FAURL,
    generateQRCode,
    generateBackupCodes,
    verify2FAToken
} from "@/lib/two-factor"

// Habilitar 2FA
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
        }

        // Generar secreto y códigos de respaldo
        const secret = generate2FASecret()
        const backupCodes = generateBackupCodes(10)
        const otpauthURL = generate2FAURL(user.email, secret)
        const qrCode = await generateQRCode(otpauthURL)

        // Guardar secreto temporalmente (no activar hasta verificar)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                twoFactorSecret: secret,
                twoFactorBackupCodes: backupCodes,
                twoFactorEnabled: false // Activar después de verificar
            }
        })

        return NextResponse.json({
            secret,
            qrCode,
            backupCodes,
            otpauthURL
        })
    } catch (error) {
        console.error("Error setting up 2FA:", error)
        return NextResponse.json(
            { error: "Error al configurar 2FA" },
            { status: 500 }
        )
    }
}

// Verificar y activar 2FA
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const { code } = await req.json()

        if (!code) {
            return NextResponse.json({ error: "Código requerido" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user || !user.twoFactorSecret) {
            return NextResponse.json({ error: "2FA no configurado" }, { status: 400 })
        }

        // Verificar código
        const isValid = verify2FAToken(code, user.twoFactorSecret)

        if (!isValid) {
            return NextResponse.json({ error: "Código inválido" }, { status: 400 })
        }

        // Activar 2FA
        await prisma.user.update({
            where: { id: user.id },
            data: {
                twoFactorEnabled: true
            }
        })

        // Registrar en auditoría
        await prisma.auditLog.create({
            data: {
                accion: "UPDATE",
                entidad: "User",
                entidadId: user.id,
                descripcion: "2FA activado",
                usuarioId: user.id,
                datosNuevos: { twoFactorEnabled: true }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error verifying 2FA:", error)
        return NextResponse.json(
            { error: "Error al verificar 2FA" },
            { status: 500 }
        )
    }
}

// Desactivar 2FA
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const { password } = await req.json()

        if (!password) {
            return NextResponse.json({ error: "Contraseña requerida" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
        }

        // Verificar contraseña
        const bcrypt = require('bcryptjs')
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
        }

        // Desactivar 2FA
        await prisma.user.update({
            where: { id: user.id },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                twoFactorBackupCodes: []
            }
        })

        // Registrar en auditoría
        await prisma.auditLog.create({
            data: {
                accion: "UPDATE",
                entidad: "User",
                entidadId: user.id,
                descripcion: "2FA desactivado",
                usuarioId: user.id,
                datosNuevos: { twoFactorEnabled: false }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error disabling 2FA:", error)
        return NextResponse.json(
            { error: "Error al desactivar 2FA" },
            { status: 500 }
        )
    }
}
