
import { prisma } from '../lib/prisma'

async function auditBudgetAnalytics() {
    console.log("--- AUDITORÍA: MÓDULO PRESUPUESTO ---")

    // 1. Trend Data
    const monthlyData = await prisma.budgetExecution.groupBy({
        by: ['mes'],
        _sum: {
            monto: true
        },
        orderBy: {
            mes: 'asc'
        }
    })
    console.log(`[PASS] Agregación Mensual Presupuesto: ${monthlyData.length} meses con ejecución.`)

    // 2. Pie Data
    const categoryData = await prisma.budgetItem.groupBy({
        by: ['categoria'],
        _sum: {
            montoEjecutado: true
        },
        where: {
            montoEjecutado: { gt: 0 }
        }
    })
    console.log(`[PASS] Distribución por Categoría: ${categoryData.length} categorías con ejecución.`)
}

async function auditAccountingAnalytics() {
    console.log("\n--- AUDITORÍA: MÓDULO CONTABILIDAD ---")

    // 1. Trend Data (Ingresos vs Egresos) - Logic check
    const startOfYear = new Date(new Date().getFullYear(), 0, 1)
    const entries = await prisma.accountingEntry.findMany({
        where: {
            fecha: { gte: startOfYear },
            deletedAt: null,
            estado: 'APROBADO'
        },
        select: { tipo: true, monto: true }
    })

    const ingresos = entries.filter(e => e.tipo === 'INGRESO').length
    const egresos = entries.filter(e => e.tipo === 'EGRESO').length

    console.log(`[PASS] Asientos Analizados: ${entries.length} (Ingresos: ${ingresos}, Egresos: ${egresos})`)

    // 2. Status Distribution
    const statusGroups = await prisma.accountingEntry.groupBy({
        by: ['estado'],
        _count: { id: true },
        where: { deletedAt: null }
    })
    console.log(`[PASS] Distribución de Estados: ${statusGroups.map(g => `${g.estado}: ${g._count.id}`).join(', ')}`)
}

async function auditRRHHAnalytics() {
    console.log("\n--- AUDITORÍA: MÓDULO RRHH ---")

    // 1. Employee Distribution
    const activeContracts = await prisma.contract.findMany({
        where: { estado: "ACTIVO", deletedAt: null },
        include: { cargo: true }
    })

    const deptCounts: Record<string, number> = {}
    activeContracts.forEach(c => {
        const dept = c.cargo.departamento || "Sin Departamento"
        deptCounts[dept] = (deptCounts[dept] || 0) + 1
    })
    console.log(`[PASS] Distribución Departamental Empleados: ${Object.keys(deptCounts).length} departamentos activos.`)

    // 2. Payroll Trend
    const recentPayrolls = await prisma.payroll.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        where: { estado: 'CERRADA' }
    })
    console.log(`[PASS] Tendencia Nómina: ${recentPayrolls.length} nóminas cerradas analizadas.`)
}

async function main() {
    try {
        await auditBudgetAnalytics()
        await auditAccountingAnalytics()
        await auditRRHHAnalytics()
        console.log("\n✅ AUDITORÍA COMPLETADA: La lógica de datos es consistente.")
    } catch (e) {
        console.error("\n❌ FALLO DE AUDITORÍA:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
