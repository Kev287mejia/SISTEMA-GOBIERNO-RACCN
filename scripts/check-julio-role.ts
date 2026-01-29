import { prisma } from '../lib/prisma'

async function checkJulioRole() {
    const julio = await prisma.user.findFirst({
        where: {
            OR: [
                { nombre: { contains: 'Julio', mode: 'insensitive' } },
                { email: { contains: 'julio', mode: 'insensitive' } }
            ]
        },
        select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            role: true
        }
    })

    console.log('Usuario Julio encontrado:')
    console.log(JSON.stringify(julio, null, 2))

    await prisma.$disconnect()
}

checkJulioRole().catch(console.error)
