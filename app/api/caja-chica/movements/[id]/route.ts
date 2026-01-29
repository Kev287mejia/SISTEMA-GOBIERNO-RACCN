import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { emitPettyCashEvent, PettyCashEvent } from "@/lib/socket"

// Mark a movement as inconsistent or add observations
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        if ((session.user.role as any) !== "Admin" && (session.user.role as any) !== "ResponsableCredito") {
            return NextResponse.json({ error: "No tiene permisos para realizar esta acción" }, { status: 403 })
        }

        const body = await request.json()
        const { inconsistente, observaciones } = body

        const currentMovement = await prisma.pettyCashMovement.findUnique({
            where: { id: params.id }
        })

        if (!currentMovement) {
            return NextResponse.json({ error: "Movimiento no encontrado" }, { status: 404 })
        }

        const movement = await prisma.pettyCashMovement.update({
            where: { id: params.id },
            data: {
                inconsistente: inconsistente !== undefined ? inconsistente : currentMovement.inconsistente,
                observaciones: observaciones !== undefined ? observaciones : currentMovement.observaciones,
            }
        })

        // Emit real-time event
        emitPettyCashEvent(PettyCashEvent.INCONSISTENCY_MARKED, {
            movementId: params.id,
            inconsistente: movement.inconsistente
        })

        // Log Audit
        await prisma.auditLog.create({
            data: {
                accion: 'UPDATE',
                entidad: 'PettyCashMovement',
                entidadId: movement.id,
                descripcion: `${session.user.name} marcó inconsistencia/observación en movimiento de caja chica`,
                usuarioId: session.user.id,
                datosAnteriores: currentMovement as any,
                datosNuevos: movement as any
            }
        })

        return NextResponse.json(movement)
    } catch (error: any) {
        console.error("Error updating movement inconsistency:", error)
        return NextResponse.json({ error: "Error al actualizar el registro" }, { status: 500 })
    }
}
