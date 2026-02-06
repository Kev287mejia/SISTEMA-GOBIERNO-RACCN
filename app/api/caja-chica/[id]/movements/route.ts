import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { emitPettyCashEvent, PettyCashEvent } from "@/lib/socket"
import { getNextEntryNumber } from "@/lib/accounting"
import { EntryStatus, EntryType } from "@prisma/client"

// Get movements for a specific box
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const movements = await (prisma as any).pettyCashMovement.findMany({
            where: { pettyCashId: params.id },
            include: {
                usuario: {
                    select: { nombre: true, apellido: true, email: true }
                },
                approvedBy: { select: { nombre: true, apellido: true } },
                authorizedBy: { select: { nombre: true, apellido: true } },
                paidBy: { select: { nombre: true, apellido: true } },
                liquidatedBy: { select: { nombre: true, apellido: true } },

                accountingEntry: {
                    select: { numero: true, estado: true }
                }
            },
            orderBy: { fecha: 'desc' }
        })

        return NextResponse.json(movements)
    } catch (error: any) {
        console.error("Error fetching movements:", error)
        return NextResponse.json({ error: "Error al obtener movimientos" }, { status: 500 })
    }
}

// Register a new movement (Income, Expense, Adjustment)
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        if ((session.user.role as any) !== "Admin" && (session.user.role as any) !== "ResponsableCredito") {
            return NextResponse.json({ error: "No tiene permisos para registrar movimientos" }, { status: 403 })
        }

        const body = await request.json()
        const { tipo, monto, descripcion, referencia } = body

        if (!tipo || !monto || !descripcion) {
            return NextResponse.json({ error: "Tipo, monto y descripción son requeridos" }, { status: 400 })
        }

        // Transactions to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            const pettyCash = await (tx as any).pettyCash.findUnique({
                where: { id: params.id }
            })

            if (!pettyCash) throw new Error("Caja Chica no encontrada")
            if (pettyCash.estado !== 'ACTIVA') throw new Error("La caja chica no está activa")

            // 1. Create Accounting Entry (Borrador) if requested
            let accountingId = null
            if (body.crearAsiento !== false) {
                const entryNumero = await getNextEntryNumber(pettyCash.institution)
                const entry = await tx.accountingEntry.create({
                    data: {
                        numero: entryNumero,
                        tipo: tipo === 'INGRESO' ? EntryType.INGRESO : EntryType.EGRESO,
                        fecha: new Date(),
                        descripcion: `[CAJA CHICA: ${pettyCash.nombre}] ${descripcion}`,
                        monto: Number(monto),
                        institucion: pettyCash.institution,
                        cuentaContable: body.cuentaContable || "1102-01-01",
                        centroCosto: body.centroCosto || "ADMINISTRACION",
                        documentoRef: referencia,
                        estado: EntryStatus.PENDIENTE,
                        creadoPorId: session.user.id,
                        evidenciaUrls: body.evidenciaUrls || []
                    }
                })
                accountingId = entry.id
            }

            // 2. Create Petty Cash Movement linked to accounting
            const movement = await (tx as any).pettyCashMovement.create({
                data: {
                    pettyCashId: params.id,
                    tipo,
                    monto: Number(monto),
                    descripcion,
                    referencia,
                    usuarioId: session.user.id,
                    estado: 'SOLICITADO',
                    accountingEntryId: accountingId,
                    evidenciaUrls: body.evidenciaUrls || []
                }
            })

            // Update actual balance
            let nuevoMonto = Number(pettyCash.montoActual)
            if (tipo === 'INGRESO') nuevoMonto += Number(monto)
            else if (tipo === 'EGRESO') nuevoMonto -= Number(monto)
            else if (tipo === 'AJUSTE') nuevoMonto = Number(monto) // Logic for adjustment might vary

            await (tx as any).pettyCash.update({
                where: { id: params.id },
                data: { montoActual: nuevoMonto }
            })

            return movement
        })

        // Emit real-time event
        emitPettyCashEvent(PettyCashEvent.MOVEMENT_CREATED, {
            boxId: params.id,
            movement: result
        })
        emitPettyCashEvent(PettyCashEvent.BALANCE_CHANGED, {
            boxId: params.id,
            newBalance: result.pettyCashId // simplified
        })

        // Real-time notification
        try {
            const { createNotification } = await import("@/lib/notifications")
            const { Role: PrismaRole, NotificationType } = await import("@prisma/client")
            await createNotification({
                type: tipo === 'EGRESO' ? NotificationType.WARNING : NotificationType.SUCCESS,
                title: `Movimiento de Caja Chica: ${tipo}`,
                message: `${session.user.name} registró un ${tipo.toLowerCase()} en Caja Chica por C$ ${Number(monto).toLocaleString()}`,
                link: `/caja-chica/${params.id}`,
                roles: [PrismaRole.Admin, PrismaRole.ContadorGeneral, PrismaRole.ResponsableCredito]
            })
        } catch (notifError) {
            console.error("Failed to send Petty Cash notification:", notifError)
        }

        // Log Audit
        await prisma.auditLog.create({
            data: {
                accion: 'CREATE',
                entidad: 'PettyCashMovement',
                entidadId: result.id,
                descripcion: `${session.user.name} registró movimiento de caja chica: ${tipo} de ${monto}`,
                usuarioId: session.user.id,
                datosNuevos: result as any
            }
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("Error creating movement:", error)
        return NextResponse.json({ error: error.message || "Error al registrar movimiento" }, { status: 500 })
    }
}
