import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("--- DEBUGGING DATA STATE ---")

    // 1. Check Accounts
    const accounts = await prisma.bankAccount.findMany()
    console.log(`\nBank Accounts Found: ${accounts.length}`)
    accounts.forEach(acc => console.log(`- ${acc.bankName} ${acc.accountNumber} (${acc.status})`))

    // 2. Check Julio's User
    const julios = await prisma.user.findMany({
        where: {
            OR: [
                { email: { contains: "julio" } },
                { nombre: { contains: "Julio" } }
            ]
        }
    })

    console.log(`\nUsers matching 'Julio': ${julios.length}`)
    julios.forEach(u => console.log(`- ${u.nombre} ${u.apellido} | Email: ${u.email} | Role: ${u.role}`))

}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())
