
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting Full Purchasing Cycle Test...')

    const timestamp = Date.now()
    const user = await prisma.user.findFirst()
    if (!user) throw new Error("No user found")

    // 1. Setup: Provider & Budget
    console.log('\n📦 1. Setting up Master Data...')
    const provider = await prisma.entity.create({
        data: {
            tipo: 'PROVEEDOR',
            nombre: `Provider ${timestamp}`,
            ruc: `RUC${timestamp}`,
            direccion: 'Test Address',
            telefono: '88888888',
            email: `prov${timestamp}@test.com`
        }
    })

    const budget = await prisma.budgetItem.create({
        data: {
            codigo: `BUDGET-${timestamp}`,
            nombre: `General Budget ${timestamp}`,
            anio: 2026,
            categoria: 'GASTOS_CORRIENTES',
            montoAsignado: 10000,
            montoDisponible: 10000, // Starts full
            tipoGasto: 'FUNCIONAMIENTO',
            centroRegional: 'MANAGUA',
            creadoPorId: user.id
        }
    })
    console.log(`   -> Provider: ${provider.nombre}`)
    console.log(`   -> Budget: ${budget.codigo} (Available: ${budget.montoDisponible})`)

    // 2. Create Order (Validation & Reservation)
    console.log('\n📝 2. Creating Purchase Order (Cost: 2,500)...')
    const orderTotal = 2500

    // A. Transaction to Create Order and Reserve Budget
    const order = await prisma.$transaction(async (tx) => {
        // Check Budget
        const b = await tx.budgetItem.findUnique({ where: { id: budget.id } })
        if (!b || Number(b.montoDisponible) < orderTotal) throw new Error("Insufficient funds")

        // Reserve
        await tx.budgetItem.update({
            where: { id: budget.id },
            data: { montoDisponible: { decrement: orderTotal } }
        })

        // Create Order
        return await tx.purchaseOrder.create({
            data: {
                numero: `OC-TEST-${timestamp}`,
                proveedorId: provider.id,
                budgetItemId: budget.id,
                elaboradoPorId: user.id,
                estado: 'AUTORIZADO', // Simulate approval directly for testing
                fechaEmision: new Date(),
                moneda: 'NIO',
                subtotal: 2500,
                total: 2500,
                items: {
                    create: [
                        {
                            descripcion: `Laptop Test ${timestamp}`,
                            cantidad: 2,
                            unidadMedida: 'UNIDAD',
                            precioUnitario: 1250,
                            total: 2500
                        }
                    ]
                }
            },
            include: { items: true }
        })
    })
    console.log(`   -> Order Created: ${order.numero}`)
    console.log(`   -> Status: ${order.estado}`)

    // Verify Budget Deduction
    const budgetAfterOrder = await prisma.budgetItem.findUnique({ where: { id: budget.id } })
    console.log(`   -> Budget Available: ${budgetAfterOrder?.montoDisponible} (Expected: 7500)`)

    // 3. Receive Order (Inventory Entry)
    console.log('\n🚚 3. Receiving Order in Warehouse...')

    // Simulate the API Logic for Reception
    const receptionResult = await prisma.$transaction(async (tx) => {
        // Create/Find Inventory Item
        const item = order.items[0]
        const code = `ART-${timestamp}`

        const invItem = await tx.inventoryItem.create({
            data: {
                codigo: code,
                nombre: item.descripcion,
                unidadMedida: item.unidadMedida,
                categoria: 'TECNOLOGIA',
                costoUnitario: item.precioUnitario,
                stockActual: 0 // Initial
            }
        })

        // Create Transaction
        await tx.inventoryTransaction.create({
            data: {
                tipo: 'ENTRADA',
                itemId: invItem.id,
                cantidad: item.cantidad, // 2
                costoUnitario: item.precioUnitario,
                costoTotal: item.total,
                usuarioId: user.id,
                observaciones: `Reception of ${order.numero}`,
                numeroDocumento: order.numero
            }
        })

        // Update Stock
        await tx.inventoryItem.update({
            where: { id: invItem.id },
            data: {
                stockActual: { increment: item.cantidad }, // +2
            }
        })

        // Update Order
        await tx.purchaseOrder.update({
            where: { id: order.id },
            data: { estado: 'COMPLETADO', fechaEntrega: new Date() }
        })

        return invItem
    })

    // 4. Verification
    console.log('\n✅ 4. Final Verifications:')

    // A. Order Status
    const finalOrder = await prisma.purchaseOrder.findUnique({ where: { id: order.id } })
    console.log(`   -> Order Status: ${finalOrder?.estado} (Expected: COMPLETADO)`)

    // B. Inventory Stock
    const finalItem = await prisma.inventoryItem.findUnique({ where: { id: receptionResult.id } })
    console.log(`   -> Inventory Stock: ${finalItem?.stockActual} (Expected: 2)`)
    console.log(`   -> Inventory Cost: ${finalItem?.costoUnitario}`)

    // Cleanup
    console.log('\n🧹 Cleaning up test data...')
    await prisma.inventoryTransaction.deleteMany({ where: { numeroDocumento: order.numero } })
    await prisma.inventoryItem.delete({ where: { id: receptionResult.id } })
    await prisma.purchaseOrder.delete({ where: { id: order.id } }) // Cascade deletes items
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
