import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        const searchParams = req.nextUrl.searchParams
        const startDate = searchParams.get("startDate")
        const endDate = searchParams.get("endDate")
        const centroRegional = searchParams.get("centroRegional")

        const where: any = {}
        if (startDate && endDate) {
            where.fecha = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        }
        if (centroRegional && centroRegional !== "all") {
            where.budgetItem = {
                centroRegional: centroRegional
            }
        }

        // Fetch executions grouped by cost center
        const executions = await prisma.budgetExecution.findMany({
            where,
            include: {
                budgetItem: true
            }
        })

        // Process data to group by Cost Center
        const reportData: Record<string, any> = {}

        executions.forEach(ex => {
            const cc = ex.centroCosto || "SIN_CENTRO_COSTO"
            if (!reportData[cc]) {
                reportData[cc] = {
                    centroCosto: cc,
                    totalEjecutado: 0,
                    items: {}
                }
            }

            reportData[cc].totalEjecutado += Number(ex.monto)

            const itemCode = ex.budgetItem.codigo
            if (!reportData[cc].items[itemCode]) {
                reportData[cc].items[itemCode] = {
                    codigo: itemCode,
                    nombre: ex.budgetItem.nombre,
                    ejecutado: 0
                }
            }
            reportData[cc].items[itemCode].ejecutado += Number(ex.monto)
        })

        // Convert to array and sort
        const finalReport = Object.values(reportData).map(cc => ({
            ...cc,
            items: Object.values(cc.items)
        })).sort((a, b) => b.totalEjecutado - a.totalEjecutado)

        return NextResponse.json(finalReport)

    } catch (error) {
        console.error("[BUDGET_CC_REPORT_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
