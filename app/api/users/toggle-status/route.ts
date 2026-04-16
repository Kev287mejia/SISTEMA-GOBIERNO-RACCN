import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { auditUpdate } from "@/lib/audit"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        // Solo Admin, ContadorGeneral y ResponsableContabilidad pueden desactivar usuarios
        const allowedRoles = ["Admin", "ContadorGeneral", "ResponsableContabilidad"]
        if (!allowedRoles.includes(session?.user?.role)) {
            return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
        }

        const body = await req.json()
        const { userId, activo } = body

        if (!userId) {
            return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 })
        }

        // Obtener usuario
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
        }

        // No permitir desactivarse a sí mismo
        if (user.id === session.user.id) {
            return NextResponse.json(
                { error: "No puedes desactivar tu propio usuario" },
                { status: 400 }
            )
        }

        // Actualizar estado
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { activo }
        })

        // Registrar en auditoría
        await auditUpdate(
            "User",
            updatedUser.id,
            `Usuario ${activo ? 'activado' : 'desactivado'}: ${updatedUser.email}`,
            { activo: user.activo },
            { activo: updatedUser.activo }
        )

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                activo: updatedUser.activo
            }
        })
    } catch (error) {
        console.error("Error toggling user status:", error)
        return NextResponse.json(
            { error: "Error al cambiar estado del usuario" },
            { status: 500 }
        )
    }
}
