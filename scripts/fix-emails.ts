import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const password = "caja123"
    const hash = await bcrypt.hash(password, 10)

    // Ensure BOTH caja@sistema.com and cajera@sistema.com work or just switch to caja@sistema.com
    const emails = ["caja@sistema.com", "cajera@sistema.com"]

    for (const email of emails) {
        console.log(`Setting up user ${email}...`)
        await prisma.user.upsert({
            where: { email },
            update: {
                password: hash,
                activo: true,
                role: "ResponsableCaja" as any
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
    }

    console.log("Users configured successfully.")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
