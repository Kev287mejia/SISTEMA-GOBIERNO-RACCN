import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/budget/reports
 * Budget Reports API
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const searchParams = request.nextUrl.searchParams
        const type = searchParams.get("type") // 'execution-regional', 'comparative', 'debt-investment'
        const anio = parseInt(searchParams.get("anio") || new Date().getFullYear().toString())

        if (type === 'execution-regional') {
            const regionalStats = await (prisma as any).budgetItem.groupBy({
                by: ['centroRegional', 'tipoGasto'],
                where: { anio, deletedAt: null },
                _sum: {
                    montoAsignado: true,
                    montoEjecutado: true,
                    montoDisponible: true
                }
            })
            return NextResponse.json({ data: regionalStats })
        }

        if (type === 'comparative') {
            const items = await (prisma as any).budgetItem.findMany({
                where: { anio, deletedAt: null },
                orderBy: { codigo: 'asc' }
            })
            return NextResponse.json({ data: items })
        }

        if (type === 'debt-investment') {
            // Pending balances for Investment expenditures
            const investmentItems = await (prisma as any).budgetItem.findMany({
                where: {
                    anio,
                    tipoGasto: 'INVERSION' as any,
                    deletedAt: null
                },
                orderBy: { centerRegional: 'asc' }
            })
            return NextResponse.json({ data: investmentItems })
        }

        return NextResponse.json({ error: "Tipo de reporte no especificado" }, { status: 400 })
    } catch (error: any) {
        console.error("Error generating budget report:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
