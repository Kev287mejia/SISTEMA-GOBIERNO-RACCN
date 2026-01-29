import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'yahira.tucker@graccnn.gob.ni' }
    })

    if (user) {
        console.log('✅ Usuario encontrado:')
        console.log('Email:', user.email)
        console.log('Nombre:', user.nombre, user.apellido)
        console.log('Role:', user.role)
        console.log('Activo:', user.activo)
    } else {
        console.log('❌ Usuario no encontrado')
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())
