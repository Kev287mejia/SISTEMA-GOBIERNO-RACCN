
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting Payment Request Test...')

    const timestamp = Date.now()
    const user = await prisma.user.findFirst()
    if (!user) throw new Error("No user found")

    // 1. Setup: Provider & Budget
    console.log('\n📦 1. Setting up Master Data...')
    const provider = await prisma.entity.create({
        data: {
            tipo: 'PROVEEDOR',
            nombre: `Provider Pay ${timestamp}`,
            ruc: `RUC-PAY-${timestamp}`,
            direccion: 'Test Address',
            telefono: '88888888',
            email: `pay${timestamp}@test.com`
        }
    })

    const budget = await prisma.budgetItem.create({
        data: {
            codigo: `BUDGET-PAY-${timestamp}`,
            nombre: `Payment Budget ${timestamp}`,
            anio: 2026,
            categoria: 'GASTOS_CORRIENTES',
            montoAsignado: 5000,
            montoDisponible: 5000,
            tipoGasto: 'FUNCIONAMIENTO',
            centroRegional: 'MANAGUA',
            creadoPorId: user.id
        }
    })

    // 2. Create Order & Receive it
    console.log('\n📝 2. Creating and Receiving Order...')
    const order = await prisma.purchaseOrder.create({
        data: {
            numero: `OC-PAY-${timestamp}`,
            proveedorId: provider.id,
            budgetItemId: budget.id,
            elaboradoPorId: user.id,
            estado: 'COMPLETADO', // Directly Completed for this test
            fechaEmision: new Date(),
            fechaEntrega: new Date(),
            moneda: 'NIO',
            subtotal: 1000,
            total: 1000,
            items: {
                create: [
                    {
                        descripcion: `Service Test ${timestamp}`,
                        cantidad: 1,
                        unidadMedida: 'SERVICIO',
                        precioUnitario: 1000,
                        total: 1000
                    }
                ]
            }
        }
    })
    console.log(`   -> Order Created & Completed: ${order.numero}`)

    // 3. Request Payment
    console.log('\n💰 3. Requesting Payment (Simulating API)...')

    // Simulate API Logic
    const requestNumber = `SOL-${order.numero}`
    const check = await prisma.check.create({
        data: {
            numero: requestNumber,
            tipo: 'EMITIDO',
            estado: 'CHEQUE_REQUESTED',
            banco: 'PENDIENTE',
            cuentaBancaria: 'PENDIENTE',
            beneficiario: provider.nombre,
            monto: order.total,
            fecha: new Date(),
            referencia: `Pago de Orden de Compra ${order.numero}`,
            usuarioId: user.id,
            entityId: provider.id,
            purchaseOrderId: order.id,
            budgetItemId: order.budgetItemId
        }
    })
    console.log(`   -> Payment Request Created: ${check.numero}`)
    console.log(`   -> Status: ${check.estado}`)
    console.log(`   -> Link to Order: ${check.purchaseOrderId}`)

    // 4. Verify Link from Order side
    const orderWithChecks = await prisma.purchaseOrder.findUnique({
        where: { id: order.id },
        include: { checks: true }
    })
    console.log(`\n✅ 4. Verify Order Link:`)
    console.log(`   -> Order has ${orderWithChecks?.checks.length} checks`)
    console.log(`   -> Check ID matches: ${orderWithChecks?.checks[0].id === check.id}`)

    // Cleanup
    console.log('\n🧹 Cleaning up...')
    await prisma.check.delete({ where: { id: check.id } })
    await prisma.purchaseOrder.delete({ where: { id: order.id } })
    await prisma.budgetItem.delete({ where: { id: budget.id } })
    await prisma.entity.delete({ where: { id: provider.id } })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
