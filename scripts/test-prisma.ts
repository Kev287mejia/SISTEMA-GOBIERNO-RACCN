
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Checking Prisma Client...")

    if (prisma.leaveRequest) {
        console.log("✅ SUCCESS: prisma.leaveRequest exists!")
        try {
            const count = await prisma.leaveRequest.count()
            console.log(`Current leave requests: ${count}`)
        } catch (e) {
            console.error("❌ ERROR connecting to table:", e)
        }
    } else {
        console.error("❌ FAILURE: prisma.leaveRequest is UNDEFINED. The client code was not generated correctly.")
        console.log("Keys available on prisma:", Object.keys(prisma))
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
