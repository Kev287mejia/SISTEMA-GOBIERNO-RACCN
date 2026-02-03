const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedBroad() {
    const adminId = 'cmkyy6ovs0000mkqoeps8kr1g';
    console.log('Seeding broad range of entries...');

    const years = [2024, 2025, 2026];
    const months = [1, 2, 3, 11, 12];

    for (const y of years) {
        for (const m of months) {
            const entryId = `GEN-${y}-${m}`;
            await prisma.accountingEntry.upsert({
                where: { numero: entryId },
                update: {},
                create: {
                    numero: entryId,
                    tipo: 'INGRESO',
                    fecha: new Date(y, m - 1, 15),
                    descripcion: `RECAUDACIÓN AUTOMÁTICA ${m}/${y}`,
                    monto: 100000.00,
                    estado: 'APROBADO',
                    institucion: 'GOBIERNO',
                    cuentaContable: '411-01',
                    creadoPorId: adminId
                }
            });
        }
    }
    console.log('Successfully seeded broad range.');
}

seedBroad()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
