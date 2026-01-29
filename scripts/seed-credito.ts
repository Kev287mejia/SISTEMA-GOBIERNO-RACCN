import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const email = "responsable_credito@sistema.com"
    const password = "credito123"
    const hash = await bcrypt.hash(password, 10)

    console.log(`Setting up new user: Lic. Sofia Loren Montoya Melgara...`)

    await prisma.user.upsert({
        where: { email },
        update: {
            password: hash,
            role: "ResponsableCredito" as any,
            activo: true
        },
        create: {
            email,
            password: hash,
            nombre: "Sofia Loren",
            apellido: "Montoya Melgara",
            role: "ResponsableCredito" as any,
            activo: true
        }
    })

    console.log("User Lic. Sofia Loren Montoya Melgara created successfully.")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
