
import { PrismaClient, EntryStatus, EntryType, Institution } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("Generando asientos contables de prueba (2026)...")

    // Obtener usuario Julio (Responsable Contabilidad) o Admin para asignar la creación
    const creator = await prisma.user.findFirst({
        where: {
            OR: [
                { role: "ResponsableContabilidad" },
                { role: "Admin" }
            ]
        }
    })

    if (!creator) {
        console.error("No se encontró usuario para crear los asientos. Ejecuta el seed principal primero.")
        return
    }

    // Helper to get enum or fallback
    const getInst = () => "GOBIERNO" as Institution;

    const entries = [
        {
            numero: "AS-2026-001",
            fecha: new Date("2026-01-15"),
            descripcion: "Pago de Servicios Básicos (Energía y Agua) - Enero",
            monto: 45000.00,
            tipo: "EGRESO" as EntryType,
            cuentaContable: "2-1-01-002",
            institucion: getInst(),
            estado: EntryStatus.APROBADO,
            creadoPorId: creator.id
        },
        {
            numero: "AS-2026-002",
            fecha: new Date("2026-01-18"),
            descripcion: "Compra de Suministros de Oficina y Papelería",
            monto: 12500.50,
            tipo: "EGRESO" as EntryType,
            cuentaContable: "2-1-02-005",
            institucion: getInst(),
            estado: EntryStatus.PENDIENTE,
            creadoPorId: creator.id
        },
        {
            numero: "AS-2026-003",
            fecha: new Date("2026-01-20"),
            descripcion: "Transferencia Recibida - Ministerio de Hacienda",
            monto: 1500000.00,
            tipo: "INGRESO" as EntryType,
            cuentaContable: "1-1-01-001",
            institucion: getInst(),
            estado: EntryStatus.APROBADO,
            creadoPorId: creator.id
        },
        {
            numero: "AS-2026-004",
            fecha: new Date("2026-01-22"),
            descripcion: "Pago de Viáticos - Gira de Campo Bilwi",
            monto: 8400.00,
            tipo: "EGRESO" as EntryType,
            cuentaContable: "2-1-05-001",
            institucion: getInst(),
            estado: EntryStatus.PENDIENTE,
            creadoPorId: creator.id
        },
        {
            numero: "AS-2026-005",
            fecha: new Date("2026-01-25"),
            descripcion: "Mantenimiento de Vehículos Institucionales (Flota 1)",
            monto: 32000.00,
            tipo: "EGRESO" as EntryType,
            cuentaContable: "2-1-06-003",
            institucion: getInst(),
            estado: EntryStatus.PENDIENTE,
            creadoPorId: creator.id
        },
        {
            numero: "AS-2026-006",
            fecha: new Date("2026-01-26"),
            descripcion: "Compra de Combustible - Cupones",
            monto: 55000.00,
            tipo: "EGRESO" as EntryType,
            cuentaContable: "2-1-01-003",
            institucion: getInst(),
            estado: EntryStatus.PENDIENTE,
            creadoPorId: creator.id
        },
        {
            numero: "AS-2026-007",
            fecha: new Date("2026-01-27"),
            descripcion: "Ingreso por Tasas y Servicios Municipales",
            monto: 28500.00,
            tipo: "INGRESO" as EntryType,
            cuentaContable: "1-1-02-004",
            institucion: getInst(),
            estado: EntryStatus.PENDIENTE,
            creadoPorId: creator.id
        },
        {
            numero: "AS-2026-008",
            fecha: new Date("2026-01-28"),
            descripcion: "Pago de Nómina Eventual - Enero",
            monto: 124000.00,
            tipo: "EGRESO" as EntryType,
            cuentaContable: "2-1-01-001",
            institucion: getInst(),
            estado: EntryStatus.BORRADOR,
            creadoPorId: creator.id
        }
    ]

    // Limpiar antes de insertar para evitar duplicados si se corre varias veces
    await prisma.accountingEntry.deleteMany({})

    for (const entry of entries) {
        try {
            await prisma.accountingEntry.create({
                data: entry
            })
        } catch (e) {
            console.log("Error creando entrada " + entry.numero + ": " + e)
        }
    }

    console.log(`✅ Se insertaron ${entries.length} asientos contables de prueba (Año 2026).`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
