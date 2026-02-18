
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting Treasury Flow Test...')

    const timestamp = Date.now()
    const user = await prisma.user.findFirst()
    if (!user) throw new Error("No user found")

    // 1. Setup Data
    console.log('\n📦 1. Setup...')
    const provider = await prisma.entity.create({
        data: {
            tipo: 'PROVEEDOR',
            nombre: `Treasury Prov ${timestamp}`,
            ruc: `RUC-T-${timestamp}`,
            direccion: 'Treasury Lane',
            telefono: '22222222',
            email: `treasury${timestamp}@test.com`
        }
    })

    const budget = await prisma.budgetItem.create({
        data: {
            codigo: `BUDGET-T-${timestamp}`,
            nombre: `Treasury Budget ${timestamp}`,
            anio: 2026,
            categoria: 'GASTOS_CORRIENTES',
            montoAsignado: 10000,
            montoDisponible: 10000,
            tipoGasto: 'FUNCIONAMIENTO',
            centroRegional: 'MANAGUA',
            creadoPorId: user.id
        }
    })

    const order = await prisma.purchaseOrder.create({
        data: {
            numero: `OC-T-${timestamp}`,
            proveedorId: provider.id,
            budgetItemId: budget.id,
            elaboradoPorId: user.id,
            estado: 'COMPLETADO',
            fechaEmision: new Date(),
            fechaEntrega: new Date(),
            moneda: 'NIO',
            total: 5000,
            items: {
                create: [{ descripcion: 'Test Item', cantidad: 1, unidadMedida: 'U', precioUnitario: 5000, total: 5000 }]
            }
        }
    })

    // 2. Request Payment
    console.log('\n💰 2. Requesting Payment...')
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
            referencia: `Pago OC ${order.numero}`,
            usuarioId: user.id,
            entityId: provider.id,
            purchaseOrderId: order.id,
            budgetItemId: budget.id
        }
    })
    console.log(`   -> Check Request Created: ${check.numero} (${check.estado})`)

    // 3. Emit Check (Set Bank Details)
    console.log('\n🏦 3. Emitting Check...')
    const emittedCheck = await prisma.check.update({
        where: { id: check.id },
        data: {
            estado: 'EMITIDO',
            banco: 'BANPRO',
            cuentaBancaria: '100100123'
        }
    })
    console.log(`   -> Check Emitted: ${emittedCheck.numero} (${emittedCheck.estado})`)
    console.log(`   -> Bank: ${emittedCheck.banco}`)

    // 4. Deliver Check
    console.log('\n🤝 4. Delivering Check...')
    const deliveredCheck = await prisma.check.update({
        where: { id: check.id },
        data: {
            chequeEntregado: true,
            // referencia: emittedCheck.referencia + " - ENTREGADO" // Optional note
        }
    })
    console.log(`   -> Check Delivered: ${deliveredCheck.chequeEntregado}`)

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
