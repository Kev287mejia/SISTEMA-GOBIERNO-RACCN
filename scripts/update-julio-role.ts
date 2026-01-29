import { prisma } from "../lib/prisma"
import { Role } from "@prisma/client"

async function main() {
    const email = "julio.lopez@graccnn.gob.ni"
    const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: Role.ContadorGeneral }
    })
    console.log("User Role Updated:", updatedUser.email, "New Role:", updatedUser.role)
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
