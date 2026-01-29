import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    await prisma.user.update({
        where: { email: "yahira.tucker@graccnn.gob.ni" },
        data: {
            role: "Presupuesto" // Este rol sí existe en el schema original y tiene acceso al módulo
        }
    })
    console.log("Rol ajustado a: Presupuesto")
}

main().catch(console.error).finally(() => prisma.$disconnect())
