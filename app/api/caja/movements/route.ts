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

        const { searchParams } = new URL(req.url)
        const closureId = searchParams.get("closureId")

        const movements = await prisma.cashMovement.findMany({
            where: closureId ? { closureId } : {},
            orderBy: { fecha: 'desc' },
            include: {
                usuario: {
                    select: {
                        nombre: true,
                        apellido: true
                    }
                }
            }
        })

        return NextResponse.json(movements)
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
        const { tipo, monto, descripcion, referencia, institucion } = body

        if (!tipo || !monto || !descripcion) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        // Check for active closure if needed, but the request doesn't explicitly mandate it for movements
        // However, usually movements should be linked to the current open closure.
        const activeClosure = await prisma.cashClosure.findFirst({
            where: {
                usuarioId: session.user.id,
                estado: "ABIERTO"
            }
        })

        const movement = await prisma.cashMovement.create({
            data: {
                tipo,
                monto,
                descripcion,
                referencia,
                institucion: institucion || "GOBIERNO",
                usuarioId: session.user.id,
                closureId: activeClosure?.id
            }
        })

        // Audit Log
        await prisma.auditLog.create({
            data: {
                accion: AuditAction.CREATE,
                entidad: "CashMovement",
                entidadId: movement.id,
                descripcion: `Registro de ${tipo} en caja por ${monto}`,
                datosNuevos: movement as any,
                usuarioId: session.user.id
            }
        })

        // Real-time event
        emitCajaEvent(CajaEvent.MOVEMENT_CREATED, movement)

        return NextResponse.json(movement)
    } catch (error) {
        console.error("[CAJA_MOVEMENTS_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
