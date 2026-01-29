
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        // 1. Line Chart Data: Monthly Execution Trend
        // Group executions by 'mes'
        const monthlyData = await prisma.budgetExecution.groupBy({
            by: ['mes'],
            _sum: {
                monto: true
            },
            orderBy: {
                mes: 'asc'
            }
        })

        // Map month numbers to names (optional, can be done in frontend, but let's standardize)
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

        const trendData = monthlyData.map(item => ({
            month: monthNames[item.mes - 1] || `Mes ${item.mes}`,
            amount: Number(item._sum.monto || 0)
        }))

        // Ensure all months are present for a smooth line chart (optional, but good for UX)
        // Let's at least fill gaps if strictly needed, but Recharts handles gaps okay. 
        // Better to have 0s for missing months so lines don't jump.
        const fullTrendData = monthNames.map((name, index) => {
            const found = trendData.find(d => d.month === name)
            return {
                name,
                gasto: found ? found.amount : 0
            }
        })


        // 2. Pie Chart Data: Spending by Department (Category)
        // Group budget items by 'categoria' (or 'tipoGasto' / 'centroRegional' depending on user need 'Department')
        // The prompt says "RRHH vs Proyectos", suggesting 'categoria' or maybe a dedicated 'departamento' field if it existed.
        // BudgetItem has 'categoria'. Let's use that.
        const categoryData = await prisma.budgetItem.groupBy({
            by: ['categoria'],
            _sum: {
                montoEjecutado: true
            },
            where: {
                montoEjecutado: {
                    gt: 0
                }
            }
        })

        const pieData = categoryData.map(item => ({
            name: item.categoria,
            value: Number(item._sum.montoEjecutado || 0)
        }))

        return NextResponse.json({
            trendData: fullTrendData,
            pieData: pieData
        })

    } catch (error: any) {
        console.error("Error fetching budget analytics:", error)
        return NextResponse.json(
            { error: "Error al obtener estadísticas" },
            { status: 500 }
        )
    }
}
