import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const email = "cajera@sistema.com"
    const password = "caja123"
    const hash = await bcrypt.hash(password, 10)

    console.log(`Resetting password for ${email}...`)

    await prisma.user.upsert({
        where: { email },
        update: {
            password: hash,
            activo: true
        },
        create: {
            email,
            password: hash,
            nombre: "Meissy Hallely",
            apellido: "Escobar Kandler",
            role: "ResponsableCaja" as any,
            activo: true
        }
    })

    console.log("Password reset successfully.")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
