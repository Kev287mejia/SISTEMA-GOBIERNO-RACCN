import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("Updating institutional identification...")

    const updates = [
        { key: 'inst_name', value: 'Gobierno Regional Autónomo de la Costa Caribe Norte (GRACCNN)' },
        { key: 'inst_ruc', value: 'J0110000000000' },
        { key: 'inst_address', value: 'Puerto Cabezas, Bilwi, Nicaragua' },
        { key: 'inst_legal_rep', value: 'Coordinador de Gobierno Regional' },
        { key: 'acc_currency', value: 'NIO' },
        { key: 'hr_ss_percent', value: '6.25' },
        { key: 'hr_patronal_percent', value: '19.0' }
    ]

    for (const update of updates) {
        await prisma.systemSetting.upsert({
            where: { key: update.key },
            update: { value: update.value },
            create: {
                key: update.key,
                value: update.value,
                label: update.key,
                group: 'Institutional',
                type: 'string'
            }
        })
    }

    console.log("Institutional data updated successfully.")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
