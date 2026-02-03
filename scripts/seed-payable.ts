
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("Seeding a payable entry for testing Caja...")

    // 1. Find a user to assign as creator (admin or caja)
    const user = await prisma.user.findFirst()

    if (!user) {
        console.error("No users found.")
        return
    }

    // 2. Create an Accounting Entry (Egreso, Aprobado) to appear in Treasury
    const entry = await prisma.accountingEntry.create({
        data: {
            numero: `EGR-${Date.now()}`,
            fecha: new Date(),
            descripcion: "PAGO DE SERVICIOS ENERGIA ELECTRICA - PRUEBA",
            tipo: "EGRESO",
            estado: "APROBADO",
            moneda: "NIO",
            monto: 4500.00,
            usuarioId: user.id,
            // Add lines to be valid
            lines: {
                create: [
                    {
                        cuentaId: "1-000", // Dummy account, needs to exist or fail if FK enabled? 
                        // Actually FKs are usually on Account model. Assuming 1-000 doesn't exist might throw.
                        // Better to find an account first.
                        debe: 4500,
                        haber: 0,
                        descripcion: "Gasto Energía"
                    },
                    {
                        cuentaId: "1-001",
                        debe: 0,
                        haber: 4500,
                        descripcion: "Banco Provisión"
                    }
                ]
            }
        }
    })

    console.log("Created Payable Entry:", entry.id, entry.descripcion)
}

// Note: Creating lines with cuentaId requires actual accounts. 
// If accounts don't exist, this script will fail.
// I will just create the Header if possible, or try to link to any account.
// Or safer: View one account first.

async function saferMain() {
    // Check if account exists
    const account = await prisma.account.findFirst()
    const accountId = account?.id || "111-001" // Fallback

    const user = await prisma.user.findFirst()

    const entry = await prisma.accountingEntry.create({
        data: {
            numero: `EGR-TEST-${Math.floor(Math.random() * 1000)}`,
            fecha: new Date(),
            descripcion: "PAGO A PROVEEDOR DE PAPELERIA (DEMO)",
            tipo: "EGRESO", // IMPORTANT for Treasury
            estado: "APROBADO", // IMPORTANT for Treasury
            monto: 3650.00,
            creadoPorId: user?.id || "dummy",
            institucion: "GOBIERNO",
            cuentaContable: "2-1-01-001", // Cuentas por Pagar Proveedores
            // lines removed as they don't exist on schema

        }
    })
    console.log("✅ Asiento de Pago Creado ID:", entry.id)
}

saferMain()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
