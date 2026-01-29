import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createBudgetItem } from "@/lib/budget"

/**
 * GET /api/budget/items
 * List budget items
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        console.log("[BUDGET_ITEMS_GET] Session:", session?.user?.email || "No session")

        if (!session?.user) {
            console.log("[BUDGET_ITEMS_GET] Unauthorized - No session")
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const centroRegional = searchParams.get("centroRegional")
        const tipoGasto = searchParams.get("tipoGasto")

        console.log("[BUDGET_ITEMS_GET] Filters:", { centroRegional, tipoGasto })

        const where: any = { deletedAt: null }
        if (centroRegional && centroRegional !== 'all') where.centroRegional = centroRegional
        if (tipoGasto && tipoGasto !== 'all') where.tipoGasto = tipoGasto

        console.log("[BUDGET_ITEMS_GET] Where clause:", where)

        const items = await prisma.budgetItem.findMany({
            where,
            orderBy: {
                codigo: 'asc',
            },
            include: {
                creadoPor: {
                    select: {
                        nombre: true,
                        apellido: true,
                    },
                },
            },
        })

        console.log("[BUDGET_ITEMS_GET] Found items:", items.length)

        return NextResponse.json({
            data: items.map(item => ({
                ...item,
                montoAsignado: Number(item.montoAsignado),
                montoEjecutado: Number(item.montoEjecutado),
                montoDisponible: Number(item.montoDisponible),
            })),
        })
    } catch (error: any) {
        console.error("[BUDGET_ITEMS_GET] Error:", error)
        return NextResponse.json(
            { error: "Error al obtener las partidas presupuestarias" },
            { status: 500 }
        )
    }
}

/**
 * POST /api/budget/items
 * Create a new budget item
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const body = await request.json()
        const {
            codigo,
            nombre,
            descripcion,
            categoria,
            anio,
            montoAsignado,
            fechaInicio,
            fechaFin,
            tipoGasto,
            centroRegional
        } = body

        if (!codigo || !nombre || !categoria || !anio || !montoAsignado || !tipoGasto || !centroRegional) {
            return NextResponse.json(
                { error: "Faltan campos requeridos (incluyendo tipo de gasto y centro regional)" },
                { status: 400 }
            )
        }

        const item = await createBudgetItem({
            codigo,
            nombre,
            descripcion,
            categoria,
            anio: parseInt(anio),
            montoAsignado: parseFloat(montoAsignado),
            tipoGasto,
            centroRegional,
            fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
            fechaFin: fechaFin ? new Date(fechaFin) : undefined,
        })

        return NextResponse.json(
            {
                data: {
                    ...item,
                    montoAsignado: Number(item.montoAsignado),
                    montoEjecutado: Number(item.montoEjecutado),
                    montoDisponible: Number(item.montoDisponible),
                },
                message: "Partida presupuestaria creada exitosamente",
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("Error creating budget item:", error)
        return NextResponse.json(
            { error: error.message || "Error al crear la partida presupuestaria" },
            { status: 500 }
        )
    }
}
