import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || (session.user.role !== "Admin" && session.user.role !== "RRHH" && session.user.role !== "DirectoraRRHH")) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const [totalEmployees, activeContracts, pendingRecords, lastPayroll] = await Promise.all([
            prisma.employee.count({ where: { estado: 'ACTIVO' } }),
            prisma.contract.count({ where: { estado: 'ACTIVO' } }),
            prisma.hRRecord.count({ where: { estado: 'PENDIENTE' } }),
            prisma.payroll.findFirst({
                orderBy: { createdAt: 'desc' },
                include: { items: true }
            })
        ])

        const lastPayrollAmount = lastPayroll?.totalMonto || 0

        return NextResponse.json({
            totalEmployees,
            activeContracts,
            pendingReviews: pendingRecords,
            lastPayrollAmount
        })
    } catch (error: any) {
        console.error("Error fetching RRHH statistics:", error)
        return NextResponse.json({ error: "Error al obtener estadísticas de RRHH" }, { status: 500 })
    }
}
