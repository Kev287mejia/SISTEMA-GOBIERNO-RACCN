import { prisma } from "../lib/prisma"

async function main() {
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { email: { contains: "julio", mode: 'insensitive' } },
                { email: "vicky.gonzalez@graccnn.gob.ni" },
                { nombre: { contains: "julio", mode: 'insensitive' } }
            ]
        },
        select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            role: true,
            deniedModules: true
        }
    })
    console.log("Users Found:", JSON.stringify(users, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
