import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateUserRole() {
    console.log('═'.repeat(80))
    console.log('ACTUALIZACIÓN DE ROL - CONTADOR GENERAL')
    console.log('═'.repeat(80))
    console.log('')

    const email = 'julio.lopez@graccnn.gob.ni'

    // Obtener usuario actual
    const userBefore = await prisma.user.findUnique({
        where: { email }
    })

    if (!userBefore) {
        console.log('❌ Usuario no encontrado')
        return
    }

    console.log('📋 DATOS ACTUALES:')
    console.log(`   Nombre: ${userBefore.nombre} ${userBefore.apellido}`)
    console.log(`   Email: ${userBefore.email}`)
    console.log(`   Cédula: ${userBefore.cedula}`)
    console.log(`   Cargo Anterior: ${userBefore.cargo}`)
    console.log(`   Rol Anterior: ${userBefore.role}`)
    console.log('')

    // Actualizar rol y cargo
    const userAfter = await prisma.user.update({
        where: { email },
        data: {
            role: 'ContadorGeneral',
            cargo: 'Contador General',
            departamento: 'Dirección Administrativa Financiera - Contabilidad General'
        }
    })

    console.log('✅ ACTUALIZACIÓN EXITOSA')
    console.log('═'.repeat(80))
    console.log('')
    console.log('📋 DATOS ACTUALIZADOS:')
    console.log(`   Nombre: ${userAfter.nombre} ${userAfter.apellido}`)
    console.log(`   Email: ${userAfter.email}`)
    console.log(`   Cédula: ${userAfter.cedula}`)
    console.log(`   Cargo Nuevo: ${userAfter.cargo}`)
    console.log(`   Rol Nuevo: ${userAfter.role}`)
    console.log('')

    console.log('📌 PERMISOS DEL CONTADOR GENERAL:')
    console.log('   ✅ Acceso COMPLETO a Contabilidad')
    console.log('   ✅ Acceso a Caja y Caja Chica')
    console.log('   ✅ Acceso a Presupuesto')
    console.log('   ✅ Acceso a Reportes')
    console.log('   ✅ Acceso a Configuración')
    console.log('   ✅ Acceso a Documentación')
    console.log('   ✅ Acceso a Entidades')
    console.log('   ✅ Acceso a Facturas')
    console.log('   ✅ Acceso a Inventario')
    console.log('')

    console.log('🔑 CREDENCIALES DE ACCESO:')
    console.log(`   Email: ${email}`)
    console.log('   Contraseña: julio2026')
    console.log('')
    console.log('═'.repeat(80))
    console.log('✅ El usuario ahora tiene privilegios de Contador General')
    console.log('═'.repeat(80))
}

updateUserRole()
    .catch(e => console.error('Error:', e))
    .finally(() => prisma.$disconnect())
