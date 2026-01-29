import { prisma } from "../lib/prisma"

async function main() {
    const count = await prisma.accountingEntry.count()
    console.log(`Total Accounting Entries: ${count}`)

    const statusGroup = await prisma.accountingEntry.groupBy({
        by: ['estado'],
        _count: { id: true }
    })
    console.log("Status Distribution:", statusGroup)
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
