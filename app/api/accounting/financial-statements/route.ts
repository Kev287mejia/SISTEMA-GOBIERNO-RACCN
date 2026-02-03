import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        // 1. Fetch all approved accounting entries
        const entries = await prisma.accountingEntry.findMany({
            where: {
                estado: "APROBADO",
                deletedAt: null
            },
            select: {
                cuentaContable: true,
                monto: true,
                tipo: true
            }
        })

        // Groups: 1 Activos, 2 Pasivos, 3 Patrimonio, 4 Ingresos, 5 Gastos
        const balances: any = {
            activos: { label: "Activos", balance: 0, subcategories: {} },
            pasivos: { label: "Pasivos", balance: 0, subcategories: {} },
            patrimonio: { label: "Patrimonio", balance: 0, subcategories: {} },
            ingresos: { label: "Ingresos", balance: 0, subcategories: {} },
            gastos: { label: "Gastos", balance: 0, subcategories: {} }
        }

        entries.forEach(entry => {
            const firstDigit = entry.cuentaContable[0]
            const monto = Number(entry.monto)

            // Determine sign based on entry type (standard accounting)
            // This is a simplification: INGRESO vs EGRESO usually refers to Bank side in this system
            // But let's assume Entry type INGRESO = Credit, EGRESO = Debit
            // Actually, in government accounting usually:
            // Assets (1) Increase with Debit (Egreso in this system's parlance for cash flow)

            let groupKey = ""
            switch (firstDigit) {
                case "1": groupKey = "activos"; break;
                case "2": groupKey = "pasivos"; break;
                case "3": groupKey = "patrimonio"; break;
                case "4": groupKey = "ingresos"; break;
                case "5": groupKey = "gastos"; break;
                default: return; // Ignore unknown codes
            }

            // Normal Balance behavior:
            // Activos/Gastos: Debit increases
            // Pasivos/Patrimonio/Ingresos: Credit increases

            // Map types from EntryType enum: INGRESO, EGRESO
            const isDebit = entry.tipo === "EGRESO" // Standard for many sistemas GOB
            const isCredit = entry.tipo === "INGRESO"

            let increment = 0
            if (groupKey === "activos" || groupKey === "gastos") {
                increment = isDebit ? monto : -monto
            } else {
                increment = isCredit ? monto : -monto
            }

            balances[groupKey].balance += increment

            // Subcategory (level 2: 1.1, 1.2, etc)
            const subKey = entry.cuentaContable.substring(0, 3)
            if (!balances[groupKey].subcategories[subKey]) {
                balances[groupKey].subcategories[subKey] = 0
            }
            balances[groupKey].subcategories[subKey] += increment
        })

        return NextResponse.json(balances)

    } catch (error) {
        console.error("[FINANCIAL_STATEMENTS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
