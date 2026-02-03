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
        const mesParam = searchParams.get("mes")
        const anioParam = searchParams.get("anio")
        const mes = parseInt(mesParam || (new Date().getMonth() + 1).toString())
        const anio = parseInt(anioParam || new Date().getFullYear().toString())

        console.log(`[COMPARATIVE_DEBUG] Request received for Mes: ${mes}, Anio: ${anio} (Params: ${mesParam}, ${anioParam})`)

        const fetchBalancesForPeriod = async (m: number, a: number) => {
            const end = new Date(Date.UTC(a, m, 0, 23, 59, 59, 999))
            const startOfMonth = new Date(Date.UTC(a, m - 1, 1, 0, 0, 0))

            const entries = await prisma.accountingEntry.findMany({
                where: {
                    estado: "APROBADO",
                    deletedAt: null,
                    fecha: { lte: end }
                }
            })

            const balances: any = {
                activos: { balance: 0, subcategories: {} },
                pasivos: { balance: 0, subcategories: {} },
                patrimonio: { balance: 0, subcategories: {} },
                ingresos: { balance: 0, subcategories: {} },
                gastos: { balance: 0, subcategories: {} }
            }

            entries.forEach(entry => {
                const cuenta = entry.cuentaContable || ""
                const firstDigit = cuenta.trim()[0]
                const monto = Number(entry.monto)
                const tipo = entry.tipo
                const isWithinMonth = entry.fecha >= startOfMonth && entry.fecha <= end

                let groupKey = ""
                switch (firstDigit) {
                    case "1": groupKey = "activos"; break;
                    case "2": groupKey = "pasivos"; break;
                    case "3": groupKey = "patrimonio"; break;
                    case "4": groupKey = "ingresos"; break;
                    case "5": groupKey = "gastos"; break;
                    default: return;
                }

                // Balance sheet is cumulative (all entries up to 'end')
                // P&L is period-based (only entries within the month)
                if ((groupKey === "ingresos" || groupKey === "gastos") && !isWithinMonth) {
                    return;
                }

                const isDebit = tipo === "EGRESO"
                const isCredit = tipo === "INGRESO"

                let increment = 0
                if (groupKey === "gastos") {
                    // Expenses increase with EGRESO
                    increment = isDebit ? monto : -monto
                } else {
                    // Assets, Liabilities, Equity, and Income increase with INGRESO (in this system's simplified model)
                    increment = isCredit ? monto : -monto
                }

                balances[groupKey].balance += increment
                const subKey = cuenta.substring(0, 3)
                balances[groupKey].subcategories[subKey] = (balances[groupKey].subcategories[subKey] || 0) + increment
            })

            return balances
        }

        // Calculate previous month
        let prevMes = mes - 1
        let prevAnio = anio
        if (prevMes === 0) {
            prevMes = 12
            prevAnio -= 1
        }

        const currentBalances = await fetchBalancesForPeriod(mes, anio)
        const previousBalances = await fetchBalancesForPeriod(prevMes, prevAnio)

        const totalInDb = await prisma.accountingEntry.count({
            where: { estado: "APROBADO", deletedAt: null }
        })

        return NextResponse.json({
            current: currentBalances,
            previous: previousBalances,
            period: { mes, anio },
            prevPeriod: { mes: prevMes, anio: prevAnio },
            totalInDb: totalInDb,
            _debug_test: "API_REACHABLE",
            _debug_time: new Date().toISOString()
        })

    } catch (error) {
        console.error("[COMPARATIVE_REPORTS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
