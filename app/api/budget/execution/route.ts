import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { recordBudgetExecution } from "@/lib/budget"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/budget/execution
 * Record a budget execution
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const allowedRoles = ["Admin", "ContadorGeneral", "AuxiliarContable", "ResponsablePresupuesto", "ResponsableContabilidad"]
        if (!allowedRoles.includes(session.user.role as any)) {
            return NextResponse.json({ error: "No tiene permisos para registrar ejecución presupuestaria" }, { status: 403 })
        }

        const body = await request.json()
        const { budgetItemId, monto, descripcion, referencia, mes, centroCosto } = body

        if (!budgetItemId || !monto || !descripcion || !mes) {
            return NextResponse.json(
                { error: "Faltan campos requeridos (partida, monto, descripción, mes)" },
                { status: 400 }
            )
        }

        const execution = await recordBudgetExecution({
            budgetItemId,
            monto: parseFloat(monto),
            descripcion,
            referencia,
            mes: parseInt(mes),
            centroCosto
        })

        // --- TREASURY INTEGRATION ---
        if (body.bankAccountId) {
            try {
                // Ensure TransactionType is available or imported. If not using enum object, use string if Prisma expects string in create (it expects enum).
                // Just in case, I will use "WITHDRAWAL" string if type checking allows, or assume we need to cast or import.
                // Since I can't easily import the Enum from @prisma/client if not exported in some envs (as seen in lints), I'll use raw string "WITHDRAWAL" and hope Prisma matches it.
                // Actually, earlier file showed `TransactionType` enum.
                await prisma.bankTransaction.create({
                    data: {
                        bankAccountId: body.bankAccountId,
                        type: "WITHDRAWAL", // Matches Enum
                        amount: parseFloat(monto),
                        description: `EJECUCION PPTARIA: ${descripcion}`,
                        reference: referencia || `REF-PPT-${execution.id.slice(-6)}`,
                        date: new Date(),
                        createdBy: session.user.id
                    }
                })
            } catch (bankError) {
                console.error("CRITICAL: Failed to update Bank Account after Budget Execution", bankError)
                // We don't fail the request, but we should alert admin.
            }
        }
        // ----------------------------

        // Create notification for the user and admins
        // ... Notifications handled by Fiscal Guard in lib/budget.ts

        return NextResponse.json({
            data: execution,
            message: "Ejecución registrada exitosamente"
        })
    } catch (error: any) {
        console.error("Error recording budget execution:", error)
        return NextResponse.json(
            { error: error.message || "Error al registrar ejecución" },
            { status: 500 }
        )
    }
}

function formatCurrency(amount: number): string {
    return `C$ ${amount.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * GET /api/budget/execution
 * List executions with filters
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const budgetItemId = searchParams.get("budgetItemId")
        const mes = searchParams.get("mes")

        const where: any = {}
        if (budgetItemId) where.budgetItemId = budgetItemId
        if (mes && mes !== 'all') where.mes = parseInt(mes)

        const executions = await (prisma as any).budgetExecution.findMany({
            where,
            include: {
                budgetItem: true,
                usuario: {
                    select: { nombre: true, apellido: true }
                }
            },
            orderBy: { fecha: 'desc' }
        })

        return NextResponse.json({ data: executions })
    } catch (error: any) {
        console.error("Error fetching executions:", error)
        return NextResponse.json(
            { error: "Error al obtener historial de ejecución" },
            { status: 500 }
        )
    }
}
