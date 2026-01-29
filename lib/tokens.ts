
import { prisma } from "@/lib/prisma"

export const generatePasswordResetToken = async (email: string) => {
    const token = crypto.randomUUID()
    // Expira en 1 hora
    const expires = new Date(new Date().getTime() + 3600 * 1000)

    const existingToken = await prisma.passwordResetToken.findFirst({
        where: { email },
    })

    if (existingToken) {
        await prisma.passwordResetToken.delete({
            where: { id: existingToken.id },
        })
    }

    const passwordResetToken = await prisma.passwordResetToken.create({
        data: {
            email,
            token,
            expires,
        },
    })

    return passwordResetToken
}
