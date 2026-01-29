import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'yahira.tucker@graccnn.gob.ni'
    const password = 'yahira123'

    console.log('🔧 Actualizando usuario para ResponsablePresupuesto...\n')

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Actualizar o crear usuario
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'ResponsablePresupuesto',
            activo: true
        },
        create: {
            email,
            password: hashedPassword,
            nombre: 'Yahira Tucker',
            apellido: 'Medina',
            role: 'ResponsablePresupuesto',
            activo: true
        }
    })

    console.log('✅ Usuario actualizado:')
    console.log('Email:', user.email)
    console.log('Nombre:', user.nombre, user.apellido)
    console.log('Role:', user.role)
    console.log('Activo:', user.activo)
    console.log('\n📋 Credenciales:')
    console.log('Email:', email)
    console.log('Password:', password)

    // Verificar que la contraseña funciona
    const isValid = await bcrypt.compare(password, user.password)
    console.log('\n✅ Verificación de contraseña:', isValid ? 'CORRECTA' : 'ERROR')
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
