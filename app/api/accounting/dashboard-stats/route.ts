import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Simple in-memory cache
const cache = {
    data: null as any,
    lastFetch: 0
}
const CACHE_TTL = 30 * 1000 // 30 seconds

export async function GET() {
    try {
        const now = Date.now()

        // Check cache validity
        if (cache.data && (now - cache.lastFetch < CACHE_TTL)) {
            return NextResponse.json(cache.data)
        }

        // 1. Por Validar: Asientos en estado BORRADOR o PENDIENTE
        const pendingCount = await prisma.accountingEntry.count({
            where: {
                estado: { in: ["BORRADOR", "PENDIENTE"] }
            }
        })

        // 2. Bancos (Disponibilidad Global): Saldo de cuentas de Activo Disponbile (111)
        // Saldo = Suma de Ingresos - Suma de Egresos
        const bankIncomes = await prisma.accountingEntry.aggregate({
            _sum: { monto: true },
            where: {
                cuentaContable: { startsWith: "111" },
                tipo: "INGRESO",
                estado: "APROBADO"
            }
        })

        const bankExpenses = await prisma.accountingEntry.aggregate({
            _sum: { monto: true },
            where: {
                cuentaContable: { startsWith: "111" },
                tipo: "EGRESO",
                estado: "APROBADO"
            }
        })

        const bankBalance = (Number(bankIncomes._sum.monto) || 0) - (Number(bankExpenses._sum.monto) || 0)

        // 3. Cuentas por Pagar (Pasivos - 2xxx)
        // En contabilidad gubernamental base efectivo modificada:
        // Saldos iniciales + Devengado (no pagado) - Pagado.
        // Simplificación para este modelo: Saldo bruto de cuentas de pasivo registradas.
        // Asumiremos que movimientos de tipo 'INGRESO' en cuentas 2xxx aumentan la deuda (Préstamos, CXP reconocidas)
        // y 'EGRESO' la disminuyen (Pagos de deuda).
        const liabilityIncreases = await prisma.accountingEntry.aggregate({
            _sum: { monto: true },
            where: {
                cuentaContable: { startsWith: "2" },
                tipo: "INGRESO",
                estado: "APROBADO"
            }
        })

        const liabilityDecreases = await prisma.accountingEntry.aggregate({
            _sum: { monto: true },
            where: {
                cuentaContable: { startsWith: "2" },
                tipo: "EGRESO",
                estado: "APROBADO"
            }
        })

        const accountsPayable = (Number(liabilityIncreases._sum.monto) || 0) - (Number(liabilityDecreases._sum.monto) || 0)

        // 4. Cuentas por Cobrar (Activos Exigibles - 13xx)
        // Lógica Implementada:
        // Cuentas de Activo (1xxx) aumentan con Cargos (INGRESOS en lógica de sistema si representa devengado)
        // y disminuyen con Créditos (COBROS/EGRESOS en lógica de sistema).
        // Para simplificar en este modelo gubernamental:
        // Saldo = Movimientos pendientes de cobro registrados en cuentas 13xx.

        const receivableIncreases = await prisma.accountingEntry.aggregate({
            _sum: { monto: true },
            where: {
                cuentaContable: { startsWith: "13" },
                tipo: "INGRESO",
                estado: "APROBADO"
            }
        })

        const receivableDecreases = await prisma.accountingEntry.aggregate({
            _sum: { monto: true },
            where: {
                cuentaContable: { startsWith: "13" },
                tipo: "EGRESO",
                estado: "APROBADO"
            }
        })

        const accountsReceivable = (Number(receivableIncreases._sum.monto) || 0) - (Number(receivableDecreases._sum.monto) || 0)

        const result = {
            pendingValidation: pendingCount,
            accountsPayable: accountsPayable,
            accountsReceivable: accountsReceivable,
            bankBalance: bankBalance
        }

        // Update cache
        cache.data = result
        cache.lastFetch = now

        return NextResponse.json(result)
    } catch (error) {
        console.error("Dashboard stats error:", error)
        return NextResponse.json({ error: "Error fetching stats" }, { status: 500 })
    }
}
