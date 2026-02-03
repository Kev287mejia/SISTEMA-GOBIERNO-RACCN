import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function GET(req: NextRequest) {
    try {
        // Usar getToken es más robusto para API Routes que getServerSession
        const token = await getToken({ req })

        console.log("Bank Accounts API (getToken) Log:")
        if (!token) {
            console.log(" - No token found")
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const role = token.role as Role
        const email = token.email
        console.log(`[DEBUG] API BankAccounts - User: ${email}`)
        console.log(`[DEBUG] API BankAccounts - Role received from token: '${role}'`)

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

        console.log(`[DEBUG] Is Allowed? ${allowedRoles.includes(role)}`)

        if (!allowedRoles.includes(role)) {
            console.log(`[DEBUG] ACCESS DENIED for role ${role}`)
            return NextResponse.json({ error: "Prohibido" }, { status: 403 })
        }

        const accounts = await prisma.bankAccount.findMany({
            orderBy: { createdAt: 'desc' }
        })
        console.log(`[DEBUG] Accounts found in DB: ${accounts.length}`)

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
                balance: role === Role.ResponsableCaja ? 0 : currentBookBalance,
                bookBalance: role === Role.ResponsableCaja ? 0 : currentBookBalance,
                bankBalance: role === Role.ResponsableCaja ? 0 : currentBankBalance,
                floatingWithdrawals: role === Role.ResponsableCaja ? 0 : floatingExpense,
                floatingDeposits: role === Role.ResponsableCaja ? 0 : floatingIncome,
                projectedBalance: role === Role.ResponsableCaja ? 0 : (currentBankBalance - floatingExpense)
            }
        }))

        return NextResponse.json(augmentedAccounts)
    } catch (error) {
        console.error("Error fetching bank accounts:", error)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
