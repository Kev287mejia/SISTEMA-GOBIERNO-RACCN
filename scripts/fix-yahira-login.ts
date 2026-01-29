import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'yahira.tucker@graccnn.gob.ni'

    // Verificar usuario
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.log('❌ Usuario no encontrado')
        return
    }

    console.log('✅ Usuario encontrado:')
    console.log('Email:', user.email)
    console.log('Nombre:', user.nombre, user.apellido)
    console.log('Role:', user.role)
    console.log('Activo:', user.activo)
    console.log('Password hash:', user.password.substring(0, 20) + '...')

    // Verificar contraseña
    const testPassword = 'yahira123'
    const isValid = await bcrypt.compare(testPassword, user.password)

    console.log('\n🔐 Verificación de contraseña:')
    console.log('Contraseña de prueba:', testPassword)
    console.log('¿Es válida?:', isValid ? '✅ SÍ' : '❌ NO')

    if (!isValid) {
        console.log('\n🔧 Regenerando contraseña...')
        const newHash = await bcrypt.hash(testPassword, 10)
        await prisma.user.update({
            where: { email },
            data: { password: newHash, activo: true }
        })
        console.log('✅ Contraseña actualizada correctamente')
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())
