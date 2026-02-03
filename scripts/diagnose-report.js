const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
    const mes = 2;
    const anio = 2026;
    const start = new Date(anio, mes - 1, 1);
    const end = new Date(anio, mes, 0, 23, 59, 59);

    console.log('Query Range:', { start, end });

    const entries = await prisma.accountingEntry.findMany({
        where: {
            estado: "APROBADO",
            deletedAt: null,
            fecha: {
                gte: start,
                lte: end
            }
        }
    });

    console.log('Found Entries for Feb 2026:', entries.length);
    entries.forEach(e => {
        console.log(`- ${e.numero}: ${e.cuentaContable}, ${e.monto}, ${e.tipo}, ${e.fecha}`);
    });

    const months = await prisma.accountingEntry.groupBy({
        by: ['estado'],
        _count: true
    });
    console.log('All Entries by Status:', months);
}

diagnose()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
