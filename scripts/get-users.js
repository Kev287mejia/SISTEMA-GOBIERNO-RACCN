const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getUsers() {
    const users = await prisma.user.findMany({
        take: 5,
        select: { id: true, email: true, role: true }
    });
    console.log('Users:', users);
}

getUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
