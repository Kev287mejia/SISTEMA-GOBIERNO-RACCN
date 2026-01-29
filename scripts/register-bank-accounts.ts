import { PrismaClient, AuditAction } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("Starting Bank Account Registration...")

    // Get Admin user for Audit Log
    const admin = await prisma.user.findUnique({
        where: { email: "admin@sistema.com" }
    })

    if (!admin) {
        console.error("Admin user not found. Cannot proceed with Audit Logging.")
        process.exit(1)
    }

    const accounts = [
        { bank: "BANPRO", number: "10012705232122" },
        { bank: "BANPRO", number: "10012705232114" },
        { bank: "BANPRO", number: "10012700003635" },
        { bank: "BANPRO", number: "10012701792120" },
        { bank: "BANPRO", number: "10012700003255" },
        { bank: "BANPRO", number: "10012705883967" },
    ]

    for (const acc of accounts) {
        try {
            // Create or Update bank account
            const bankAccount = await prisma.bankAccount.upsert({
                where: { accountNumber: acc.number },
                update: {
                    // If exists, ensure it is still pending if verified data hasn't changed
                    bankName: acc.bank,
                },
                create: {
                    bankName: acc.bank,
                    accountNumber: acc.number,
                    status: "PENDING_VALIDATION",
                    isActive: false,
                    accountType: "CORRIENTE", // Default
                    currency: "NIO", // Default Cordova
                    openingBalance: 0,
                    // All other fields null by default
                }
            })

            console.log(`Registered/Updated: ${acc.bank} - ${acc.number}`)

            // Create Audit Log
            await prisma.auditLog.create({
                data: {
                    accion: AuditAction.BANK_ACCOUNT_PRE_REGISTERED,
                    entidad: "BankAccount",
                    entidadId: bankAccount.id,
                    descripcion: `Pre-registro de cuenta bancaria institucional: ${acc.bank} ${acc.number}`,
                    usuarioId: admin.id,
                    datosNuevos: bankAccount as any
                }
            })

        } catch (error) {
            console.error(`Error registering ${acc.number}:`, error)
        }
    }

    console.log("Bank Account Registration Complete.")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
