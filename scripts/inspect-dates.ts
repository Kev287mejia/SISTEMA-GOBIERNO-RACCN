import { prisma } from "../lib/prisma"

async function main() {
  const entries = await prisma.accountingEntry.findMany({
    select: { fecha: true, estado: true, tipo: true, monto: true, deletedAt: true }
  })
  console.log("All Entries:", JSON.stringify(entries, null, 2))

  const approved = await prisma.accountingEntry.findMany({
    where: {
      fecha: { gte: new Date("2026-01-01") },
      deletedAt: null,
      estado: 'APROBADO'
    }
  })
  console.log("Approved for Analytics:", approved.length)

  const statusGroups = await prisma.accountingEntry.groupBy({
    by: ['estado'],
    _count: { id: true },
    where: { deletedAt: null }
  })
  console.log("Status Groups:", statusGroups)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
