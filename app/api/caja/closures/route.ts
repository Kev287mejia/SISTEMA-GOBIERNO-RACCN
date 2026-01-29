import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role, AuditAction } from "@prisma/client"
import { emitCajaEvent, CajaEvent } from "@/lib/socket"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        const closures = await prisma.cashClosure.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                usuario: {
                    select: {
                        nombre: true,
                        apellido: true
                    }
                }
            }
        })

        return NextResponse.json(closures)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user.role !== Role.ResponsableCaja && session.user.role !== Role.Admin)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { action, montoInicial } = body // action: 'open' | 'close'

        if (action === 'open') {
            // Check if there's already an open closure
            const existingOpen = await prisma.cashClosure.findFirst({
                where: {
                    usuarioId: session.user.id,
                    estado: "ABIERTO"
                }
            })

            if (existingOpen) {
                return new NextResponse("Ya existe un cierre de caja abierto", { status: 400 })
            }

            const closure = await prisma.cashClosure.create({
                data: {
                    fechaInicio: new Date(),
                    fechaFin: new Date(), // Will be updated on close
                    montoInicial: montoInicial || 0,
                    totalIngresos: 0,
                    totalEgresos: 0,
                    montoFinal: montoInicial || 0,
                    estado: "ABIERTO",
                    usuarioId: session.user.id
                }
            })

            return NextResponse.json(closure)
        } else if (action === 'close') {
            const activeClosure = await prisma.cashClosure.findFirst({
                where: {
                    usuarioId: session.user.id,
                    estado: "ABIERTO"
                },
                include: {
                    movements: true
                }
            })

            if (!activeClosure) {
                return new NextResponse("No hay un cierre de caja abierto para cerrar", { status: 400 })
            }

            // Calculate totals
            const totalIngresos = activeClosure.movements
                .filter(m => m.tipo === "INGRESO")
                .reduce((acc, m) => acc + Number(m.monto), 0)

            const totalEgresos = activeClosure.movements
                .filter(m => m.tipo === "EGRESO")
                .reduce((acc, m) => acc + Number(m.monto), 0)

            const montoFinal = Number(activeClosure.montoInicial) + totalIngresos - totalEgresos

            const updatedClosure = await prisma.cashClosure.update({
                where: { id: activeClosure.id },
                data: {
                    fechaFin: new Date(),
                    totalIngresos,
                    totalEgresos,
                    montoFinal,
                    estado: "CERRADO"
                }
            })

            // Audit Log
            await prisma.auditLog.create({
                data: {
                    accion: AuditAction.UPDATE,
                    entidad: "CashClosure",
                    entidadId: updatedClosure.id,
                    descripcion: `Cierre de caja completado. Saldo final: ${montoFinal}`,
                    datosNuevos: updatedClosure as any,
                    usuarioId: session.user.id
                }
            })

            // Real-time event
            emitCajaEvent(CajaEvent.CLOSURE_SUBMITTED, updatedClosure)

            return NextResponse.json(updatedClosure)
        }

        return new NextResponse("Invalid action", { status: 400 })
    } catch (error) {
        console.error("[CAJA_CLOSURES_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
