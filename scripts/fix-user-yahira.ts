import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const email = "yahira.tucker@graccnn.gob.ni"
    const password = "presupuesto2024" // Mantendremos esta pero nos aseguramos del hash
    const hash = await bcrypt.hash(password, 10)

    console.log(`Verificando y actualizando usuaria: LIC. YAHIRA TUCKER MEDINA...`)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hash,
            role: "ResponsablePresupuesto" as any,
            activo: true,
            nombre: "Yahira",
            apellido: "Tucker Medina"
        },
        create: {
            email,
            password: hash,
            nombre: "Yahira",
            apellido: "Tucker Medina",
            role: "ResponsablePresupuesto" as any,
            activo: true
        }
    })

    console.log(`-----------------------------------------`)
    console.log(`USUARIO REGISTRADO: ${user.email}`)
    console.log(`PASSWORD RE-ESTABLECIDA: presupuesto2024`)
    console.log(`ROL EN DB: ${user.role}`)
    console.log(`CANTIDAD DE CARACTERES HASH: ${user.password.length}`)
    console.log(`-----------------------------------------`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
