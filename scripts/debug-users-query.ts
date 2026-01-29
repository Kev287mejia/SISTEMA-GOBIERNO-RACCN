import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testUsersQuery() {
    console.log('Testing users query...')
    try {
        const users = await prisma.user.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                email: true,
                nombre: true,
                apellido: true,
                cedula: true,
                cargo: true,
                departamento: true,
                role: true,
                activo: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        })
        console.log('Success! Users found:', users.length)
        console.log(users)
    } catch (error: any) {
        console.error('ERROR DETALLADO:', error)
        if (error.code) console.error('Error Code:', error.code)
        if (error.meta) console.error('Error Meta:', error.meta)
    } finally {
        await prisma.$disconnect()
    }
}

testUsersQuery()
