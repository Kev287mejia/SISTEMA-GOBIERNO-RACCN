import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditDatabase() {
    console.log('═'.repeat(80))
    console.log('AUDITORÍA DE BASE DE DATOS Y FUNCIONALIDADES')
    console.log('═'.repeat(80))
    console.log('')

    // 1. Contabilidad
    console.log('📊 MÓDULO DE CONTABILIDAD')
    console.log('─'.repeat(80))

    const accountingEntries = await prisma.accountingEntry.count()
    const accountingByStatus = await prisma.accountingEntry.groupBy({
        by: ['estado'],
        _count: true
    })
    const accountingObservations = await prisma.accountingObservation.count()

    console.log(`   Asientos Contables: ${accountingEntries}`)
    accountingByStatus.forEach(s => {
        console.log(`      - ${s.estado}: ${s._count}`)
    })
    console.log(`   Observaciones: ${accountingObservations}`)

    // 2. Presupuesto
    console.log('\n💰 MÓDULO DE PRESUPUESTO')
    console.log('─'.repeat(80))

    const budgetItems = await prisma.budgetItem.count()
    const budgetExecutions = await prisma.budgetExecution.count()
    const budgetByStatus = await prisma.budgetItem.groupBy({
        by: ['estado'],
        _count: true
    })

    console.log(`   Partidas Presupuestarias: ${budgetItems}`)
    budgetByStatus.forEach(s => {
        console.log(`      - ${s.estado}: ${s._count}`)
    })
    console.log(`   Ejecuciones Registradas: ${budgetExecutions}`)

    // 3. Caja
    console.log('\n💵 MÓDULO DE CAJA')
    console.log('─'.repeat(80))

    const cashMovements = await prisma.cashMovement.count()
    const cashClosures = await prisma.cashClosure.count()
    const checks = await prisma.check.count()

    console.log(`   Movimientos de Caja: ${cashMovements}`)
    console.log(`   Cierres de Caja: ${cashClosures}`)
    console.log(`   Cheques Emitidos: ${checks}`)

    // 4. Caja Chica
    console.log('\n🏦 MÓDULO DE CAJA CHICA')
    console.log('─'.repeat(80))

    const pettyCashes = await prisma.pettyCash.count()
    const pettyCashMovements = await prisma.pettyCashMovement.count()
    const pettyCashByStatus = await prisma.pettyCash.groupBy({
        by: ['estado'],
        _count: true
    })

    console.log(`   Cajas Chicas Registradas: ${pettyCashes}`)
    pettyCashByStatus.forEach(s => {
        console.log(`      - ${s.estado}: ${s._count}`)
    })
    console.log(`   Movimientos: ${pettyCashMovements}`)

    // 5. RRHH
    console.log('\n👥 MÓDULO DE RECURSOS HUMANOS')
    console.log('─'.repeat(80))

    const employees = await prisma.employee.count()
    const payrolls = await prisma.payroll.count()
    const payrollItems = await prisma.payrollItem.count()
    const hrRecords = await prisma.hRRecord.count()

    console.log(`   Empleados Registrados: ${employees}`)
    console.log(`   Nóminas Generadas: ${payrolls}`)
    console.log(`   Ítems de Nómina: ${payrollItems}`)
    console.log(`   Registros de RRHH: ${hrRecords}`)

    // 6. Inventario
    console.log('\n📦 MÓDULO DE INVENTARIO')
    console.log('─'.repeat(80))

    const inventoryItems = await prisma.inventoryItem.count()
    const inventoryTransactions = await prisma.inventoryTransaction.count()

    console.log(`   Artículos en Inventario: ${inventoryItems}`)
    console.log(`   Transacciones: ${inventoryTransactions}`)

    // 7. Auditoría
    console.log('\n🔍 SISTEMA DE AUDITORÍA')
    console.log('─'.repeat(80))

    const auditLogs = await prisma.auditLog.count()
    const auditByAction = await prisma.auditLog.groupBy({
        by: ['accion'],
        _count: true,
        orderBy: { _count: { accion: 'desc' } },
        take: 5
    })

    console.log(`   Registros de Auditoría: ${auditLogs}`)
    if (auditByAction.length > 0) {
        console.log('   Acciones más frecuentes:')
        auditByAction.forEach(a => {
            console.log(`      - ${a.accion}: ${a._count}`)
        })
    }

    // 8. Configuración
    console.log('\n⚙️  CONFIGURACIÓN DEL SISTEMA')
    console.log('─'.repeat(80))

    const settings = await prisma.systemSetting.count()
    const settingsByGroup = await prisma.systemSetting.groupBy({
        by: ['group'],
        _count: true
    })

    console.log(`   Configuraciones Totales: ${settings}`)
    settingsByGroup.forEach(s => {
        console.log(`      - ${s.group}: ${s._count}`)
    })

    // Resumen
    console.log('\n' + '═'.repeat(80))
    console.log('RESUMEN DE VALIDACIÓN FUNCIONAL')
    console.log('═'.repeat(80))

    const modules = [
        { name: 'Contabilidad', count: accountingEntries, critical: true },
        { name: 'Presupuesto', count: budgetItems, critical: true },
        { name: 'Caja', count: cashMovements, critical: true },
        { name: 'Caja Chica', count: pettyCashes, critical: false },
        { name: 'RRHH', count: employees, critical: false },
        { name: 'Inventario', count: inventoryItems, critical: false },
        { name: 'Auditoría', count: auditLogs, critical: true }
    ]

    let criticalEmpty = 0
    let totalEmpty = 0

    modules.forEach(m => {
        const status = m.count > 0 ? '✅' : (m.critical ? '❌' : '⚠️ ')
        console.log(`${status} ${m.name.padEnd(20)} → ${m.count} registros`)

        if (m.count === 0) {
            totalEmpty++
            if (m.critical) criticalEmpty++
        }
    })

    console.log('\n' + '═'.repeat(80))
    console.log('ESTADO DEL SISTEMA')
    console.log('═'.repeat(80))

    if (criticalEmpty > 0) {
        console.log(`⚠️  ${criticalEmpty} módulos críticos sin datos`)
        console.log('   El sistema está operativo pero requiere carga de datos inicial')
    } else if (totalEmpty > 0) {
        console.log(`✅ Módulos críticos operativos`)
        console.log(`⚠️  ${totalEmpty} módulos opcionales sin datos`)
    } else {
        console.log('✅ TODOS LOS MÓDULOS TIENEN DATOS')
    }

    console.log('\n' + '═'.repeat(80))
}

auditDatabase()
    .catch(e => console.error('Error:', e))
    .finally(() => prisma.$disconnect())
