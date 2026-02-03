import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    try {
        // La sesión ya fue verificada por el middleware
        // getServerSession no funciona bien con ngrok, así que confiamos en el middleware

        const session = await getServerSession(authOptions)
        // console.log("[DASHBOARD_STATS] Session check:", {
        //     hasSession: !!session,
        //     hasUser: !!session?.user,
        //     user: session?.user?.email,
        //     role: session?.user?.role
        // })
        if (!session?.user) {
            console.log("[DASHBOARD_STATS] No session found, returning 401")
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        // Fetch budget data
        const budgetItems = await prisma.budgetItem.findMany({
            where: { deletedAt: null }
        })

        const totalPresupuesto = budgetItems.reduce((sum, item) => sum + Number(item.montoAsignado), 0)
        const totalEjecutado = budgetItems.reduce((sum, item) => sum + Number(item.montoEjecutado), 0)
        const totalDisponible = budgetItems.reduce((sum, item) => sum + Number(item.montoDisponible), 0)
        const porcentajeEjecucion = totalPresupuesto > 0 ? (totalEjecutado / totalPresupuesto) * 100 : 0

        // Fetch bank accounts and calculate REAL projected liquidity
        const bankAccounts = await prisma.bankAccount.findMany({
            where: { isActive: true }
        })

        const accountProjections = await Promise.all(bankAccounts.map(async (acc) => {
            const checksAgg = await prisma.check.groupBy({
                by: ['tipo', 'conciliado'],
                where: {
                    cuentaBancaria: acc.accountNumber,
                    estado: { not: 'ANULADO' }
                },
                _sum: { monto: true }
            })

            let reconciledIncome = 0; let reconciledExpense = 0
            let floatingExpense = 0

            checksAgg.forEach(agg => {
                const val = Number(agg._sum.monto || 0)
                if (agg.conciliado) {
                    if (agg.tipo === "RECIBIDO") reconciledIncome = val
                    if (agg.tipo === "EMITIDO") reconciledExpense = val
                } else {
                    if (agg.tipo === "EMITIDO") floatingExpense = val
                }
            })

            const bankBalance = Number(acc.openingBalance || 0) + reconciledIncome - reconciledExpense
            return bankBalance - floatingExpense // Projected Real Balance
        }))

        const totalBanco = accountProjections.reduce((sum, projected) => sum + projected, 0)

        // Budget by type
        const presupuestoPorTipo = budgetItems.reduce((acc, item) => {
            const tipo = item.tipoGasto
            if (!acc[tipo]) {
                acc[tipo] = { asignado: 0, ejecutado: 0 }
            }
            acc[tipo].asignado += Number(item.montoAsignado)
            acc[tipo].ejecutado += Number(item.montoEjecutado)
            return acc
        }, {} as Record<string, { asignado: number, ejecutado: number }>)

        // Budget by region
        const presupuestoPorRegion = budgetItems.reduce((acc, item) => {
            const region = item.centroRegional
            if (!acc[region]) {
                acc[region] = { asignado: 0, ejecutado: 0 }
            }
            acc[region].asignado += Number(item.montoAsignado)
            acc[region].ejecutado += Number(item.montoEjecutado)
            return acc
        }, {} as Record<string, { asignado: number, ejecutado: number }>)

        // Monthly execution trend (simulated for now)
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        const mesActual = new Date().getMonth()
        const tendenciaMensual = meses.slice(0, mesActual + 1).map((mes, idx) => ({
            mes,
            ejecutado: (totalEjecutado / (mesActual + 1)) * (idx + 1),
            proyectado: (totalPresupuesto / 12) * (idx + 1)
        }))

        // Top 5 partidas by execution
        const top5Partidas = budgetItems
            .sort((a, b) => Number(b.montoEjecutado) - Number(a.montoEjecutado))
            .slice(0, 5)
            .map(item => ({
                nombre: item.nombre,
                codigo: item.codigo,
                ejecutado: Number(item.montoEjecutado),
                asignado: Number(item.montoAsignado),
                porcentaje: Number(item.montoAsignado) > 0
                    ? (Number(item.montoEjecutado) / Number(item.montoAsignado)) * 100
                    : 0
            }))

        return NextResponse.json({
            kpis: {
                totalPresupuesto,
                totalEjecutado,
                totalDisponible,
                porcentajeEjecucion,
                totalBanco,
                numeroCuentas: bankAccounts.length,
                numeroPartidas: budgetItems.length
            },
            charts: {
                presupuestoPorTipo: Object.entries(presupuestoPorTipo).map(([tipo, data]) => ({
                    tipo,
                    ...data
                })),
                presupuestoPorRegion: Object.entries(presupuestoPorRegion).map(([region, data]) => ({
                    region,
                    ...data
                })),
                tendenciaMensual,
                top5Partidas
            }
        })

    } catch (error) {
        console.error("[DASHBOARD_STATS] Error:", error)
        return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
    }
}
