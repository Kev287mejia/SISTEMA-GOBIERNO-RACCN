import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { auditUpdate } from "@/lib/audit"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        // Solo Admin, ContadorGeneral y ResponsableContabilidad pueden resetear contraseñas
        const allowedRoles = ["Admin", "ContadorGeneral", "ResponsableContabilidad"]
        if (!allowedRoles.includes(session?.user?.role)) {
            return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
        }

        const body = await req.json()
        const { userId, newPassword } = body

        if (!userId || !newPassword) {
            return NextResponse.json(
                { error: "ID de usuario y contraseña requeridos" },
                { status: 400 }
            )
        }

        // Obtener usuario
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
        }

        // Hash de nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 12)

        // Actualizar contraseña
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        // Registrar en auditoría (sin guardar la contraseña)
        await auditUpdate(
            "User",
            user.id,
            `Contraseña reseteada para: ${user.email}`,
            undefined, // No previous data relevant/safe to log for pwd
            { passwordReset: true }
        )

        return NextResponse.json({
            success: true,
            message: "Contraseña actualizada exitosamente"
        })
    } catch (error) {
        console.error("Error resetting password:", error)
        return NextResponse.json(
            { error: "Error al resetear contraseña" },
            { status: 500 }
        )
    }
}
