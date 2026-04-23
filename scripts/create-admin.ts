import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const email = "kevinomarmejia97@gmail.com"
    const password = "Montalvan1996Cano"
    const hashedParams = await bcrypt.hash(password, 12)

    console.log(`Creating admin user: ${email}...`)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedParams,
            role: Role.Admin,
            activo: true,
        },
        create: {
            email,
            password: hashedParams,
            nombre: "Kevin",
            apellido: "Mejia",
            role: Role.Admin,
            activo: true,
            twoFactorEnabled: false,
        },
    })

    console.log("Admin user created successfully:")
    console.log(`ID: ${user.id}`)
    console.log(`Email: ${user.email}`)
    console.log(`Role: ${user.role}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
