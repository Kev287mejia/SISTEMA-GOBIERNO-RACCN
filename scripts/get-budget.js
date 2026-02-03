const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getBudget() {
    const items = await prisma.budgetItem.findMany({
        where: { anio: 2026 },
        select: { id: true, codigo: true, nombre: true }
    });
    console.log('Budget Items 2026:', items);
}

getBudget()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
