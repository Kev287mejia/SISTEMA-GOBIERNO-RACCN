const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const items = await prisma.budgetItem.findMany({
        where: { anio: 2026 },
        select: { id: true, codigo: true, nombre: true }
    });
    console.log(JSON.stringify(items, null, 2));
}

main().finally(() => prisma.$disconnect());
