
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Diagnosticando Usuarios...")

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            nombre: true,
            role: true,
            activo: true,
            failedLoginAttempts: true,
            lockedUntil: true
        }
    })

    console.log(`Encontrados ${users.length} usuarios:`)
    console.table(users)

    if (users.length === 0) {
        console.log("❌ No hay usuarios. Creando Admin de Rescate...")
        const hashedPassword = await bcrypt.hash("Admin123!", 10)

        await prisma.user.create({
            data: {
                email: "admin@graccnn.gob.ni",
                password: hashedPassword,
                nombre: "Administrador",
                apellido: "Sistema",
                role: "Admin",
                activo: true,
                cargo: "Soporte Técnico"
            }
        })
        console.log("✅ Usuario creado: admin@graccnn.gob.ni / Admin123!")
    } else {
        // Find existing admin or use the first user
        const targetUser = users.find(u => u.email === 'admin@graccnn.gob.ni') || users[0]

        console.log(`🛠 Reparando usuario: ${targetUser.email}...`)

        const hashedPassword = await bcrypt.hash("Admin123!", 10)

        await prisma.user.update({
            where: { id: targetUser.id },
            data: {
                activo: true,
                lockedUntil: null,
                failedLoginAttempts: 0,
                // Optional: Reset password if requested (Descomentar si es necesario)
                // password: hashedPassword 
            }
        })
        console.log("✅ Usuario desbloqueado y activado.")
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
