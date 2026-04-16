import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session?.user?.role !== Role.Admin && session?.user?.role !== Role.Auditor)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const now = new Date()
        const startOfCurrentMonth = startOfMonth(now)
        const endOfCurrentMonth = endOfMonth(now)
        const startOfPrevMonth = startOfMonth(subMonths(now, 1))

        const [
            totalEvents,
            criticalActions,
            activeUsersCount,
            monthEvents,
            prevMonthEvents
        ] = await Promise.all([
            prisma.auditLog.count(),
            prisma.auditLog.count({
                where: {
                    accion: { in: ['DELETE', 'REJECT', 'ANULADO'] as any }
                }
            }),
            prisma.user.count({
                where: {
                    auditLogs: { some: { fecha: { gte: startOfCurrentMonth } } }
                }
            }),
            prisma.auditLog.count({
                where: { fecha: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } }
            }),
            prisma.auditLog.count({
                where: { fecha: { gte: startOfPrevMonth, lte: startOfCurrentMonth } }
            })
        ])

        const growth = prevMonthEvents > 0
            ? ((monthEvents - prevMonthEvents) / prevMonthEvents) * 100
            : 0

        return NextResponse.json({
            totalEvents,
            criticalActions,
            activeUsersCount,
            monthEvents,
            growth: growth.toFixed(1)
        })
    } catch (error) {
        console.error("[AUDIT_STATS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
