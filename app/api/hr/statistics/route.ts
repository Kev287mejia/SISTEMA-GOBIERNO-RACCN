import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || (session.user.role !== "Admin" && session.user.role !== "RRHH" && session.user.role !== "DirectoraRRHH" && session.user.role !== "ContadorGeneral")) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const [totalEmployees, activeContracts, pendingRecords, lastPayroll, totalPositions, pendingPayrolls] = await Promise.all([
            prisma.employee.count(),
            prisma.contract.count({ where: { estado: 'ACTIVO' } }),
            prisma.hRRecord.count({ where: { estado: 'PENDIENTE' } }),
            prisma.payroll.findFirst({
                orderBy: { createdAt: 'desc' },
                include: { items: true }
            }),
            prisma.position.count({ where: { activo: true } }),
            prisma.payroll.count({ where: { estado: 'BORRADOR' } })
        ])

        const lastPayrollAmount = lastPayroll?.totalMonto || 0

        return NextResponse.json({
            totalEmployees,
            activeContracts,
            pendingReviews: pendingRecords,
            lastPayrollAmount,
            totalPositions,
            pendingPayrolls
        })
    } catch (error: any) {
        console.error("Error fetching RRHH statistics:", error)
        return NextResponse.json({ error: "Error al obtener estadísticas de RRHH" }, { status: 500 })
    }
}
