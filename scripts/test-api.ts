// Quick test to simulate the API call
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function testAPI() {
    console.log("\n=== Testing Budget Items API Logic ===\n")

    // Test 1: Get all items (no filter)
    const where1: any = { deletedAt: null }
    const items1 = await prisma.budgetItem.findMany({ where: where1 })
    console.log(`Test 1 - No filters: Found ${items1.length} items`)

    // Test 2: Filter with "all" (should be ignored)
    const centroRegional = "all"
    const tipoGasto = "all"
    const where2: any = { deletedAt: null }
    if (centroRegional && centroRegional !== 'all') where2.centroRegional = centroRegional
    if (tipoGasto && tipoGasto !== 'all') where2.tipoGasto = tipoGasto
    const items2 = await prisma.budgetItem.findMany({ where: where2 })
    console.log(`Test 2 - With "all" filters: Found ${items2.length} items`)

    // Test 3: Filter by BILWI
    const where3: any = { deletedAt: null, centroRegional: "BILWI" }
    const items3 = await prisma.budgetItem.findMany({ where: where3 })
    console.log(`Test 3 - Filter BILWI: Found ${items3.length} items`)

    // Test 4: Filter by FUNCIONAMIENTO
    const where4: any = { deletedAt: null, tipoGasto: "FUNCIONAMIENTO" }
    const items4 = await prisma.budgetItem.findMany({ where: where4 })
    console.log(`Test 4 - Filter FUNCIONAMIENTO: Found ${items4.length} items`)

    console.log("\n=== Sample Item ===")
    if (items1.length > 0) {
        console.log(JSON.stringify(items1[0], null, 2))
    }
}

testAPI()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
