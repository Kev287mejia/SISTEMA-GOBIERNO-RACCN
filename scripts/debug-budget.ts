
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("Checking Budget Items...")
    const items = await prisma.budgetItem.findMany()
    console.log(`Found ${items.length} items:`)
    console.log(items)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
