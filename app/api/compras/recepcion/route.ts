
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
        const { orderId } = body

        if (!orderId) {
            return NextResponse.json({ error: "ID de orden requerido" }, { status: 400 })
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Fetch Order
            const order = await tx.purchaseOrder.findUnique({
                where: { id: orderId },
                include: { items: true }
            })

            if (!order) {
                throw new Error("Orden de compra no encontrada")
            }

            if (order.estado === 'COMPLETADO') {
                throw new Error("Esta orden ya ha sido recibida anteriormente")
            }

            if (order.estado === 'BORRADOR' || order.estado === 'ANULADO') {
                throw new Error("No se puede recibir una orden en estado Borrador o Anulada")
            }

            // 2. Process Items
            for (const item of order.items) {
                let inventoryItemId = item.inventarioId

                // A. If item is not linked to inventory, create or find it
                if (!inventoryItemId) {
                    // Try to find by name first to avoid duplicates
                    // Note: This is a simple match. In production, we might want manual linking.
                    const existingItem = await tx.inventoryItem.findFirst({
                        where: { nombre: item.descripcion }
                    })

                    if (existingItem) {
                        inventoryItemId = existingItem.id
                    } else {
                        // Create New Inventory Item
                        // Generate Code: ART-{Timestamp-Last4}
                        const timestamp = Date.now().toString()
                        const code = `ART-${timestamp.slice(-6)}-${Math.floor(Math.random() * 1000)}`

                        const newItem = await tx.inventoryItem.create({
                            data: {
                                codigo: code,
                                nombre: item.descripcion,
                                unidadMedida: item.unidadMedida,
                                categoria: 'GENERAL', // Default category
                                costoUnitario: item.precioUnitario,
                                stockActual: 0,
                                stockMinimo: 5,
                                metodoKardex: 'PROMEDIO',
                                creadoPorId: session.user.id
                            }
                        })
                        inventoryItemId = newItem.id
                    }

                    // Link Order Item to Inventory Item
                    await tx.purchaseOrderItem.update({
                        where: { id: item.id },
                        data: { inventarioId: inventoryItemId }
                    })
                }

                // B. Create Inventory Transaction (Ingreso)
                await tx.inventoryTransaction.create({
                    data: {
                        tipo: 'ENTRADA',
                        itemId: inventoryItemId,
                        cantidad: item.cantidad,
                        costoUnitario: item.precioUnitario,
                        costoTotal: item.total,
                        usuarioId: session.user.id,
                        observaciones: `Recepción de Orden de Compra #${order.numero}`,
                        numeroDocumento: order.numero,
                        fecha: new Date()
                    }
                })

                // C. Update Inventory Stock & Cost
                // Update Weighted Average Cost (Costo Promedio)
                const currentItem = await tx.inventoryItem.findUnique({ where: { id: inventoryItemId } })

                if (currentItem) {
                    const currentTotalValue = Number(currentItem.stockActual) * Number(currentItem.costoUnitario)
                    const incomingTotalValue = Number(item.cantidad) * Number(item.precioUnitario)
                    const newTotalStock = Number(currentItem.stockActual) + Number(item.cantidad)

                    let newAverageCost = Number(item.precioUnitario)
                    if (newTotalStock > 0) {
                        newAverageCost = (currentTotalValue + incomingTotalValue) / newTotalStock
                    }

                    await tx.inventoryItem.update({
                        where: { id: inventoryItemId },
                        data: {
                            stockActual: { increment: item.cantidad },
                            costoUnitario: newAverageCost,
                            updatedAt: new Date()
                        }
                    })
                }
            }

            // 3. Update Order Status
            await tx.purchaseOrder.update({
                where: { id: orderId },
                data: {
                    estado: 'COMPLETADO',
                    fechaEntrega: new Date() // Set actual delivery date
                }
            })

            return { success: true, orderNumber: order.numero }
        })

        return NextResponse.json({
            success: true,
            message: `Orden ${result.orderNumber} recibida y procesada en almacén correctamente`,
            data: result
        })

    } catch (error: any) {
        console.error("Error receiving order:", error)
        return NextResponse.json(
            { error: error.message || "Error al procesar la recepción" },
            { status: 500 }
        )
    }
}
