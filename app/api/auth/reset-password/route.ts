
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(6),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { token, password } = resetPasswordSchema.parse(body)

        const existingToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        })

        if (!existingToken) {
            return NextResponse.json(
                { error: "Token inválido o expirado" },
                { status: 400 }
            )
        }

        const hasExpired = new Date() > existingToken.expires

        if (hasExpired) {
            return NextResponse.json(
                { error: "El token ha expirado. Solicita uno nuevo." },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: existingToken.email },
        })

        if (!existingUser) {
            return NextResponse.json(
                { error: "Usuario no encontrado" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                password: hashedPassword,
                passwordChangedAt: new Date(),
            },
        })

        await prisma.passwordResetToken.delete({
            where: { id: existingToken.id },
        })

        return NextResponse.json(
            { message: "Contraseña restablecida exitosamente." },
            { status: 200 }
        )
    } catch (error) {
        console.error("Reset password error:", error)
        return NextResponse.json(
            { error: "Ocurrió un error al restablecer la contraseña." },
            { status: 500 }
        )
    }
}
