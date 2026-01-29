
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Checking all users status...")

    // 1. Get all users
    const users = await prisma.user.findMany({
        orderBy: { email: 'asc' } // ordered by email
    })

    console.log(`\n📋 Found ${users.length} total users. Detailed Status:\n`)
    console.log("email | name | role | active")
    console.log("-".repeat(80))

    const usersToActivate: string[] = []

    for (const u of users) {
        console.log(`${u.email.padEnd(35)} | ${u.nombre} ${u.apellido || ''} | ${u.role} | ${u.activo ? '✅' : '❌'}`)

        // Identify users that SHOULD be active for a full demo
        // We generally want everyone active for a presentation unless they are 'test' junk
        if (!u.activo) {
            usersToActivate.push(u.id)
        }
    }

    console.log("\n" + "-".repeat(80))

    if (usersToActivate.length > 0) {
        console.log(`\n⚠️  Found ${usersToActivate.length} inactive users. Activating them now for full system functionality...`)

        await prisma.user.updateMany({
            where: {
                id: { in: usersToActivate }
            },
            data: {
                activo: true,
                failedLoginAttempts: 0,
                lockedUntil: null
            }
        })
        console.log("✅ All users have been activated and unlocked.")
    } else {
        console.log("\n✨ All users are already active.")
    }

    // Print quick credential reminder (based on standard conventions if possible, otherwise just list)
    console.log("\n🔑 Credential Reminder (Commonly Used):")
    console.log("admin@sistema.com -> admin123")
    console.log("julio.lopez@graccnn.gob.ni -> julio123")
    console.log("(Others usually follow role name or previous setup)")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
