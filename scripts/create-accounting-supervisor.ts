import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🏛️  CREACIÓN DE USUARIO - RESPONSABLE DEL ÁREA DE CONTABILIDAD')
    console.log('='.repeat(80))
    console.log('')

    const userData = {
        email: 'julio.lopez@graccnn.gob.ni',
        password: 'julio2026',
        nombre: 'Julio',
        apellido: 'Lopez Escobar',
        cedula: '607-140373-0002B',
        cargo: 'Responsable del Área de Contabilidad',
        departamento: 'Dirección Administrativa Financiera - Contabilidad',
        role: 'ResponsableContabilidad' as const,
        activo: true
    }

    console.log('📋 Datos del Usuario:')
    console.log('   Nombre Completo:', `Cro. ${userData.nombre} ${userData.apellido}`)
    console.log('   Cédula:', userData.cedula)
    console.log('   Email:', userData.email)
    console.log('   Cargo:', userData.cargo)
    console.log('   Departamento:', userData.departamento)
    console.log('   Rol del Sistema:', userData.role)
    console.log('')

    // Hash de la contraseña
    console.log('🔐 Generando hash seguro de contraseña...')
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    // Crear o actualizar usuario
    console.log('💾 Registrando usuario en la base de datos...')
    const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
            password: hashedPassword,
            nombre: userData.nombre,
            apellido: userData.apellido,
            cedula: userData.cedula,
            cargo: userData.cargo,
            departamento: userData.departamento,
            role: userData.role,
            activo: userData.activo
        },
        create: {
            email: userData.email,
            password: hashedPassword,
            nombre: userData.nombre,
            apellido: userData.apellido,
            cedula: userData.cedula,
            cargo: userData.cargo,
            departamento: userData.departamento,
            role: userData.role,
            activo: userData.activo
        }
    })

    console.log('')
    console.log('✅ USUARIO CREADO EXITOSAMENTE')
    console.log('='.repeat(80))
    console.log('')
    console.log('📊 Información del Sistema:')
    console.log('   ID de Usuario:', user.id)
    console.log('   Email:', user.email)
    console.log('   Nombre Completo:', `${user.nombre} ${user.apellido}`)
    console.log('   Cédula:', user.cedula)
    console.log('   Cargo:', user.cargo)
    console.log('   Rol:', user.role)
    console.log('   Estado:', user.activo ? '✅ ACTIVO' : '❌ INACTIVO')
    console.log('')
    console.log('🔑 Credenciales de Acceso:')
    console.log('   Email:', userData.email)
    console.log('   Contraseña:', userData.password)
    console.log('')
    console.log('📌 Módulos Asignados:')
    console.log('   ✅ Contabilidad (Acceso completo)')
    console.log('   ✅ Dashboard')
    console.log('   ✅ Reportes Contables')
    console.log('   ✅ Cuentas por Cobrar')
    console.log('   ✅ Cuentas por Pagar')
    console.log('   📖 Presupuesto (Solo lectura)')
    console.log('   📖 Caja (Solo lectura)')
    console.log('   📖 Caja Chica (Solo lectura)')
    console.log('')
    console.log('⚠️  IMPORTANTE:')
    console.log('   - Cambiar la contraseña en el primer inicio de sesión')
    console.log('   - Todas las acciones quedan registradas en auditoría')
    console.log('   - No puede eliminar registros finalizados o auditados')
    console.log('')

    // Verificar que la contraseña funciona
    const isValid = await bcrypt.compare(userData.password, user.password)
    console.log('🔍 Verificación de Contraseña:', isValid ? '✅ CORRECTA' : '❌ ERROR')
    console.log('')
    console.log('='.repeat(80))
    console.log('🎯 Usuario listo para uso en producción')
    console.log('='.repeat(80))
}

main()
    .catch((e) => {
        console.error('❌ Error al crear usuario:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
