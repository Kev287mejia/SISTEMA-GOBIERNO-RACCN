
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting Budget Logic Test...')

    // 1. Setup Data
    const timestamp = Date.now()

    // Get a user for "elaboradoPor"
    const user = await prisma.user.findFirst()
    if (!user) {
        console.error('❌ No user found to create order')
        return
    }

    // Create Test Provider
    const provider = await prisma.entity.create({
        data: {
            tipo: 'PROVEEDOR',
            nombre: `Test Provider ${timestamp}`,
            ruc: `T${timestamp}`,
            direccion: 'Test Address',
            telefono: '12345678',
            email: `test${timestamp}@provider.com`
        }
    })
    console.log(`✅ Created Provider: ${provider.nombre}`)

    // Create Test Budget Item (1000 NIO)
    const budgetItem = await prisma.budgetItem.create({
        data: {
            codigo: `TEST-BUDGET-${timestamp}`,
            nombre: `Test Budget ${timestamp}`,
            montoAsignado: 1000,
            montoDisponible: 1000,
            anio: 2026,
            categoria: 'GASTOS_CORRIENTES',
            creadoPorId: user.id,
            tipoGasto: 'INVERSION',
            centroRegional: 'MANAGUA'
        }
    })
    console.log(`✅ Created Budget Item: ${budgetItem.codigo} with 1000.00`)

    // 2. Test: Insufficient Funds
    console.log('\n🧪 Test 1: Creating Order for 1500.00 (Should Fail)')
    try {
        await prisma.$transaction(async (tx) => {
            const item = await tx.budgetItem.findUnique({ where: { id: budgetItem.id } })
            if (!item) throw new Error("Budget missing")

            const totalOrder = 1500

            if (Number(item.montoDisponible) < totalOrder) {
                throw new Error(`Fondos insuficientes. Disponible: ${item.montoDisponible}, Requerido: ${totalOrder}`)
            }

            // Should not reach here
            await tx.budgetItem.update({
                where: { id: budgetItem.id },
                data: { montoDisponible: { decrement: totalOrder } }
            })
        })
        console.error('❌ Test 1 FAILED: Order should have been rejected')
    } catch (e: any) {
        console.log(`✅ Test 1 PASSED: Caught expected error -> "${e.message}"`)
    }

    // 3. Test: Sufficient Funds
    console.log('\n🧪 Test 2: Creating Order for 400.00 (Should Succeed)')
    try {
        await prisma.$transaction(async (tx) => {
            const item = await tx.budgetItem.findUnique({ where: { id: budgetItem.id } })
            if (!item) throw new Error("Budget missing")

            const totalOrder = 400

            if (Number(item.montoDisponible) < totalOrder) {
                throw new Error(`Fondos insuficientes.`)
            }

            await tx.budgetItem.update({
                where: { id: budgetItem.id },
                data: { montoDisponible: { decrement: totalOrder } }
            })

            // Create Dummy Order
            await tx.purchaseOrder.create({
                data: {
                    numero: `OC-TEST-${timestamp}`,
                    proveedorId: provider.id,
                    budgetItemId: budgetItem.id,
                    elaboradoPorId: user.id,
                    total: totalOrder,
                    subtotal: totalOrder,
                    estado: 'BORRADOR',
                    moneda: 'NIO',
                    tasaCambio: 1
                }
            })
        })
        console.log('✅ Test 2 PASSED: Order created')
    } catch (e: any) {
        console.error(`❌ Test 2 FAILED: ${e.message}`)
    }

    // 4. Verify Final Balance
    const finalBudget = await prisma.budgetItem.findUnique({ where: { id: budgetItem.id } })
    console.log(`\n💰 Final Budget Available: ${finalBudget?.montoDisponible} (Expected: 600)`)

    if (Number(finalBudget?.montoDisponible) === 600) {
        console.log('✅ Balance Verification PASSED')
    } else {
        console.error('❌ Balance Verification FAILED')
    }

    // Cleanup
    try {
        await prisma.purchaseOrder.deleteMany({ where: { numero: `OC-TEST-${timestamp}` } })
        await prisma.budgetItem.delete({ where: { id: budgetItem.id } })
        await prisma.entity.delete({ where: { id: provider.id } })
    } catch (e) { console.log('Cleanup error (ignorable):', e) }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
