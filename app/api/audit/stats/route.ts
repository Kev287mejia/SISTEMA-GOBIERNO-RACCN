import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

/**
 * GET /api/audit/stats
 * Returns statistics for the audit dashboard
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user.role !== Role.Admin && session.user.role !== Role.Auditor)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const now = new Date()
        const thirtyDaysAgo = new Date(now)
        thirtyDaysAgo.setDate(now.getDate() - 30)

        // 1. Audit Log Stats (Last 30 days)
        const auditStats = await prisma.auditLog.groupBy({
            by: ['accion'],
            _count: true,
            where: {
                fecha: { gte: thirtyDaysAgo }
            }
        })

        // 2. High Value Entries (> $500,000) - Last 30 days
        const highValueEntriesCount = await prisma.accountingEntry.count({
            where: {
                monto: { gt: 500000 },
                createdAt: { gte: thirtyDaysAgo }
            }
        })

        // 3. Soft Deleted Records count
        const deletedEntriesCount = await prisma.accountingEntry.count({
            where: {
                deletedAt: { not: null }
            }
        })

        // 4. Daily activity for chart (Last 15 days)
        const fifteenDaysAgo = new Date(now)
        fifteenDaysAgo.setDate(now.getDate() - 15)

        // Prisma doesn't support direct date truncation easily without raw queries in some versions,
        // so we'll fetch and aggregate in JS for simplicity/compatibility in this environment.
        const recentLogs = await prisma.auditLog.findMany({
            where: {
                fecha: { gte: fifteenDaysAgo }
            },
            select: {
                fecha: true
            }
        })

        const dailyActivity = recentLogs.reduce((acc: any, log) => {
            const date = log.fecha.toISOString().split('T')[0]
            acc[date] = (acc[date] || 0) + 1
            return acc
        }, {})

        const activityData = Object.entries(dailyActivity).map(([date, count]) => ({
            date,
            count
        })).sort((a, b) => a.date.localeCompare(b.date))

        return NextResponse.json({
            auditStats,
            highValueEntriesCount,
            deletedEntriesCount,
            activityData
        })

    } catch (error) {
        console.error("[AUDIT_STATS_ERROR]", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
