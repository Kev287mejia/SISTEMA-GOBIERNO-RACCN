import { routePermissions, getRoleDisplayName } from '../lib/rbac'
import { Role } from '@prisma/client'

console.log('═'.repeat(80))
console.log('AUDITORÍA DE CONTROL DE ACCESO (RBAC)')
console.log('═'.repeat(80))
console.log('')

// Obtener todos los roles del enum
const allRoles = Object.values(Role)

console.log(`📊 Total de roles definidos: ${allRoles.length}`)
console.log('')

// Matriz de permisos
console.log('📋 MATRIZ DE PERMISOS POR ROL Y MÓDULO')
console.log('─'.repeat(80))

const modules = Object.keys(routePermissions).sort()

// Header
const header = 'Módulo'.padEnd(25) + allRoles.map(r => r.substring(0, 8)).join(' | ')
console.log(header)
console.log('─'.repeat(80))

for (const module of modules) {
    const allowedRoles = routePermissions[module]
    const row = module.padEnd(25) + allRoles.map(role =>
        allowedRoles.includes(role) ? '   ✓   ' : '   ✗   '
    ).join(' | ')
    console.log(row)
}

console.log('\n' + '═'.repeat(80))
console.log('VALIDACIÓN DE COBERTURA DE PERMISOS')
console.log('═'.repeat(80))

// Verificar que cada rol tenga al menos acceso al dashboard
const rolesWithoutDashboard = allRoles.filter(role =>
    !routePermissions['/dashboard']?.includes(role)
)

if (rolesWithoutDashboard.length > 0) {
    console.log('❌ Roles sin acceso al Dashboard:')
    rolesWithoutDashboard.forEach(r => console.log(`   - ${r}`))
} else {
    console.log('✅ Todos los roles tienen acceso al Dashboard')
}

// Verificar módulos críticos
const criticalModules = ['/contabilidad', '/presupuesto', '/caja', '/reportes']
console.log('\n📌 Cobertura de Módulos Críticos:')

for (const module of criticalModules) {
    const rolesCount = routePermissions[module]?.length || 0
    console.log(`   ${module.padEnd(20)} → ${rolesCount} roles autorizados`)
}

// Verificar roles específicos
console.log('\n' + '═'.repeat(80))
console.log('PERMISOS POR ROL ESPECÍFICO')
console.log('═'.repeat(80))

const rolesToCheck = [
    'ResponsableContabilidad',
    'ResponsablePresupuesto',
    'ContadorGeneral',
    'Admin'
]

for (const roleStr of rolesToCheck) {
    const role = roleStr as Role
    console.log(`\n🔐 ${getRoleDisplayName(role)}:`)

    const accessibleModules = modules.filter(m =>
        routePermissions[m]?.includes(role)
    )

    if (accessibleModules.length === 0) {
        console.log('   ❌ Sin acceso a ningún módulo')
    } else {
        accessibleModules.forEach(m => console.log(`   ✓ ${m}`))
    }
}

console.log('\n' + '═'.repeat(80))
console.log('RESULTADO DE VALIDACIÓN RBAC')
console.log('═'.repeat(80))

const issues = []

// Validar que Admin tenga acceso a todo
const adminModules = modules.filter(m => routePermissions[m]?.includes(Role.Admin))
if (adminModules.length !== modules.length) {
    issues.push('❌ Admin no tiene acceso a todos los módulos')
} else {
    console.log('✅ Admin tiene acceso completo')
}

// Validar que ResponsableContabilidad tenga acceso a contabilidad
if (!routePermissions['/contabilidad']?.includes(Role.ResponsableContabilidad)) {
    issues.push('❌ ResponsableContabilidad no tiene acceso a /contabilidad')
} else {
    console.log('✅ ResponsableContabilidad tiene acceso a Contabilidad')
}

// Validar que ResponsablePresupuesto tenga acceso a presupuesto
if (!routePermissions['/presupuesto']?.includes(Role.ResponsablePresupuesto)) {
    issues.push('❌ ResponsablePresupuesto no tiene acceso a /presupuesto')
} else {
    console.log('✅ ResponsablePresupuesto tiene acceso a Presupuesto')
}

if (issues.length > 0) {
    console.log('\n⚠️  PROBLEMAS DETECTADOS:')
    issues.forEach(issue => console.log(`   ${issue}`))
} else {
    console.log('\n✅ RBAC CORRECTAMENTE CONFIGURADO')
}

console.log('\n' + '═'.repeat(80))
