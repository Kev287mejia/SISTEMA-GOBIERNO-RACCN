import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const email = "yahira.tucker@graccnn.gob.ni"
    const password = "presupuesto2024"
    const hash = await bcrypt.hash(password, 10)

    console.log(`Configurando nueva usuaria: LIC. YAHIRA TUCKER MEDINA...`)

    await prisma.user.upsert({
        where: { email },
        update: {
            password: hash,
            role: "ResponsablePresupuesto" as Role,
            activo: true,
            nombre: "Yahira",
            apellido: "Tucker Medina"
        },
        create: {
            email,
            password: hash,
            nombre: "Yahira",
            apellido: "Tucker Medina",
            role: "ResponsablePresupuesto" as Role,
            activo: true
        }
    })

    console.log("Usuaria LIC. YAHIRA TUCKER MEDINA creada exitosamente.")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
