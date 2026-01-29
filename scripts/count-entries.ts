
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const count = await prisma.accountingEntry.count()
    console.log(`Total Asientos en DB: ${count}`)

    if (count > 0) {
        const first = await prisma.accountingEntry.findFirst()
        console.log("Ejemplo:", first)
    }
}

main()
    .finally(() => prisma.$disconnect())
