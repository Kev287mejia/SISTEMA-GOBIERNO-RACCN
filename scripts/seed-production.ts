
import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting PRODUCTION SEED...')

    // ------------------------------------------------------------------
    // 1. INSTITUTIONAL USERS (Based on Report Recommendations)
    // ------------------------------------------------------------------
    console.log('\n👤 1. Seeding Users...')

    const users = [
        {
            email: "admin@graccnn.gob.ni",
            name: "Administrador",
            lastName: "Sistema",
            role: Role.Admin,
            cedula: "000-000000-0000A",
            position: "Administrador del Sistema",
            dept: "Informática"
        },
        {
            email: "julio.lopez@graccnn.gob.ni",
            name: "Julio",
            lastName: "Lopez Escobar",
            role: Role.ContadorGeneral,
            cedula: "607-140373-0002B",
            position: "Contador General",
            dept: "Contabilidad"
        },
        {
            email: "yahira.tucker@graccnn.gob.ni",
            name: "Yahira",
            lastName: "Tucker Medina",
            role: Role.ResponsablePresupuesto,
            cedula: "607-305560-0000V",
            position: "Responsable de Presupuesto",
            dept: "Presupuesto"
        },
        {
            email: "meissy.escobar@graccnn.gob.ni",
            name: "Meissy Hallely",
            lastName: "Escobar Kandler",
            role: Role.ResponsableCaja,
            cedula: "607-240568-0003X",
            position: "Responsable de Caja",
            dept: "Tesorería"
        },
        {
            email: "sofia.montoya@graccnn.gob.ni",
            name: "Sofia Loren",
            lastName: "Montoya Melgara",
            role: Role.ResponsableCredito,
            cedula: "607-080882-0000Y",
            position: "Resp. Fondo Revolvente",
            dept: "Caja Chica"
        },
        {
            email: "youngren.kinsham@graccnn.gob.ni",
            name: "Youngren Elizabeth",
            lastName: "Kinsham Moody",
            role: Role.DirectoraDAF,
            cedula: "607-151183-0005A",
            position: "Directora DAF",
            dept: "Dirección Administrativa Financiera"
        },
        {
            email: "carlos.aleman@graccnn.gob.ni",
            name: "Carlos José",
            lastName: "Aleman Cunningham",
            role: Role.CoordinadorGobierno,
            cedula: "607-081073-0003V",
            position: "Coordinador de Gobierno",
            dept: "Despacho"
        },
        {
            email: "vicky.gonzalez@graccnn.gob.ni",
            name: "Vicky Aracely",
            lastName: "González Filiponi",
            role: Role.DirectoraRRHH,
            cedula: "608-240878-0004J",
            position: "Directora RRHH",
            dept: "Recursos Humanos"
        },
        {
            email: "patricia.lopez@graccnn.gob.ni",
            name: "Patricia",
            lastName: "López",
            role: Role.Auditor,
            cedula: "607-101080-0001C", // Dummy
            position: "Auditor Interno",
            dept: "Auditoría Interna"
        },
        {
            email: "ana.martinez@graccnn.gob.ni",
            name: "Ana",
            lastName: "Martínez",
            role: Role.Bodega,
            cedula: "607-200585-0002L", // Dummy
            position: "Responsable de Bodega",
            dept: "Servicios Generales"
        }
    ]

    const passwordHash = await bcrypt.hash("sistema2026", 10) // Standard password for initial rollout

    for (const u of users) {
        const userRole = u.role as any // Type assertion for Prisma Compatibility if conflicting enums

        // Create/Update User
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {
                nombre: u.name,
                apellido: u.lastName,
                role: userRole,
                cargo: u.position,
                departamento: u.dept,
                cedula: u.cedula,
                activo: true
            },
            create: {
                email: u.email,
                password: passwordHash,
                nombre: u.name,
                apellido: u.lastName,
                role: userRole,
                cargo: u.position,
                departamento: u.dept,
                cedula: u.cedula,
                activo: true
            }
        })
        console.log(`   -> Upserted User: ${user.email} (${user.role})`)

        // Create Employee Record for RRHH Module
        const existingEmployee = await prisma.employee.findUnique({
            where: { cedula: u.cedula }
        })

        if (!existingEmployee) {
            await prisma.employee.create({
                data: {
                    cedula: u.cedula,
                    nombre: u.name,
                    apellido: u.lastName,
                    email: u.email,
                    fechaIngreso: new Date('2024-01-15'), // Assume hire date
                    estado: 'ACTIVO',
                    direccion: 'Puerto Cabezas, RACCN',
                    telefono: '8888-8888',
                    genero: 'M',
                    fechaNacimiento: new Date('1985-05-20'),
                    banco: 'BANPRO',
                    tipoCuenta: 'NOMINA',
                    numeroCuenta: '1002345678' // Dummy
                }
            })
            console.log(`      -> Created Employee Record for ${u.name}`)
        }
    }

    // ------------------------------------------------------------------
    // 2. BUDGET MASTER DATA (Presupuesto 2026)
    // ------------------------------------------------------------------
    console.log('\n💰 2. Seeding Budget 2026...')

    // Clean existing logic could be here, but using upsert is safer.

    const budgetItems = [
        // MANAGUA
        { code: "201-01-MGA", name: "Combustible y Lubricantes (Managua)", amount: 500000, region: "MANAGUA" },
        { code: "202-01-MGA", name: "Viaticos al Interior (Managua)", amount: 300000, region: "MANAGUA" },
        { code: "301-05-MGA", name: "Materiales de Oficina (Managua)", amount: 150000, region: "MANAGUA" },

        // BILWI
        { code: "201-01-BLW", name: "Combustible y Lubricantes (Bilwi)", amount: 1500000, region: "BILWI" },
        { code: "202-01-BLW", name: "Viaticos al Interior (Bilwi)", amount: 800000, region: "BILWI" },
        { code: "301-05-BLW", name: "Materiales de Oficina (Bilwi)", amount: 450000, region: "BILWI" },
        { code: "401-02-BLW", name: "Mantenimiento Vehicular (Bilwi)", amount: 600000, region: "BILWI" },

        // WASPAM
        { code: "201-01-WSP", name: "Combustible y Lubricantes (Waspam)", amount: 400000, region: "WASPAM" },
        { code: "602-15-WSP", name: "Rehabilitación Escuela Comunidad", amount: 1200000, region: "WASPAM", type: "INVERSION" },

        // PRINZAPOLKA
        { code: "201-01-PZK", name: "Combustible Panga (Prinzapolka)", amount: 350000, region: "PRINZAPOLKA" },
    ]

    const presupuestoUser = await prisma.user.findFirst({ where: { role: Role.ResponsablePresupuesto } })

    if (presupuestoUser) {
        for (const item of budgetItems) {
            await prisma.budgetItem.upsert({
                where: { codigo: item.code },
                update: {},
                create: {
                    codigo: item.code,
                    nombre: item.name,
                    montoAsignado: item.amount,
                    montoDisponible: item.amount,
                    anio: 2026,
                    tipoGasto: (item.type || "FUNCIONAMIENTO") as any,
                    centroRegional: item.region as any,
                    categoria: "GASTOS_CORRIENTES",
                    estado: "APROBADO",
                    creadoPorId: presupuestoUser.id
                }
            })
        }
        console.log(`   -> Seeded ${budgetItems.length} Budget Items (2026)`)
    } else {
        console.log("   ⚠️ Skipping Budget: User not found")
    }

    // ------------------------------------------------------------------
    // 3. INVENTORY MASTER DATA
    // ------------------------------------------------------------------
    console.log('\n📦 3. Seeding Inventory Master...',)

    const inventoryItems = [
        { code: "SUM-001", name: "Resma Papel Bond Carta", unit: "RESMA", cat: "SUMINISTROS", cost: 180, stock: 50 },
        { code: "SUM-002", name: "Resma Papel Bond Oficio", unit: "RESMA", cat: "SUMINISTROS", cost: 210, stock: 30 },
        { code: "SUM-003", name: "Toner HP 85A", unit: "UNIDAD", cat: "SUMINISTROS", cost: 2500, stock: 10 },
        { code: "ACT-001", name: "Laptop Dell Latitude", unit: "UNIDAD", cat: "ACTIVO_FIJO", cost: 35000, stock: 5 },
        { code: "ACT-002", name: "Silla Ejecutiva Ergonómica", unit: "UNIDAD", cat: "ACTIVO_FIJO", cost: 4500, stock: 12 },
    ]

    for (const item of inventoryItems) {
        await prisma.inventoryItem.upsert({
            where: { codigo: item.code },
            update: { stockActual: item.stock },
            create: {
                codigo: item.code,
                nombre: item.name,
                unidadMedida: item.unit,
                categoria: item.cat,
                costoUnitario: item.cost,
                stockActual: item.stock,
                stockMinimo: 5,
                metodoKardex: 'FIFO'
            }
        })
    }
    console.log(`   -> Seeded ${inventoryItems.length} Inventory Items`)

    // ------------------------------------------------------------------
    // 4. BANK ACCOUNTS & OPENING BALANCES
    // ------------------------------------------------------------------
    console.log('\n🏦 4. Seeding Bank Accounts...')

    // await prisma.bankAccount.deleteMany({}) // Unsafe

    const accounts = [
        { name: "CUENTA UNICA DEL TESORO", number: "1001-2705-2321-22", balance: 5000000, type: "CORRIENTE" },
        { name: "RECAUDACION RENTAS", number: "1001-2705-2321-14", balance: 850000, type: "CORRIENTE" },
        { name: "TRANSFERENCIAS MUNICIPALES", number: "1001-2700-0036-35", balance: 2100000, type: "CORRIENTE" },
        { name: "PROYECTOS DE INVERSION", number: "1001-2700-0032-55", balance: 3500000, type: "AHORRO" },
    ]

    for (const acc of accounts) {
        await prisma.bankAccount.upsert({
            where: { accountNumber: acc.number },
            update: {
                // Optional: Update balance if desired, or leave as is
            },
            create: {
                bankName: "BANPRO",
                accountName: acc.name,
                accountNumber: acc.number,
                accountType: acc.type,
                currency: "NIO",
                openingBalance: acc.balance,
                currentBalance: acc.balance,
                status: "ACTIVE",
                isActive: true,
                region: "GRACCN",
                costCenter: "TESORERIA"
            }
        })
    }
    console.log(`   -> Seeded ${accounts.length} Bank Accounts`)

    console.log('\n✅ PRODUCTION SEED COMPLETE')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
