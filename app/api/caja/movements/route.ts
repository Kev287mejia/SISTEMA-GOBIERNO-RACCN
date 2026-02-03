
import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"
import { Role, AuditAction } from "@prisma/client"
// import { emitCajaEvent, CajaEvent } from "@/lib/socket"

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req })
        if (!token) return new NextResponse("Unauthorized", { status: 401 })

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

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req })
        // Allow Admin and ResponsableCaja
        const role = token?.role as Role
        if (!token || (role !== Role.ResponsableCaja && role !== Role.Admin)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { tipo, monto, descripcion, referencia, institucion } = body
        const userId = token.sub as string
        const userName = token.name || "Usuario"

        if (!tipo || !monto || !descripcion) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        // Link to active closure if exists
        const activeClosure = await prisma.cashClosure.findFirst({
            where: {
                usuarioId: userId,
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
                usuarioId: userId,
                closureId: activeClosure?.id
            }
        })

        // Real-time notification for Cash Movement
        try {
            const { createNotification } = await import("@/lib/notifications")
            const { Role: PrismaRole, NotificationType } = await import("@prisma/client")
            await createNotification({
                type: tipo === "EGRESO" ? NotificationType.WARNING : NotificationType.SUCCESS,
                title: `Movimiento de Caja: ${tipo}`,
                message: `${userName} registró un ${tipo.toLowerCase()} por C$ ${Number(monto).toLocaleString()}`,
                link: "/caja",
                roles: [PrismaRole.Admin, PrismaRole.ContadorGeneral, PrismaRole.ResponsableCaja]
            })
        } catch (notifError) {
            console.error("Failed to send Cash notification:", notifError)
        }

        // Audit Log
        await prisma.auditLog.create({
            data: {
                accion: AuditAction.CREATE,
                entidad: "CashMovement",
                entidadId: movement.id,
                descripcion: `Registro de ${tipo} en caja por ${monto}`,
                datosNuevos: movement as any,
                usuarioId: userId
            }
        })

        // Real-time event DISABLED to prevent runtime errors
        // try {
        //     const { emitCajaEvent } = await import("@/lib/socket")
        //     emitCajaEvent("caja:movement-created" as any, movement)
        // } catch (e) { console.error("Socket emit failed", e) }

        return NextResponse.json(movement)
    } catch (error: any) {
        console.error("[CAJA_MOVEMENTS_POST]", error)
        const msg = error.message || "Unknown error"
        return new NextResponse(`Internal Error: ${msg}`, { status: 500 })
    }
}
