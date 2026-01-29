import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditUsers() {
    console.log('═'.repeat(80))
    console.log('AUDITORÍA DE USUARIOS - SISTEMA CONTABLE GRACCNN')
    console.log('═'.repeat(80))
    console.log('')

    const users = await prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { role: 'asc' }
    })

    console.log(`📊 Total de usuarios activos: ${users.length}`)
    console.log('')

    const roleGroups = users.reduce((acc, user) => {
        if (!acc[user.role]) acc[user.role] = []
        acc[user.role].push(user)
        return acc
    }, {} as Record<string, typeof users>)

    for (const [role, roleUsers] of Object.entries(roleGroups)) {
        console.log(`\n🔐 ROL: ${role}`)
        console.log('─'.repeat(80))

        roleUsers.forEach(user => {
            console.log(`   ✓ ${user.nombre} ${user.apellido || ''}`)
            console.log(`     Email: ${user.email}`)
            console.log(`     Cédula: ${user.cedula || 'N/A'}`)
            console.log(`     Cargo: ${user.cargo || 'N/A'}`)
            console.log(`     Estado: ${user.activo ? '✅ ACTIVO' : '❌ INACTIVO'}`)
            console.log(`     Creado: ${user.createdAt.toLocaleDateString('es-NI')}`)
            console.log('')
        })
    }

    console.log('\n' + '═'.repeat(80))
    console.log('RESUMEN POR ROL')
    console.log('═'.repeat(80))

    for (const [role, roleUsers] of Object.entries(roleGroups)) {
        console.log(`${role.padEnd(30)} → ${roleUsers.length} usuario(s)`)
    }

    console.log('\n' + '═'.repeat(80))
    console.log('VALIDACIÓN DE INTEGRIDAD')
    console.log('═'.repeat(80))

    const issues = []

    // Validar que todos tengan email
    const noEmail = users.filter(u => !u.email)
    if (noEmail.length > 0) {
        issues.push(`❌ ${noEmail.length} usuarios sin email`)
    } else {
        console.log('✅ Todos los usuarios tienen email')
    }

    // Validar que todos tengan nombre
    const noName = users.filter(u => !u.nombre)
    if (noName.length > 0) {
        issues.push(`❌ ${noName.length} usuarios sin nombre`)
    } else {
        console.log('✅ Todos los usuarios tienen nombre')
    }

    // Validar que todos estén activos
    const inactive = users.filter(u => !u.activo)
    if (inactive.length > 0) {
        console.log(`⚠️  ${inactive.length} usuarios inactivos (normal si están suspendidos)`)
    } else {
        console.log('✅ Todos los usuarios están activos')
    }

    // Validar roles críticos
    const criticalRoles = [
        'Admin',
        'ContadorGeneral',
        'ResponsableContabilidad',
        'ResponsablePresupuesto',
        'ResponsableCaja'
    ]

    console.log('\n📌 Validación de Roles Críticos:')
    for (const role of criticalRoles) {
        const count = users.filter(u => u.role === role).length
        if (count === 0) {
            issues.push(`❌ No hay usuarios con rol ${role}`)
            console.log(`   ❌ ${role}: NO ASIGNADO`)
        } else {
            console.log(`   ✅ ${role}: ${count} usuario(s)`)
        }
    }

    if (issues.length > 0) {
        console.log('\n⚠️  PROBLEMAS DETECTADOS:')
        issues.forEach(issue => console.log(`   ${issue}`))
    } else {
        console.log('\n✅ VALIDACIÓN COMPLETA: Sin problemas detectados')
    }

    console.log('\n' + '═'.repeat(80))
}

auditUsers()
    .catch(e => console.error('Error en auditoría:', e))
    .finally(() => prisma.$disconnect())
