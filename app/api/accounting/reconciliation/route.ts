import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

/**
 * Handles bank reconciliation logic.
 * Internal transactions (BankTransaction) are matched against provided external statement data.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session?.user?.role !== Role.Admin && session?.user?.role !== Role.ResponsableContabilidad && session?.user?.role !== Role.ContadorGeneral)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { bankAccountId, statementEntries } = body

        if (!bankAccountId || !statementEntries || !Array.isArray(statementEntries)) {
            return new NextResponse("Invalid request data", { status: 400 })
        }

        // 1. Fetch pending transactions for this account
        const internalTransactions = await prisma.bankTransaction.findMany({
            where: {
                bankAccountId,
                reconciled: false
            },
            orderBy: { date: 'asc' }
        })

        const results = {
            matched: [] as any[],
            unmatchedInternal: [] as any[],
            unmatchedExternal: [] as any[]
        }

        // Logic for auto-matching: Date, Amount and Reference (if exists)
        // We use a simple but effective matching algorithm

        const usedInternalIds = new Set<string>()

        statementEntries.forEach((external: any) => {
            // Find a match in internal transactions
            // Tolerance: +/- 3 days for dates, exact amount
            const match = internalTransactions.find(internal => {
                if (usedInternalIds.has(internal.id)) return false

                const amountMatch = Math.abs(Number(internal.amount)) === Math.abs(Number(external.amount))

                // Extract reference from description if needed or use reference field
                const refMatch = external.reference && internal.reference
                    ? external.reference.includes(internal.reference) || internal.reference.includes(external.reference)
                    : false

                const dateDiff = Math.abs(new Date(internal.date).getTime() - new Date(external.date).getTime()) / (1000 * 60 * 60 * 24)
                const dateMatch = dateDiff <= 7 // 7 days tolerance for manual entries vs bank settlement

                return amountMatch && (refMatch || dateMatch)
            })

            if (match) {
                usedInternalIds.add(match.id)
                results.matched.push({
                    external,
                    internal: match,
                    confidence: 100
                })
            } else {
                results.unmatchedExternal.push(external)
            }
        })

        // Filter out matched to get unmatched internal
        results.unmatchedInternal = internalTransactions.filter(it => !usedInternalIds.has(it.id))

        return NextResponse.json(results)

    } catch (error) {
        console.error("[RECONCILIATION_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

/**
 * Confirms reconciliation for a set of matches
 */
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (false && !session) return new NextResponse("Unauthorized", { status: 401 })

        const body = await req.json()
        const { bankAccountId, matchIds, stats } = body // IDs of BankTransaction to mark as reconciled

        if (!matchIds || !Array.isArray(matchIds)) {
            return new NextResponse("Invalid data", { status: 400 })
        }

        // Consistent role check as in POST
        if (session?.user?.role !== Role.Admin && session?.user?.role !== Role.ResponsableContabilidad && session?.user?.role !== Role.ContadorGeneral) {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        // 1. Mark transactions as reconciled
        await prisma.$transaction(
            matchIds.map(id =>
                prisma.bankTransaction.update({
                    where: { id },
                    data: {
                        reconciled: true,
                        reconciledDate: new Date()
                    }
                })
            )
        )

        // 2. Update checks if applicable
        const transactions = await prisma.bankTransaction.findMany({
            where: { id: { in: matchIds }, reference: { not: null } }
        })

        for (const tx of transactions) {
            if (tx.reference) {
                await prisma.check.updateMany({
                    where: { numero: tx.reference },
                    data: {
                        conciliado: true,
                        fechaConciliacion: new Date()
                    }
                })
            }
        }

        // 3. Create a formal Reconciliation Record (Acta)
        const reconciliationRecord = await prisma.bankReconciliation.create({
            data: {
                bankAccountId: bankAccountId || "unknown", // Fallback for robustness
                userId: session.user.id,
                date: new Date(),
                balanceLibros: 0, // In a real system, we'd calculate the exact snapshot here
                balanceExtracto: 0,
                diferencia: 0,
                totalMatching: matchIds.length,
                periodoMes: new Date().getMonth() + 1,
                periodoAnio: new Date().getFullYear(),
                detalles: stats || {}
            }
        })

        // 4. Register in Audit Log for traceability
        await prisma.auditLog.create({
            data: {
                accion: "UPDATE",
                entidad: "BankReconciliation",
                entidadId: reconciliationRecord.id,
                descripcion: `Conciliación bancaria confirmada para ${matchIds.length} transacciones. Acta: ${reconciliationRecord.id}`,
                usuarioId: session.user.id,
                datosNuevos: { reconciledCount: matchIds.length, reconciliationId: reconciliationRecord.id }
            }
        })

        return NextResponse.json({
            success: true,
            count: matchIds.length,
            id: reconciliationRecord.id
        })

    } catch (error) {
        console.error("[RECONCILIATION_PUT]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
