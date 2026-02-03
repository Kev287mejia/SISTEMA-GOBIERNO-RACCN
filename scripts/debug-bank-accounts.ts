import { prisma } from "../lib/prisma"

async function main() {
  const count = await prisma.bankAccount.count()
  console.log(`Total bank accounts: ${count}`)
  
  const accounts = await prisma.bankAccount.findMany()
  console.log(JSON.stringify(accounts, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.())
