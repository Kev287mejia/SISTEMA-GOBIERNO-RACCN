
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    try {
        const order = await prisma.purchaseOrder.findUnique({
            where: { id: params.id },
            include: {
                proveedor: true,
                items: true,
                elaboradoPor: {
                    select: { nombre: true, apellido: true }
                },
                budgetItem: {
                    select: { codigo: true, nombre: true }
                },
                checks: true
            }
        })

        if (!order) {
            return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
        }

        return NextResponse.json({ data: order })

    } catch (error: any) {
        console.error("Error fetching order:", error)
        return NextResponse.json(
            { error: error.message || "Error al obtener la orden" },
            { status: 500 }
        )
    }
}
