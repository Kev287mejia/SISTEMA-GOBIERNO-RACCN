
import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"
import { Role, AuditAction } from "@prisma/client"

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req })
        if (!token) return new NextResponse("Unauthorized", { status: 401 })

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

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req })
        // Allow Admin and ResponsableCaja for POST operations
        const role = token?.role as Role
        if (!token || (role !== Role.ResponsableCaja && role !== Role.Admin)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { action, montoInicial, detallesApertura } = body // action: 'open' | 'close'
        const userId = token.sub as string // 'sub' holds the user ID in JWT

        console.log(`[CAJA_CLOSURES_POST] User: ${userId}, Action: ${action}`)

        if (action === 'open') {
            // Check if there's already an open closure
            const existingOpen = await prisma.cashClosure.findFirst({
                where: {
                    usuarioId: userId,
                    estado: "ABIERTO"
                }
            })

            if (existingOpen) {
                return new NextResponse("Ya existe un cierre de caja abierto", { status: 400 })
            }

            const closure = await prisma.cashClosure.create({
                data: {
                    fechaInicio: new Date(),
                    fechaFin: new Date(), // Placeholder
                    montoInicial: montoInicial || 0,
                    totalIngresos: 0,
                    totalEgresos: 0,
                    montoFinal: montoInicial || 0,
                    estado: "ABIERTO",
                    usuarioId: userId
                }
            })

            // Registrar Auditoría con el detalle de billetes
            if (detallesApertura) {
                await prisma.auditLog.create({
                    data: {
                        accion: AuditAction.CREATE,
                        entidad: "CashClosure",
                        entidadId: closure.id,
                        descripcion: `Apertura de Caja con Arqueo Inicial: ${montoInicial}`,
                        usuarioId: userId,
                        datosNuevos: {
                            ...detallesApertura,
                            manualTotal: detallesApertura.manualTotal
                        } as any
                    }
                })
            }

            return NextResponse.json(closure)

        } else if (action === 'close') {
            const activeClosure = await prisma.cashClosure.findFirst({
                where: {
                    usuarioId: userId,
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
                    usuarioId: userId
                }
            })


            // Real-time event - DISABLED due to import issues
            // emitCajaEvent("caja:closure-submitted" as any, updatedClosure)

            return NextResponse.json(updatedClosure)
        }

        return new NextResponse("Invalid action", { status: 400 })

    } catch (error: any) {
        console.error("[CAJA_CLOSURES_POST]", error)
        const msg = error.message || "Unknown Error"
        return new NextResponse(`Internal Error: ${msg}`, { status: 500 })
    }
}
