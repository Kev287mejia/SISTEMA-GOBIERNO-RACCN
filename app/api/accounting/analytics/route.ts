
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user && process.env.NODE_ENV === "production" && !process.env.VERCEL_URL) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        // 1. Balance Trend (Ingresos vs Egresos per Month) - Simulated for now or aggregated
        // Real logic: Group AccountingEntry by month and type.
        // Since sqlite/prisma group by date is tricky, we might fetch all and aggregate in memory if dataset is small, or use raw query.
        // For production scale, raw query is better. For this demo, we'll simulate a bit or use raw query.

        // Let's try a robust Prisma aggregation if possible, or simple group by type for the whole year.
        // Actually, let's fetch entries from current year.
        const startOfYear = new Date(new Date().getFullYear(), 0, 1)

        const entries = await prisma.accountingEntry.findMany({
            where: {
                fecha: { gte: startOfYear },
                deletedAt: null,
                estado: 'APROBADO' // Only approved for financial stats
            },
            select: {
                tipo: true,
                monto: true,
                fecha: true
            }
        })

        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

        // Process for Trend Chart
        const monthlyStats = Array(12).fill(0).map((_, i) => ({
            name: monthNames[i],
            ingresos: 0,
            egresos: 0
        }))

        entries.forEach(e => {
            const month = new Date(e.fecha).getMonth()
            // Handle Prisma Decimal safely by converting to string first
            const val = Number(e.monto.toString())

            if (e.tipo === 'INGRESO') {
                monthlyStats[month].ingresos += val
            } else if (e.tipo === 'EGRESO') {
                monthlyStats[month].egresos += val
            }
        })

        console.log("Analytics processed entries:", entries.length)

        // Filter out future months if they are zero? Or keep for projection feel.
        // Let's keep current month and previous.
        const currentMonth = new Date().getMonth()
        const trendData = monthlyStats.slice(0, currentMonth + 1)

        // 2. Status Distribution (Efficiency)
        // Group by Status
        const statusGroups = await prisma.accountingEntry.groupBy({
            by: ['estado'],
            _count: { id: true },
            where: { deletedAt: null }
        })

        const statusData = statusGroups.map(g => ({
            name: g.estado,
            value: g._count.id
        }))

        return NextResponse.json({
            trendData,
            statusData
        })
    } catch (error) {
        console.error("Accounting Analytics Error:", error)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
