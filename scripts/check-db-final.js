const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countAll() {
    const tot = await prisma.accountingEntry.count();
    const app = await prisma.accountingEntry.count({ where: { estado: 'APROBADO' } });
    console.log(`Total entries: ${tot}, Approved: ${app}`);

    const sample = await prisma.accountingEntry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { numero: true, estado: true, fecha: true, monto: true }
    });
    console.log('Last 5 entries:', sample);
}

countAll()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
