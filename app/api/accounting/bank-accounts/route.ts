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
        const augmentedAccounts = await Promise.all(accounts.map(async (acc: any) => { // Added `any` type for `acc` to handle raw query results
            // Safe access to ID or calculate totals
            // For efficiency, we ideally should group by all, but inside loop is safer for now with low volume
            // Let's use aggregate for this specific account number
            const aggregates = await prisma.check.groupBy({
                by: ['tipo'],
                where: {
                    cuentaBancaria: acc.accountNumber,
                    estado: { not: 'ANULADO' } // Ignore voided checks
                },
                _sum: {
                    monto: true
                }
            })

            let income = 0
            let expense = 0

            aggregates.forEach(agg => {
                if (agg.tipo === "RECIBIDO") income = Number(agg._sum.monto || 0)
                if (agg.tipo === "EMITIDO") expense = Number(agg._sum.monto || 0)
            })

            const currentBalance = Number(acc.openingBalance || 0) + income - expense

            return {
                ...acc,
                balance: currentBalance
            }
        }))

        return NextResponse.json(augmentedAccounts)
    } catch (error) {
        console.error("Error fetching bank accounts:", error)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
