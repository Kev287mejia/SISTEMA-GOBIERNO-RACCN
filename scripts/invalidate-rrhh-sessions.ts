import { prisma } from '../lib/prisma'

async function invalidateRRHHSessions() {
    console.log('Invalidando sesiones de usuarios RRHH...')

    const result = await prisma.user.updateMany({
        where: {
            role: 'RRHH'
        },
        data: {
            sessionVersion: {
                increment: 1
            }
        }
    })

    console.log(`✅ ${result.count} sesiones de RRHH invalidadas`)
    console.log('Los usuarios RRHH deberán iniciar sesión nuevamente para ver los cambios')

    await prisma.$disconnect()
}

invalidateRRHHSessions().catch(console.error)
