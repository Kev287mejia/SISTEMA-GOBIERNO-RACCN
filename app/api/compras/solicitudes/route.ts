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
        const { departamento, prioridad, justificacion, items } = body

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "La solicitud debe tener al menos un ítem" }, { status: 400 })
        }

        const result = await prisma.$transaction(async (tx) => {
            // Generate Correlative REQ-YYYY-XXXX
            const year = new Date().getFullYear()
            const count = await tx.purchaseRequest.count({
                where: {
                    createdAt: {
                        gte: new Date(`${year}-01-01`),
                        lt: new Date(`${year + 1}-01-01`)
                    }
                }
            })

            const sequence = (count + 1).toString().padStart(4, '0')
            const numero = `REQ-${year}-${sequence}`

            // Create Request
            const request = await tx.purchaseRequest.create({
                data: {
                    numero,
                    solicitanteId: session.user.id,
                    departamento,
                    prioridad,
                    justificacion,
                    items: {
                        create: items.map((item: any) => ({
                            descripcion: item.descripcion,
                            cantidad: item.cantidad,
                            unidadMedida: item.unidadMedida,
                            estimadoUnitario: item.estimadoUnitario
                        }))
                    }
                }
            })
            return request
        })

        return NextResponse.json({
            success: true,
            message: "Requisición generada correctamente",
            data: result
        }, { status: 201 })

    } catch (e: any) {
        console.error("Error creating purchase request:", e)
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
        const [requests, stats] = await Promise.all([
            prisma.purchaseRequest.findMany({
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    items: true,
                    solicitante: {
                        select: { nombre: true, apellido: true, email: true }
                    }
                }
            }),
            prisma.purchaseRequest.groupBy({
                by: ['estado'],
                _count: {
                    id: true
                }
            })
        ])

        const pendingCount = stats.find(s => s.estado === 'PENDIENTE_APROBACION')?._count.id || 0

        return NextResponse.json({
            data: requests,
            stats: {
                pending: pendingCount,
                total: stats.reduce((acc, curr) => acc + curr._count.id, 0)
            }
        })

    } catch (e: any) {
        console.error("Error fetching purchase requests:", e)
        return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 })
    }
}
