import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        const { searchParams } = new URL(req.url)
        const anio = parseInt(searchParams.get("anio") || new Date().getFullYear().toString())

        // 1. Fetch budget items for the year
        const budgetItems = await prisma.budgetItem.findMany({
            where: {
                anio,
                deletedAt: null
            },
            include: {
                accountingEntries: {
                    where: {
                        estado: "APROBADO",
                        deletedAt: null
                    },
                    select: {
                        monto: true,
                        tipo: true
                    }
                }
            }
        })

        // 2. Process real-time execution
        const report = budgetItems.map(item => {
            // "Ejecutado real" is the sum of approved accounting entries linked to this budget item
            const realEjecutante = item.accountingEntries.reduce((acc, entry) => {
                // Usually budget items are expenses, so EGRESO is positive execution
                return acc + Number(entry.monto)
            }, 0)

            const asignado = Number(item.montoAsignado)
            const disponible = asignado - realEjecutante
            const porcentaje = asignado > 0 ? (realEjecutante / asignado) * 100 : 0

            return {
                id: item.id,
                codigo: item.codigo,
                nombre: item.nombre,
                categoria: item.categoria,
                tipoGasto: item.tipoGasto,
                montoAsignado: asignado,
                montoEjecutadoSistema: Number(item.montoEjecutado), // What the budget module says
                montoEjecutadoReal: realEjecutante, // Calculated from double-entry accounting
                montoDisponible: disponible,
                porcentaje
            }
        })

        // 3. Group by category for a higher level view
        const byCategory: any = {}
        report.forEach(item => {
            if (!byCategory[item.categoria]) {
                byCategory[item.categoria] = {
                    categoria: item.categoria,
                    asignado: 0,
                    ejecutado: 0,
                    disponible: 0
                }
            }
            byCategory[item.categoria].asignado += item.montoAsignado
            byCategory[item.categoria].ejecutado += item.montoEjecutadoReal
            byCategory[item.categoria].disponible += item.montoDisponible
        })

        return NextResponse.json({
            items: report,
            summary: Object.values(byCategory),
            anio
        })

    } catch (error) {
        console.error("[BUDGET_EXECUTION_REALTIME_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
