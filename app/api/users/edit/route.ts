import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { auditUpdate } from "@/lib/audit"

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        // Solo Admin, ContadorGeneral y ResponsableContabilidad pueden editar usuarios
        const allowedRoles = ["Admin", "ContadorGeneral", "ResponsableContabilidad"]
        if (!allowedRoles.includes(session?.user?.role)) {
            return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
        }

        const body = await req.json()
        const { userId, nombre, apellido, cedula, cargo, departamento, role, deniedModules } = body

        if (!userId) {
            return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 })
        }

        // Obtener usuario actual
        const currentUser = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!currentUser) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
        }

        // No permitir que se edite a sí mismo
        if (currentUser.id === session.user.id) {
            return NextResponse.json(
                { error: "No puedes editar tu propio usuario" },
                { status: 400 }
            )
        }

        // Actualizar usuario
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                nombre,
                apellido,
                cedula,
                cargo,
                departamento,
                role: role as Role,
                deniedModules: deniedModules || [],
                sessionVersion: { increment: 1 }
            }
        })

        // Registrar en auditoría
        await auditUpdate(
            "User",
            updatedUser.id,
            `Usuario actualizado: ${updatedUser.email}`,
            {
                nombre: currentUser.nombre,
                apellido: currentUser.apellido,
                role: currentUser.role,
                cargo: currentUser.cargo
            },
            {
                nombre: updatedUser.nombre,
                apellido: updatedUser.apellido,
                role: updatedUser.role,
                cargo: updatedUser.cargo
            }
        )

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                nombre: updatedUser.nombre,
                apellido: updatedUser.apellido,
                role: updatedUser.role,
                cargo: updatedUser.cargo
            }
        })
    } catch (error) {
        console.error("Error updating user:", error)
        return NextResponse.json(
            { error: "Error al actualizar usuario" },
            { status: 500 }
        )
    }
}
