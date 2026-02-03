const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedFeb() {
    const adminId = 'cmkyy6ovs0000mkqoeps8kr1g';
    console.log('Seeding entries for February 2026 for Intelligence Dashboard...');

    const entries = [
        {
            numero: 'FD-2026-001',
            tipo: 'INGRESO',
            fecha: new Date('2026-02-01T12:00:00Z'),
            descripcion: 'RECAUDACIÓN POR IMPUESTOS REGIONALES - FEBRERO Q1',
            monto: 2500000.00,
            estado: 'APROBADO',
            institucion: 'GOBIERNO',
            cuentaContable: '411-01',
            creadoPorId: adminId
        },
        {
            numero: 'FD-2026-002',
            tipo: 'INGRESO',
            fecha: new Date('2026-02-05T12:00:00Z'),
            descripcion: 'TRANSFERENCIA DEL GOBIERNO CENTRAL - CAPITAL',
            monto: 8500000.00,
            estado: 'APROBADO',
            institucion: 'GOBIERNO',
            cuentaContable: '421-02',
            creadoPorId: adminId
        },
        {
            numero: 'FD-2026-003',
            tipo: 'EGRESO',
            fecha: new Date('2026-02-08T12:00:00Z'),
            descripcion: 'PAGO DE NOMINA - SECTOR SALUD REGIONAL',
            monto: 4500000.00,
            estado: 'APROBADO',
            institucion: 'GOBIERNO',
            cuentaContable: '511-01',
            creadoPorId: adminId
        },
        {
            numero: 'FD-2026-004',
            tipo: 'EGRESO',
            fecha: new Date('2026-02-10T12:00:00Z'),
            descripcion: 'PAGO PROVEEDOR - COMBUSTIBLE MAQUINARIA',
            monto: 1200000.00,
            estado: 'APROBADO',
            institucion: 'GOBIERNO',
            cuentaContable: '512-05',
            creadoPorId: adminId,
            budgetItemId: 'cmkyy6qdf000imkqoy3bsa1rp'
        },
        {
            numero: 'FD-2026-005',
            tipo: 'EGRESO',
            fecha: new Date('2026-02-12T12:00:00Z'),
            descripcion: 'AVANCE DE OBRA - PUENTE BILWI VILLA HERMOSA',
            monto: 3500000.00,
            estado: 'APROBADO',
            institucion: 'GOBIERNO',
            cuentaContable: '121-01',
            creadoPorId: adminId,
            budgetItemId: 'cmkyy6qdt000qmkqo1v7q4kn4'
        },
        {
            numero: 'FD-2026-006',
            tipo: 'EGRESO',
            fecha: new Date('2026-02-15T12:00:00Z'),
            descripcion: 'MANTENIMIENTO INFRAESTRUCTURA - ESCUELA WASPAM',
            monto: 800000.00,
            estado: 'APROBADO',
            institucion: 'GOBIERNO',
            cuentaContable: '512-08',
            creadoPorId: adminId,
            budgetItemId: 'cmkyy6qdv000smkqoiztr8eqw'
        }
    ];

    for (const entry of entries) {
        try {
            await prisma.accountingEntry.upsert({
                where: { numero: entry.numero },
                update: entry,
                create: entry
            });
        } catch (e) {
            console.error(`Error with entry ${entry.numero}:`, e.message);
        }
    }

    console.log('Successfully upserted 6 entries for Feb 2026.');
}

seedFeb()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
