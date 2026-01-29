import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("Cambiando rol temporal a Admin para bypass del error de Enum...")
    await prisma.user.update({
        where: { email: "yahira.tucker@graccnn.gob.ni" },
        data: {
            role: "Admin" // Admin ya existe en el schema antiguo y nuevo
        }
    })
    console.log("Rol actualizado. Intente loguear ahora.")
}

main().catch(console.error).finally(() => prisma.$disconnect())
