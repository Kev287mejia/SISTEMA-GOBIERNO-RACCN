const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function forceResetAndSeed() {
    const adminId = 'cmkyy6ovs0000mkqoeps8kr1g';
    console.log('Force resetting and seeding Feb 2026...');

    // 1. Delete all existing entries for Feb 2026 to avoid conflict
    const start = new Date(Date.UTC(2026, 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(2026, 1, 28, 23, 59, 59, 999));

    await prisma.accountingEntry.deleteMany({
        where: {
            fecha: {
                gte: start,
                lte: end
            }
        }
    });

    // 2. Clear Gen entries
    await prisma.accountingEntry.deleteMany({
        where: {
            numero: { startsWith: 'GEN-' }
        }
    });

    // 3. Insert fresh approved entries
    const entries = [
        {
            numero: 'RE-2026-001',
            tipo: 'INGRESO',
            fecha: new Date('2026-02-10T12:00:00Z'),
            descripcion: 'RECAUDACIÓN FEBRERO 2026 - TEST',
            monto: 15000000.00,
            estado: 'APROBADO',
            institucion: 'GOBIERNO',
            cuentaContable: '411-01',
            creadoPorId: adminId
        },
        {
            numero: 'RE-2026-002',
            tipo: 'EGRESO',
            fecha: new Date('2026-02-15T12:00:00Z'),
            descripcion: 'GASTO OPERATIVO FEBRERO 2026 - TEST',
            monto: 5000000.00,
            estado: 'APROBADO',
            institucion: 'GOBIERNO',
            cuentaContable: '511-01',
            creadoPorId: adminId
        }
    ];

    for (const e of entries) {
        await prisma.accountingEntry.create({ data: e });
    }

    console.log('Successfully reset and seeded Feb 2026.');
}

forceResetAndSeed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
