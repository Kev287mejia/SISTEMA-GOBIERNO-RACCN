
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generatePasswordResetToken } from "@/lib/tokens"
import { sendPasswordResetEmail } from "@/lib/mail"
import { z } from "zod"

const forgotPasswordSchema = z.object({
    email: z.string().email(),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email } = forgotPasswordSchema.parse(body)

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return NextResponse.json(
                { message: "Si el correo está registrado, recibirás un enlace de recuperación." },
                { status: 200 }
            )
        }

        const passwordResetToken = await generatePasswordResetToken(email)
        await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token)

        return NextResponse.json(
            { message: "Correo de recuperación enviado." },
            { status: 200 }
        )
    } catch (error) {
        console.error("Forgot password error:", error)
        return NextResponse.json(
            { error: "Ocurrió un error al procesar la solicitud." },
            { status: 500 }
        )
    }
}
