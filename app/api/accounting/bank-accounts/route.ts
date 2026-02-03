import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        console.log("Bank Accounts API Request Log:")
        if (!session?.user) {
            console.log(" - No active session")
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const start = Date.now()
        const role = session.user.role as Role
        console.log(` - User Role: ${role}`)
        console.log(` - User ID: ${session.user.id}`)

        // Roles permitidos para ver cuentas bancarias
        const allowedRoles: Role[] = [
            Role.Admin,
            Role.ContadorGeneral,
            Role.ResponsableContabilidad,
            Role.DirectoraDAF,
            Role.CoordinadorGobierno,
            Role.Auditor,
            Role.ResponsableCaja,
            Role.ResponsablePresupuesto
        ]

        if (!allowedRoles.includes(session.user.role as Role)) {
            return NextResponse.json({ error: "Prohibido" }, { status: 403 })
        }

        const accounts = await prisma.bankAccount.findMany({
            orderBy: { createdAt: 'desc' }
        })

        // Convert keys if necessary from raw result or just return as is
        // Enrich with Balance Calculation
        const augmentedAccounts = await Promise.all(accounts.map(async (acc: any) => {
            // Aggregates for ALL checks (Book Balance)
            const aggregates = await prisma.check.groupBy({
                by: ['tipo'],
                where: {
                    cuentaBancaria: acc.accountNumber,
                    estado: { not: 'ANULADO' }
                },
                _sum: { monto: true }
            })

            // Aggregates for CONCILIADO checks only (Bank Balance)
            const reconciledAggs = await prisma.check.groupBy({
                by: ['tipo'],
                where: {
                    cuentaBancaria: acc.accountNumber,
                    estado: { not: 'ANULADO' },
                    conciliado: true
                },
                _sum: { monto: true }
            })

            // Aggregates for FLOATING (Not reconciled)
            const floatingAggs = await prisma.check.groupBy({
                by: ['tipo'],
                where: {
                    cuentaBancaria: acc.accountNumber,
                    estado: { not: 'ANULADO' },
                    conciliado: false
                },
                _sum: { monto: true }
            })

            let totalIncome = 0; let totalExpense = 0
            let reconciledIncome = 0; let reconciledExpense = 0
            let floatingIncome = 0; let floatingExpense = 0

            aggregates.forEach(agg => {
                const val = Number(agg._sum.monto || 0);
                if (agg.tipo === "RECIBIDO") totalIncome = val;
                if (agg.tipo === "EMITIDO") totalExpense = val;
            })

            reconciledAggs.forEach(agg => {
                const val = Number(agg._sum.monto || 0);
                if (agg.tipo === "RECIBIDO") reconciledIncome = val;
                if (agg.tipo === "EMITIDO") reconciledExpense = val;
            })

            floatingAggs.forEach(agg => {
                const val = Number(agg._sum.monto || 0);
                if (agg.tipo === "RECIBIDO") floatingIncome = val;
                if (agg.tipo === "EMITIDO") floatingExpense = val;
            })

            const openingBalance = Number(acc.openingBalance || 0)
            const currentBookBalance = openingBalance + totalIncome - totalExpense
            const currentBankBalance = openingBalance + reconciledIncome - reconciledExpense

            return {
                ...acc,
                balance: currentBookBalance, // Keeping for backward compatibility
                bookBalance: currentBookBalance,
                bankBalance: currentBankBalance,
                floatingWithdrawals: floatingExpense,
                floatingDeposits: floatingIncome,
                projectedBalance: currentBankBalance - floatingExpense // This is what the user wants to see: Banco - Lo que va a salir
            }
        }))

        return NextResponse.json(augmentedAccounts)
    } catch (error) {
        console.error("Error fetching bank accounts:", error)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
