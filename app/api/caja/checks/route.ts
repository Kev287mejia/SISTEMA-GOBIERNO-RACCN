import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role, AuditAction } from "@prisma/client"
import { emitCajaEvent, CajaEvent } from "@/lib/socket"
import { auditCreate } from "@/lib/audit"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (false && !session) return new NextResponse("Unauthorized", { status: 401 })

        const { searchParams } = new URL(req.url)
        const type = searchParams.get("type") as any

        const checks = await prisma.check.findMany({
            where: type ? { tipo: type } : {},
            orderBy: { fecha: 'desc' },
            include: {
                entity: true,
                usuario: {
                    select: {
                        nombre: true,
                        apellido: true
                    }
                },
                budgetItem: {
                    select: {
                        codigo: true,
                        nombre: true
                    }
                },
                budgetApprovedBy: { select: { nombre: true, apellido: true, cargo: true } },
                budgetRejectedBy: { select: { nombre: true, apellido: true, cargo: true } },
                preCheckApprovedBy: { select: { nombre: true, apellido: true, cargo: true } },
                preCheckRejectedBy: { select: { nombre: true, apellido: true, cargo: true } },
                paidBy: { select: { nombre: true, apellido: true, cargo: true } },
                accountedBy: { select: { nombre: true, apellido: true, cargo: true } },
                issuedBy: { select: { nombre: true, apellido: true, cargo: true } }
            }
        })

        return NextResponse.json(checks)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (false && !session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const {
            numero,
            tipo,
            banco,
            cuentaBancaria,
            beneficiario,
            monto,
            fecha,
            referencia,
            providerId,
            accountingEntryId,
            budgetItemId,
            hasCartaSolicitud,
            hasDocumentosCompletos,
            hasFirmaSolicitante,
            evidenceUrls,
        } = body

        if (!numero || !tipo || !banco || !cuentaBancaria || !monto || !fecha) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        // --- VALIDATION: MINIMUM BALANCE PROTECTION ---
        if (tipo === "EMITIDO") {
            const account = await prisma.bankAccount.findUnique({
                where: { accountNumber: cuentaBancaria }
            })

            if (account) {
                // Calculate Real Balance
                const checksAgg = await prisma.check.groupBy({
                    by: ['tipo'],
                    where: {
                        cuentaBancaria: cuentaBancaria,
                        estado: { not: 'ANULADO' }
                    },
                    _sum: { monto: true }
                })

                // Calculate Check Totals
                let checkIncome = 0
                let checkExpense = 0
                checksAgg.forEach(agg => {
                    if (agg.tipo === 'RECIBIDO') checkIncome = Number(agg._sum.monto || 0)
                    if (agg.tipo === 'EMITIDO') checkExpense = Number(agg._sum.monto || 0)
                })

                // Calculate Manual Transactions Totals
                const trxAgg = await prisma.bankTransaction.findMany({
                    where: { bankAccountId: account.id }
                })
                let trxIncome = 0
                let trxExpense = 0
                const expenseTypes = ['WITHDRAWAL', 'DEBIT_NOTE', 'TRANSFER_OUT']
                trxAgg.forEach(t => {
                    if (expenseTypes.includes(t.type)) trxExpense += Number(t.amount)
                    else trxIncome += Number(t.amount)
                })

                const currentBalance = Number(account.openingBalance) + checkIncome + trxIncome - checkExpense - trxExpense
                const projectedBalance = currentBalance - Number(monto)

                if (projectedBalance < Number(account.minBalance)) {
                    return new NextResponse(
                        `Fondos insuficientes. Saldo actual: ${currentBalance}. El cheque dejaría la cuenta con ${projectedBalance}, por debajo del mínimo de ${account.minBalance}.`,
                        { status: 400 }
                    )
                }
            }
        }
        // ----------------------------------------------

        const check = await prisma.check.create({
            data: {
                numero,
                tipo,
                banco,
                cuentaBancaria,
                beneficiario,
                monto,
                fecha: new Date(fecha),
                referencia,
                usuarioId: session.user.id,
                entityId: providerId,
                accountingEntryId,
                budgetItemId,
                hasCartaSolicitud: !!hasCartaSolicitud,
                hasDocumentosCompletos: !!hasDocumentosCompletos,
                hasFirmaSolicitante: !!hasFirmaSolicitante,
                evidenceUrls: evidenceUrls || [],
                estado: "CHEQUE_REQUESTED"
            } as any
        })

        // Audit Log
        // Audit Log
        await auditCreate(
            "Check",
            check.id,
            `Registro de cheque ${numero} (${tipo}) por ${monto}`,
            {
                numero: check.numero,
                tipo: check.tipo,
                banco: check.banco,
                cuentaBancaria: check.cuentaBancaria,
                beneficiario: check.beneficiario,
                monto: check.monto,
                fecha: check.fecha,
                estado: check.estado
            }
        )

        // Real-time event
        emitCajaEvent(CajaEvent.CHECK_CREATED, check)

        return NextResponse.json(check)
    } catch (error) {
        console.error("[CAJA_CHECKS_POST]", error)
        if ((error as any).code === 'P2002') {
            return new NextResponse("Numero de cheque ya existe", { status: 400 })
        }
        return new NextResponse("Internal Error", { status: 500 })
    }
}
