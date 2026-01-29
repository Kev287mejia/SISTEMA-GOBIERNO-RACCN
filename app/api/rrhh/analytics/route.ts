
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        // 1. Employee Distribution by Department
        // We need to fetch active employees and their position's department
        // Since we might not have a direct relation easy to group by in one query without join,
        // we'll fetch active employees with their current position.
        // Or better, group by Position.departamento counting active employees.

        // Let's assume most employees have a contract or we look at Position model directly if used for planning.
        // Better: Count employees by parsing their current contract/position.

        // Simpler for now: Group by Position and aggregate.
        // But Position table has 'departamento'.

        // Let's fetch all active contacts and count by department.
        const activeContracts = await prisma.contract.findMany({
            where: {
                estado: "ACTIVO",
                deletedAt: null
            },
            include: {
                cargo: true
            }
        })

        const deptCounts: Record<string, number> = {}
        activeContracts.forEach(c => {
            const dept = c.cargo.departamento || "Sin Departamento"
            deptCounts[dept] = (deptCounts[dept] || 0) + 1
        })

        const distributionData = Object.entries(deptCounts).map(([name, value]) => ({ name, value }))


        // 2. Payroll Trend (Last 6 months)
        // Group Payrolls by month/year and sum total

        // Since sqlite/postgres group by date varies, let's fetch last 10 payrolls
        const recentPayrolls = await prisma.payroll.findMany({
            orderBy: { createdAt: 'desc' }, // or use year/month fields
            take: 6,
            where: { estado: 'CERRADA' } // Only approved payrolls
        })

        // If no closed payrolls, maybe show drafts or empty
        // Or fetch all non-deleted

        // Let's manually sort them to chronological order for the chart
        const payrollTrend = recentPayrolls
            .sort((a, b) => (a.anio - b.anio) || (a.mes - b.mes))
            .map(p => ({
                name: `${p.mes}/${p.anio}`,
                total: Number(p.totalMonto)
            }))


        return NextResponse.json({
            distributionData,
            payrollTrend
        })

    } catch (error) {
        console.error("HR Analytics Error:", error)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
