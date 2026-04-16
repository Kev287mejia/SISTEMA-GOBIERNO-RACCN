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

        const allowedRoles = ["Admin", "ResponsableCredito", "ContadorGeneral", "Auditor"]
        if (!allowedRoles.includes(session?.user?.role as any)) {
            return NextResponse.json({ error: "No tiene permisos para generar reportes" }, { status: 403 })
        }
        const searchParams = request.nextUrl.searchParams
        const startDate = searchParams.get("startDate")
        const endDate = searchParams.get("endDate")
        const boxId = searchParams.get("boxId")
        const institution = searchParams.get("institution")

        const where: any = {}
        if (startDate && endDate) {
            where.fecha = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        }
        if (boxId && boxId !== "all") {
            where.pettyCashId = boxId
        }
        if (institution && institution !== "all") {
            where.pettyCash = {
                institution: institution
            }
        }

        const movements = await (prisma as any).pettyCashMovement.findMany({
            where,
            include: {
                pettyCash: true,
                usuario: { select: { nombre: true, apellido: true } }
            },
            orderBy: { fecha: 'asc' }
        })

        // Group by box to get Opening Balance, Income, Expenses, Final Balance
        // This is a simplified report logic
        const reportData = movements.reduce((acc: any, m: any) => {
            const boxName = m.pettyCash.nombre
            if (!acc[boxName]) {
                acc[boxName] = {
                    boxName,
                    openingBalance: Number(m.pettyCash.montoInicial),
                    totalIncome: 0,
                    totalExpenses: 0,
                    currentBalance: 0,
                    movements: []
                }
            }

            if (m.tipo === 'INGRESO') acc[boxName].totalIncome += Number(m.monto)
            if (m.tipo === 'EGRESO') acc[boxName].totalExpenses += Number(m.monto)

            acc[boxName].movements.push(m)
            return acc
        }, {})

        Object.values(reportData).forEach((box: any) => {
            box.currentBalance = box.openingBalance + box.totalIncome - box.totalExpenses
        })

        // Log Audit
        await prisma.auditLog.create({
            data: {
                accion: 'EXPORT',
                entidad: 'PettyCashReport',
                entidadId: 'REPORTS',
                descripcion: `${session.user.name} generó reporte de caja chica`,
                usuarioId: session.user.id
            }
        })

        return NextResponse.json(Object.values(reportData))
    } catch (error: any) {
        console.error("Error generating report:", error)
        return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 })
    }
}
