const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function masterSync() {
    const adminId = 'cmkyy6ovs0000mkqoeps8kr1g';
    console.log('Final Master Sync: Standardizing signs...');

    // 1. Initial Capital (Patrimonio) - As of Jan 1st 2026
    // Group 3, INGRESO = +50,000,000
    await prisma.accountingEntry.upsert({
        where: { numero: 'BAL-INI-2026' },
        update: { tipo: 'INGRESO', monto: 50000000.00 },
        create: {
            numero: 'BAL-INI-2026',
            tipo: 'INGRESO',
            fecha: new Date('2026-01-01T00:00:00Z'),
            descripcion: 'BALANCE DE APERTURA - CAPITAL INSTITUCIONAL 2026',
            monto: 50000000.00,
            estado: 'APROBADO',
            institucion: 'GOBIERNO',
            cuentaContable: '311-01',
            creadoPorId: adminId
        }
    });

    // 2. Initial Cash (Activo) - Jan 1st
    // Group 1, INGRESO = +40,000,000
    await prisma.accountingEntry.upsert({
        where: { numero: 'BAL-CAJA-2026' },
        update: { tipo: 'INGRESO', monto: 40000000.00 },
        create: {
            numero: 'BAL-CAJA-2026',
            tipo: 'INGRESO',
            fecha: new Date('2026-01-01T00:00:01Z'),
            descripcion: 'BALANCE DE APERTURA - DISPONIBILIDAD EN CAJA Y BANCOS',
            monto: 40000000.00,
            estado: 'APROBADO',
            institucion: 'GOBIERNO',
            cuentaContable: '111-01',
            creadoPorId: adminId
        }
    });

    // 3. Initial Debt (Pasivo) - Jan 1st
    // Group 2, INGRESO = +10,000,000
    await prisma.accountingEntry.upsert({
        where: { numero: 'BAL-PAS-2026' },
        update: { tipo: 'INGRESO', monto: 10000000.00 },
        create: {
            numero: 'BAL-PAS-2026',
            tipo: 'INGRESO',
            fecha: new Date('2026-01-01T00:00:02Z'),
            descripcion: 'OBLIGACIONES PENDIENTES - CIERRE 2025',
            monto: 10000000.00,
            estado: 'APROBADO',
            institucion: 'GOBIERNO',
            cuentaContable: '211-01',
            creadoPorId: adminId
        }
    });

    // 4. Feb movements
    // Group 4, INGRESO = +15,000,000
    await prisma.accountingEntry.upsert({
        where: { numero: 'RE-2026-001' },
        update: { tipo: 'INGRESO', monto: 15000000.00, fecha: new Date('2026-02-10T12:00:00Z') },
        create: {
            numero: 'RE-2026-001',
            tipo: 'INGRESO',
            fecha: new Date('2026-02-10T12:00:00Z'),
            descripcion: 'RECAUDACIÓN FEBRERO 2026 - TEST',
            monto: 15000000.00,
            estado: 'APROBADO',
            institucion: 'GOBIERNO',
            cuentaContable: '411-01',
            creadoPorId: adminId
        }
    });

    // Group 5, EGRESO = +5,000,000
    // Linking to budget items to test execution logic
    const budgetVehiculos = await prisma.budgetItem.findUnique({ where: { codigo: '401-02' } });
    const budgetCombustible = await prisma.budgetItem.findUnique({ where: { codigo: '201-01' } });

    await prisma.accountingEntry.upsert({
        where: { numero: 'RE-2026-002' },
        update: {
            tipo: 'EGRESO',
            monto: 600000.00,
            fecha: new Date('2026-02-15T12:00:00Z'),
            budgetItemId: budgetVehiculos?.id
        },
        create: {
            numero: 'RE-2026-002',
            tipo: 'EGRESO',
            fecha: new Date('2026-02-15T12:00:00Z'),
            descripcion: 'MANTENIMIENTO PREVENTIVO FLOTA VEHICULAR',
            monto: 600000.00,
            estado: 'APROBADO',
            institucion: 'GOBIERNO',
            cuentaContable: '511-01',
            creadoPorId: adminId,
            budgetItemId: budgetVehiculos?.id
        }
    });

    await prisma.accountingEntry.upsert({
        where: { numero: 'RE-2026-003' },
        update: {
            tipo: 'EGRESO',
            monto: 1500000.00,
            fecha: new Date('2026-02-16T10:00:00Z'),
            budgetItemId: budgetCombustible?.id
        },
        create: {
            numero: 'RE-2026-003',
            tipo: 'EGRESO',
            fecha: new Date('2026-02-16T10:00:00Z'),
            descripcion: 'CONSUMO DE COMBUSTIBLE - OPERACIONES FEBRERO',
            monto: 1500000.00,
            estado: 'APROBADO',
            institucion: 'GOBIERNO',
            cuentaContable: '511-01',
            creadoPorId: adminId,
            budgetItemId: budgetCombustible?.id
        }
    });

    console.log('Successfully standardization completed and Budget Linked.');
}

masterSync()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
