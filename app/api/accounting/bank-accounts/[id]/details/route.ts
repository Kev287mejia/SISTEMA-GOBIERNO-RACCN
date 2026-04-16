import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const allowedRoles: Role[] = [
            Role.Admin,
            Role.ContadorGeneral,
            Role.ResponsableContabilidad,
            Role.DirectoraDAF,
            Role.CoordinadorGobierno,
            Role.Auditor,
            Role.ResponsableCaja
        ]

        if (!allowedRoles.includes(session?.user?.role as Role)) {
            return NextResponse.json({ error: "Prohibido" }, { status: 403 })
        }

        const { id } = params

        // 1. Fetch Account Info (using fallback logic just in case)
        let account = null
        try {
            account = await prisma.bankAccount.findUnique({ where: { id } })
        } catch (e) {
            const raw: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM bank_accounts WHERE id = $1`, id)
            if (raw.length > 0) account = raw[0]
        }

        if (!account) {
            return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 })
        }

        // 2. Fetch Related Movements
        const checks = await prisma.check.findMany({
            where: {
                cuentaBancaria: account.accountNumber,
                estado: { not: 'ANULADO' }
            }
        })

        const transactions = await prisma.bankTransaction.findMany({
            where: {
                bankAccountId: account.id
            }
        })

        // 2c. Fetch formal Reconciliations
        const reconciliations = await prisma.bankReconciliation.findMany({
            where: { bankAccountId: account.id },
            include: { user: { select: { nombre: true, apellido: true } } },
            orderBy: { createdAt: 'desc' }
        })

        // 3. Merge and Calculate Stats
        const initialBalance = Number(account.openingBalance || 0)
        let currentBalance = initialBalance
        let totalIncome = 0
        let totalExpense = 0

        // Unify standard interface
        const allMovements = [
            ...checks.map(c => ({
                id: c.id,
                date: c.fecha,
                rawType: c.tipo,
                category: 'CHECK',
                description: c.beneficiario || "Sin beneficiario",
                reference: `CHQ-${c.numero}`,
                amount: Number(c.monto),
                status: c.estado,
                reconciled: (c as any).conciliado,
                reconciledDate: (c as any).fechaConciliacion
            })),
            ...transactions.map(t => ({
                id: t.id,
                date: t.date,
                rawType: t.type,
                category: 'TRANSACTION',
                description: t.description,
                reference: t.reference || t.type,
                amount: Number(t.amount),
                status: 'REGISTRADO',
                reconciled: t.reconciled,
                reconciledDate: t.reconciledDate
            }))
        ]

        // Sort by Date ASC for Running Scale
        allMovements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        const movementsWithBalance = allMovements.map(move => {
            let isExpense = false

            if (move.category === 'CHECK') {
                if (move.rawType === 'EMITIDO') isExpense = true
            } else {
                const expenseTypes = ['WITHDRAWAL', 'DEBIT_NOTE', 'TRANSFER_OUT']
                if (expenseTypes.includes(move.rawType)) isExpense = true
            }

            if (isExpense) {
                totalExpense += move.amount
                currentBalance -= move.amount
            } else {
                totalIncome += move.amount
                currentBalance += move.amount
            }

            return {
                id: move.id,
                date: move.date,
                type: isExpense ? "DEBIT" : "CREDIT",
                description: move.description,
                reference: move.reference,
                amount: move.amount,
                status: move.status,
                balanceAfter: currentBalance,
                isReconciled: move.reconciled || false,
                category: move.category
            }
        })

        const movementsDesc = movementsWithBalance.reverse()

        return NextResponse.json({
            account,
            stats: {
                balance: currentBalance,
                totalIncome,
                totalExpense,
                initialBalance
            },
            movements: movementsDesc,
            reconciliations
        })

    } catch (error) {
        console.error("Error fetching account details:", error)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
