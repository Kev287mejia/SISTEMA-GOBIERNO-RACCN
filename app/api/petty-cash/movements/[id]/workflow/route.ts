
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role, MovementStatus } from "@prisma/client"

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const { action, targetStatus, reason } = await req.json()
        const movementId = params.id
        const userRole = session?.user?.role as Role
        const userId = session.user.id

        // Validar Movimiento
        const movement = await prisma.pettyCashMovement.findUnique({
            where: { id: movementId },
            include: { pettyCash: true }
        })

        if (!movement) {
            return NextResponse.json({ error: "Movimiento no encontrado" }, { status: 404 })
        }

        // Lógica de Permisos por Transición
        let isAuthorized = false

        if (action === "REJECT") {
            // Roles que pueden rechazar: Jefes, Admin, DAF
            if (["Admin", "DirectoraDAF", "CoordinadorGobierno"].includes(userRole)) {
                isAuthorized = true
            }
        } else {
            switch (targetStatus) {
                case "APROBADO_JEFE":
                    if (["Admin", "CoordinadorGobierno", "DirectoraDAF"].includes(userRole)) isAuthorized = true
                    break
                case "AUTORIZADO":
                    if (["Admin", "DirectoraDAF"].includes(userRole)) isAuthorized = true
                    break
                case "ENTREGADO":
                    // Quien tiene la plata
                    if (["Admin", "ResponsableCaja", "ContadorGeneral"].includes(userRole)) isAuthorized = true

                    // Validar fondos disponibles en la Caja Chica antes de entregar
                    if (movement.pettyCash.montoActual.minus(movement.monto).lessThan(0)) {
                        return NextResponse.json({ error: "FONDOS INSUFICIENTES EN CAJA CHICA" }, { status: 400 })
                    }
                    break
                case "LIQUIDADO":
                    if (["Admin", "ContadorGeneral", "ResponsableContabilidad"].includes(userRole)) isAuthorized = true
                    break
                default:
                    isAuthorized = false
            }
        }

        if (!isAuthorized) {
            return NextResponse.json({ error: "No tiene permisos para ejecutar esta acción" }, { status: 403 })
        }

        // Preparar actualización dinámica
        let updateData: any = {
            estado: targetStatus as MovementStatus
        }

        if (action === "REJECT") {
            updateData.rejectionReason = reason
        } else {
            // Registrar firma según el paso
            if (targetStatus === "APROBADO_JEFE") updateData.approvedById = userId
            if (targetStatus === "AUTORIZADO") updateData.authorizedById = userId
            if (targetStatus === "ENTREGADO") {
                updateData.paidById = userId
                // DESCONTAR SALDO DE CAJA CHICA AQUÍ
                await prisma.pettyCash.update({
                    where: { id: movement.pettyCashId },
                    data: {
                        montoActual: {
                            decrement: movement.monto
                        }
                    }
                })
            }
            if (targetStatus === "LIQUIDADO") updateData.liquidatedById = userId
        }

        // Ejecutar actualización
        const updatedMovement = await prisma.pettyCashMovement.update({
            where: { id: movementId },
            data: updateData
        })

        // Audit Log
        await prisma.auditLog.create({
            data: {
                accion: "UPDATE",
                entidad: "PettyCashMovement",
                entidadId: movementId,
                descripcion: `Cambio de estado a ${targetStatus} por ${session.user.name}`,
                usuarioId: userId,
                datosAnteriores: { estado: movement.estado },
                datosNuevos: { estado: targetStatus }
            }
        })

        return NextResponse.json(updatedMovement)

    } catch (error) {
        console.error("Error workflow:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
