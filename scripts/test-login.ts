import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const email = "cajera@sistema.com"
    const password = "caja123"

    console.log(`Testing login for ${email}...`)

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.log("User not found!")
        return
    }

    console.log("User found:", {
        id: user.id,
        email: user.email,
        role: user.role,
        activo: user.activo
    })

    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log("Password valid:", isPasswordValid)

    if (!isPasswordValid) {
        console.log("Hash in DB:", user.password)
        const newHash = await bcrypt.hash(password, 10)
        console.log("Expected hash example:", newHash)
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
