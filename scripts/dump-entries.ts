
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const entries = await prisma.accountingEntry.findMany({
        select: {
            id: true,
            numero: true,
            fecha: true,
            descripcion: true,
            monto: true,
            tipo: true,
            institucion: true,
            estado: true,
            cuentaContable: true,
            creadoPor: {
                select: { nombre: true, apellido: true, email: true }
            }
        }
    })

    console.log(JSON.stringify(entries, null, 2))
}

main().finally(() => prisma.$disconnect())
