import { prisma } from '../lib/prisma'

async function invalidateVickySession() {
    console.log('Invalidando sesión de Vicky (DirectoraRRHH)...')

    const result = await prisma.user.updateMany({
        where: {
            email: 'vicky.gonzalez@graccnn.gob.ni'
        },
        data: {
            sessionVersion: {
                increment: 1
            }
        }
    })

    console.log(`✅ Sesión de Vicky invalidada`)
    console.log('Vicky deberá cerrar sesión y volver a entrar para ver los cambios')

    await prisma.$disconnect()
}

invalidateVickySession().catch(console.error)
