import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AuditAction, Role } from "@prisma/client"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)

        // Verificar sesión y roles autorizados
        const allowedRoles = [Role.Admin, Role.RRHH, Role.DirectoraRRHH, Role.ResponsableContabilidad] as string[]

        // Fix: Convert role to string for comparison or cast properly
        if (!session?.user || !allowedRoles.includes(session.user.role)) {
            console.log(`[DELETE USER] Acceso denegado. User Role: ${session?.user?.role}`)
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const userIdToDelete = params.id
        console.log(`[DELETE USER] Attempting to delete user: ${userIdToDelete} by ${session.user.email}`)

        // Evitar auto-eliminación
        if (userIdToDelete === session.user.id) {
            return NextResponse.json({ error: "No puede eliminar su propia cuenta" }, { status: 400 })
        }

        // Soft Delete
        try {
            const updatedUser = await prisma.user.update({
                where: { id: userIdToDelete },
                data: {
                    activo: false,
                    deletedAt: new Date()
                }
            })
            console.log(`[DELETE USER] Soft delete successful for ${updatedUser.email}`)

            // Registrar en auditoría
            await prisma.auditLog.create({
                data: {
                    accion: "DELETE",
                    entidad: "User",
                    entidadId: userIdToDelete,
                    descripcion: `Usuario eliminado (soft delete): ${updatedUser.email}`,
                    usuarioId: session.user.id,
                    datosAnteriores: {
                        email: updatedUser.email,
                        nombre: updatedUser.nombre,
                        deletedAt: "now"
                    }
                }
            })

            return NextResponse.json({ message: "Usuario eliminado correctamente" })

        } catch (innerError: any) {
            console.error("[DELETE USER] Database error:", innerError)
            return NextResponse.json({ error: `Error de BD: ${innerError.message}` }, { status: 500 })
        }
    } catch (error) {
        console.error("Error deleting user:", error)
        return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
    }
}
