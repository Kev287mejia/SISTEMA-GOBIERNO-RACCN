import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const {
            proveedorId,
            budgetItemId, // New Field
            fechaEmision,
            fechaEntrega,
            moneda,
            condicionesPago,
            lugarEntrega,
            items,
            subtotal,
            tax,
            total
        } = body

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "La orden debe tener al menos un ítem" }, { status: 400 })
        }

        const result = await prisma.$transaction(async (tx) => {

            // 1. Budget Certification (If budgetItemId is provided)
            if (budgetItemId) {
                const budgetItem = await tx.budgetItem.findUnique({
                    where: { id: budgetItemId }
                })

                if (!budgetItem) {
                    throw new Error("La partida presupuestaria seleccionada no existe")
                }

                if (budgetItem.montoDisponible.lessThan(total)) {
                    throw new Error(`Fondos insuficientes en la partida presupuestaria. Disponible: ${budgetItem.montoDisponible}, Requerido: ${total}`)
                }

                // Reserve funds (Decrease available amount)
                await tx.budgetItem.update({
                    where: { id: budgetItemId },
                    data: {
                        montoDisponible: { decrement: total }
                        // montoEjecutado increases only when paid/received? 
                        // For now we treat Order as a "commitment" (Comprometido)
                        // Ideally we should have a 'montoComprometido' field, but decreasing available works for blocking funds.
                    }
                })
            }

            // 2. Generate Correlative OC-YYYY-XXXX
            const year = new Date().getFullYear()
            const count = await tx.purchaseOrder.count({
                where: {
                    fechaEmision: {
                        gte: new Date(`${year}-01-01`),
                        lt: new Date(`${year + 1}-01-01`)
                    }
                }
            })

            const sequence = (count + 1).toString().padStart(4, '0')
            const numero = `OC-${year}-${sequence}`

            // 3. Create Order
            const order = await tx.purchaseOrder.create({
                data: {
                    numero,
                    proveedorId,
                    budgetItemId, // Link to Budget
                    elaboradoPorId: session.user.id,
                    fechaEmision: new Date(fechaEmision),
                    fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : null,
                    moneda,
                    condicionesPago,
                    lugarEntrega,
                    subtotal,
                    impuestos: tax,
                    total,
                    items: {
                        create: items.map((item: any) => ({
                            descripcion: item.descripcion,
                            cantidad: item.cantidad,
                            unidadMedida: item.unidadMedida,
                            precioUnitario: item.precioUnitario,
                            impuesto: item.impuesto || 0,
                            descuento: item.descuento || 0,
                            total: item.total
                        }))
                    }
                }
            })
            return order
        })

        return NextResponse.json({
            success: true,
            message: "Orden de Compra emitida y fondos certificados correctamente",
            data: result
        }, { status: 201 })

    } catch (e: any) {
        console.error("Error creating purchase order:", e)
        return NextResponse.json({ error: e.message || "Error interno del servidor" }, { status: 500 })
    }
}
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "10")

    try {
        const [orders, statsWrapper] = await Promise.all([
            prisma.purchaseOrder.findMany({
                take: limit,
                orderBy: { fechaEmision: "desc" },
                include: {
                    proveedor: {
                        select: { nombre: true, ruc: true } // Assuming 'Entity' model has 'nombre'
                    },
                    items: true
                }
            }),
            // Get aggregated sums
            prisma.purchaseOrder.aggregate({
                _sum: {
                    total: true
                },
                _count: {
                    id: true
                },
                where: {
                    estado: {
                        in: ['AUTORIZADO', 'ENVIADO_PROVEEDOR', 'PARCIALMENTE_RECIBIDO'] // Active orders
                    }
                }
            })
        ])

        // Get count of active orders specifically
        const activeCount = await prisma.purchaseOrder.count({
            where: {
                estado: {
                    in: ['AUTORIZADO', 'ENVIADO_PROVEEDOR', 'PARCIALMENTE_RECIBIDO']
                }
            }
        })

        // Get total executed (COMPLETADO)
        const executedStats = await prisma.purchaseOrder.aggregate({
            _sum: { total: true },
            where: { estado: 'COMPLETADO' }
        })

        return NextResponse.json({
            data: orders,
            stats: {
                activeOrders: activeCount,
                budgetCommitted: statsWrapper._sum.total || 0,
                totalExecuted: executedStats._sum.total || 0
            }
        })

    } catch (e: any) {
        console.error("Error fetching purchase orders:", e)
        return NextResponse.json({ error: "Error al obtener órdenes" }, { status: 500 })
    }
}
