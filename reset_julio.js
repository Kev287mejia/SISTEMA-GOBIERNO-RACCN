
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const email = 'julio.lopez@graccnn.gob.ni'
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.log(`User ${email} NOT FOUND`)
        return
    }

    console.log('User found:', {
        id: user.id,
        email: user.email,
        role: user.role,
        activo: user.activo,
        twoFactorEnabled: user.twoFactorEnabled,
        failedLoginAttempts: user.failedLoginAttempts,
        lockedUntil: user.lockedUntil
    })

    // Hash 'julio123'
    const hashedPassword = await bcrypt.hash('julio123', 10)

    // Update password explicitly
    await prisma.user.update({
        where: { email },
        data: {
            password: hashedPassword,
            failedLoginAttempts: 0,
            lockedUntil: null,
            activo: true
        }
    })

    console.log('Password updated to: julio123')
    console.log('User unlocked and activated.')
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
