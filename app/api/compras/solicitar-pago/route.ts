
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
                include: { proveedor: true, budgetItem: true }
            })

            if (!order) {
                throw new Error("Orden de compra no encontrada")
            }

            if (order.estado !== 'COMPLETADO') {
                throw new Error("La orden debe estar completada (recibida en almacén) para solicitar pago")
            }

            // 2. Check if Payment Request already exists
            const existingCheck = await tx.check.findFirst({
                where: { purchaseOrderId: orderId }
            })

            if (existingCheck) {
                throw new Error(`Ya existe una solicitud de pago para esta orden: ${existingCheck.numero}`)
            }

            // 3. Create Payment Request (Check Record)
            // Generate Request Number: SOL-OC-{OrderNo}
            const requestNumber = `SOL-${order.numero}`

            const check = await tx.check.create({
                data: {
                    numero: requestNumber,
                    tipo: 'EMITIDO',
                    estado: 'CHEQUE_REQUESTED',
                    banco: 'PENDIENTE', // To be filled by Treasurer
                    cuentaBancaria: 'PENDIENTE', // To be filled by Treasurer
                    beneficiario: order.proveedor.nombre,
                    monto: order.total,
                    fecha: new Date(),
                    referencia: `Pago de Orden de Compra ${order.numero}`,
                    usuarioId: session.user.id,
                    entityId: order.proveedorId,
                    purchaseOrderId: order.id,
                    budgetItemId: order.budgetItemId
                }
            })

            return check
        })

        return NextResponse.json({
            success: true,
            message: "Solicitud de pago enviada a Tesorería correctamente",
            data: result
        })

    } catch (error: any) {
        console.error("Error requesting payment:", error)
        return NextResponse.json(
            { error: error.message || "Error al solicitar pago" },
            { status: 500 }
        )
    }
}
