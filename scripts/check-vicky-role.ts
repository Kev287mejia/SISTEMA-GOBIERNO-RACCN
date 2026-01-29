import { prisma } from '../lib/prisma'

async function checkVickyRole() {
    const vicky = await prisma.user.findFirst({
        where: {
            OR: [
                { nombre: { contains: 'Vicky', mode: 'insensitive' } },
                { nombre: { contains: 'Victoria', mode: 'insensitive' } },
                { email: { contains: 'vicky', mode: 'insensitive' } }
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

    console.log('Usuario Vicky encontrado:')
    console.log(JSON.stringify(vicky, null, 2))

    await prisma.$disconnect()
}

checkVickyRole().catch(console.error)
