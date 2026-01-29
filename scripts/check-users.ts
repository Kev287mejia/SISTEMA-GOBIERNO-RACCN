import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function checkUsers() {
    console.log("\n=== Checking Users ===\n")

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
            role: true,
            activo: true
        }
    })

    console.log(`Found ${users.length} users:`)
    users.forEach(u => {
        console.log(`- ${u.email} (${u.nombre} ${u.apellido}) - Role: ${u.role} - Active: ${u.activo}`)
    })

    // Check if presupuesto user exists
    const presupuestoUser = users.find(u => u.role === 'ResponsablePresupuesto')
    if (presupuestoUser) {
        console.log(`\n✓ Presupuesto user found: ${presupuestoUser.email}`)
        console.log(`  Password should be: presupuesto2024`)
    } else {
        console.log(`\n✗ No Presupuesto user found!`)
    }

    // Check admin
    const admin = users.find(u => u.role === 'Admin')
    if (admin) {
        console.log(`\n✓ Admin user found: ${admin.email}`)
        console.log(`  Password should be: admin123`)
    }
}

checkUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
