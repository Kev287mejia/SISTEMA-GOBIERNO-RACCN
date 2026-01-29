import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Checking Prisma Client for 'entity' property...")
    if ((prisma as any).entity) {
        console.log("SUCCESS: prisma.entity exists.")
        const count = await (prisma as any).entity.count()
        console.log("Entity count:", count)
    } else {
        console.log("FAILURE: prisma.entity is undefined.")
        console.log("Available properties:", Object.keys(prisma).filter(k => !k.startsWith('_')))
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
