const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    const monthsWithEntries = await prisma.accountingEntry.groupBy({
        by: ['fecha'],
        _count: true,
    });

    const summary = monthsWithEntries.reduce((acc, entry) => {
        const d = new Date(entry.fecha);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        acc[key] = (acc[key] || 0) + entry._count;
        return acc;
    }, {});

    console.log('Accounting Entries Summary:', summary);

    const budgetItems = await prisma.budgetItem.findMany({
        select: { anio: true, codigo: true, nombre: true }
    });
    console.log('Budget Items:', budgetItems);
}

checkData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
