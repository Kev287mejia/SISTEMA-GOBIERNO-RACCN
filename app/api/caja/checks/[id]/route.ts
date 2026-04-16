import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { auditUpdate } from "@/lib/audit"
import { emitCajaEvent, CajaEvent } from "@/lib/socket"

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        const body = await req.json()
        const {
            estado,
            hasCartaSolicitud,
            hasDocumentosCompletos,
            hasFirmaSolicitante,
            observaciones,
            cuentaContable,
            centroCosto,
            renglonGasto
        } = body

        // Type cast to any to bypass lint issues with recently added fields
        const check = await prisma.check.findUnique({
            where: { id: params.id },
            include: { budgetItem: true }
        }) as any

        if (!check) return new NextResponse("Check not found", { status: 404 })

        const userRole = session?.user?.role as Role
        const userId = session.user.id
        const now = new Date()
        let updateData: any = { estado }

        // --- INSTITUTIONAL WORKFLOW ENGINE ---

        // 1. BUDGET VALIDATION (Presupuesto / ResponsablePresupuesto)
        if (estado === "BUDGET_APPROVED" || estado === "BUDGET_REJECTED") {
            if (userRole !== Role.Presupuesto && userRole !== Role.ResponsablePresupuesto && userRole !== Role.Admin) {
                return new NextResponse("Solo el área de presupuesto puede validar el compromiso fiscal", { status: 403 })
            }

            if (estado === "BUDGET_APPROVED") {
                if (check.budgetItemId) {
                    const budgetItem = await prisma.budgetItem.findUnique({
                        where: { id: check.budgetItemId }
                    })

                    if (budgetItem && Number(budgetItem.montoDisponible) < Number(check.monto)) {
                        return new NextResponse("Presupuesto insuficiente: El monto solicitado supera el saldo disponible de la partida", { status: 400 })
                    }

                    // Create official Budget Execution record
                    await prisma.budgetExecution.create({
                        data: {
                            budgetItemId: check.budgetItemId,
                            monto: check.monto,
                            mes: now.getMonth() + 1,
                            fecha: now,
                            descripcion: `Compromiso Institucional - Cheque #${check.numero}`,
                            referencia: check.numero,
                            usuarioId: userId,
                            centroCosto: check.centroCosto || body.centroCosto
                        }
                    })

                    // Update BudgetItem totals (Real-time update)
                    await prisma.budgetItem.update({
                        where: { id: check.budgetItemId },
                        data: {
                            montoEjecutado: { increment: check.monto },
                            montoDisponible: { decrement: check.monto }
                        }
                    })
                }
                updateData.budgetApprovedById = userId
                updateData.budgetApprovedAt = now
            } else {
                updateData.budgetRejectedById = userId
                updateData.budgetRejectedAt = now
            }
        }

        // 2. CHEQUE ISSUANCE (ResponsableCaja / Tesoreria)
        if (estado === "CHEQUE_ISSUED") {
            if (userRole !== Role.ResponsableCaja && userRole !== Role.Admin) {
                return new NextResponse("Solo Tesorería/Caja puede emitir cheques físicos", { status: 403 })
            }
            if (check.estado !== "BUDGET_APPROVED" && check.estado !== "APROBADO_PRESUPUESTO" && userRole !== Role.Admin) {
                return new NextResponse("Error institucional: No se puede emitir cheque sin aprobación presupuestaria previa", { status: 400 })
            }
            updateData.issuedById = userId
            updateData.issuedAt = now
        }

        // 3. ACCOUNTING PRE-CHECK (Contabilidad / ContadorGeneral)
        if (estado === "ACCOUNTING_PRECHECK_APPROVED" || estado === "ACCOUNTING_PRECHECK_REJECTED") {
            if (userRole !== Role.ResponsableContabilidad && userRole !== Role.ContadorGeneral && userRole !== Role.Admin) {
                return new NextResponse("Solo el área contable puede realizar la auditoría previa al pago", { status: 403 })
            }

            if (estado === "ACCOUNTING_PRECHECK_APPROVED") {
                const { hasCartaSolicitud, hasDocumentosCompletos, hasFirmaSolicitante } = body
                if (!hasCartaSolicitud || !hasDocumentosCompletos || !hasFirmaSolicitante) {
                    return new NextResponse("Auditoría rechazada: Falta documentación de respaldo obligatoria", { status: 400 })
                }
                updateData.preCheckApprovedById = userId
                updateData.preCheckApprovedAt = now
                updateData.hasCartaSolicitud = true
                updateData.hasDocumentosCompletos = true
                updateData.hasFirmaSolicitante = true
            } else {
                updateData.preCheckRejectedById = userId
                updateData.preCheckRejectedAt = now
            }
        }

        // 4. CHEQUE PAYMENT (ResponsableCaja / Tesoreria)
        if (estado === "CHEQUE_PAID") {
            if (userRole !== Role.ResponsableCaja && userRole !== Role.Admin) {
                return new NextResponse("Solo Tesorería/Caja puede ejecutar el pago final", { status: 403 })
            }
            if (check.estado !== "ACCOUNTING_PRECHECK_APPROVED" && userRole !== Role.Admin) {
                return new NextResponse("Seguridad Fiscal: El cheque debe tener el PRE-CHECK de Contabilidad aprobado antes del pago", { status: 400 })
            }

            updateData.paidById = userId
            updateData.paidAt = now

            // LOCK MONETARY FIELDS & AUTO-LEDGER
            const bankAccount = await prisma.bankAccount.findUnique({
                where: { accountNumber: check.cuentaBancaria }
            })

            if (bankAccount) {
                // Register in Bank Auxiliary Ledger automatically
                await prisma.bankTransaction.create({
                    data: {
                        type: "WITHDRAWAL",
                        amount: check.monto,
                        description: `Pago Institucional - Cheque #${check.numero} a favor de ${check.beneficiario}`,
                        reference: check.numero,
                        bankAccountId: bankAccount.id,
                        createdBy: userId,
                        date: now
                    }
                })

                // Instant Balance Update
                await prisma.bankAccount.update({
                    where: { id: bankAccount.id },
                    data: { currentBalance: { decrement: check.monto } }
                })
            }
        }

        // 5. ACCOUNTING REGISTRATION & CODIFICATION (Accounting)
        if (estado === "ACCOUNTED") {
            if (userRole !== Role.ResponsableContabilidad && userRole !== Role.ContadorGeneral && userRole !== Role.AuxiliarContable && userRole !== Role.Admin) {
                return new NextResponse("Solo el área contable puede registrar la partida en el libro diario", { status: 403 })
            }

            if (check.estado !== "CHEQUE_PAID" && check.estado !== "PAGADO" && userRole !== Role.Admin) {
                return new NextResponse("El cheque debe ser pagado antes de la codificación contable final", { status: 400 })
            }

            const { cuentaContable, centroCosto, renglonGasto } = body
            if (!cuentaContable) return new NextResponse("Se requiere el código de cuenta contable para este asiento", { status: 400 })

            // Create Official Accounting Entry
            if (!check.accountingEntryId) {
                const { createAccountingEntry } = await import("@/lib/accounting")
                const entry = await createAccountingEntry({
                    tipo: "EGRESO",
                    fecha: now,
                    descripcion: `Asiento Contable: Pago de Cheque #${check.numero} - ${check.beneficiario}`,
                    monto: Number(check.monto),
                    institucion: "GOBIERNO",
                    cuentaContable: cuentaContable,
                    centroCosto: centroCosto || check.centroCosto,
                    documentoRef: check.numero,
                    budgetItemId: check.budgetItemId || undefined,
                    renglonGasto: renglonGasto || body.renglonGasto
                })

                updateData.accountingEntryId = entry.id
                updateData.accountedById = userId
                updateData.accountedAt = now
                updateData.renglonGasto = renglonGasto || body.renglonGasto
            }
        }

        // --- EXECUTE UPDATE ---
        const updatedCheck = await prisma.check.update({
            where: { id: params.id },
            data: updateData
        })

        await auditUpdate("Check", check.id, `Transición de flujo institucional: ${check.estado} -> ${estado}`, check, updatedCheck)

        return NextResponse.json(updatedCheck)
    } catch (error) {
        console.error("[CHECK_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
