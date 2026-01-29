import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const email = "yahira.tucker@graccnn.gob.ni"
    const password = "yahira123"
    const hash = await bcrypt.hash(password, 10)

    console.log(`Cambiando contraseña para: ${email} a: ${password}`)

    await prisma.user.update({
        where: { email },
        data: {
            password: hash,
            activo: true
        }
    })

    console.log("Contraseña actualizada exitosamente.")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
