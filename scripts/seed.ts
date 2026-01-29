import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@sistema.com" },
    update: {},
    create: {
      email: "admin@sistema.com",
      password: adminPassword,
      nombre: "Administrador",
      apellido: "Sistema",
      role: Role.Admin,
      activo: true,
    },
  })

  // Create Contador General
  const contadorPassword = await bcrypt.hash("contador123", 10)
  const contador = await prisma.user.upsert({
    where: { email: "contador@sistema.com" },
    update: {},
    create: {
      email: "contador@sistema.com",
      password: contadorPassword,
      nombre: "Juan",
      apellido: "Pérez",
      role: Role.ContadorGeneral,
      activo: true,
    },
  })

  // Create Auxiliar Contable
  const auxiliarPassword = await bcrypt.hash("auxiliar123", 10)
  const auxiliar = await prisma.user.upsert({
    where: { email: "auxiliar@sistema.com" },
    update: {},
    create: {
      email: "auxiliar@sistema.com",
      password: auxiliarPassword,
      nombre: "María",
      apellido: "González",
      role: Role.AuxiliarContable,
      activo: true,
    },
  })

  // Create Presupuesto user
  const presupuestoPassword = await bcrypt.hash("presupuesto123", 10)
  const presupuesto = await prisma.user.upsert({
    where: { email: "presupuesto@sistema.com" },
    update: {},
    create: {
      email: "presupuesto@sistema.com",
      password: presupuestoPassword,
      nombre: "Carlos",
      apellido: "Rodríguez",
      role: Role.Presupuesto,
      activo: true,
    },
  })

  // Create Bodega user
  const bodegaPassword = await bcrypt.hash("bodega123", 10)
  const bodega = await prisma.user.upsert({
    where: { email: "bodega@sistema.com" },
    update: {},
    create: {
      email: "bodega@sistema.com",
      password: bodegaPassword,
      nombre: "Ana",
      apellido: "Martínez",
      role: Role.Bodega,
      activo: true,
    },
  })

  // Create RRHH user
  const rrhhPassword = await bcrypt.hash("rrhh123", 10)
  const rrhh = await prisma.user.upsert({
    where: { email: "rrhh@sistema.com" },
    update: {},
    create: {
      email: "rrhh@sistema.com",
      password: rrhhPassword,
      nombre: "Luis",
      apellido: "Sánchez",
      role: Role.RRHH,
      activo: true,
    },
  })

  // Create Auditor user
  const auditorPassword = await bcrypt.hash("auditor123", 10)
  const auditor = await prisma.user.upsert({
    where: { email: "auditor@sistema.com" },
    update: {},
    create: {
      email: "auditor@sistema.com",
      password: auditorPassword,
      nombre: "Patricia",
      apellido: "López",
      role: Role.Auditor,
      activo: true,
    },
  })

  // Create Coordinador user
  const coordinadorPassword = await bcrypt.hash("coordinador123", 10)
  const coordinador = await prisma.user.upsert({
    where: { email: "coordinador@sistema.com" },
    update: {},
    create: {
      email: "coordinador@sistema.com",
      password: coordinadorPassword,
      nombre: "Roberto",
      apellido: "Jiménez",
      role: Role.CoordinadorGobierno as any,
      activo: true,
    },
  })

  // Create Directora DAF user
  const dafPassword = await bcrypt.hash("daf123", 10)
  const daf = await prisma.user.upsert({
    where: { email: "directora_daf@sistema.com" },
    update: {},
    create: {
      email: "directora_daf@sistema.com",
      password: dafPassword,
      nombre: "Elena",
      apellido: "Rodríguez",
      role: Role.DirectoraDAF as any,
      activo: true,
    },
  })

  // Create Directora RRHH user
  const drrhhPassword = await bcrypt.hash("drrhh123", 10)
  const drrhh = await prisma.user.upsert({
    where: { email: "directora_rrhh@sistema.com" },
    update: {},
    create: {
      email: "directora_rrhh@sistema.com",
      password: drrhhPassword,
      nombre: "Carmen",
      apellido: "Vargas",
      role: Role.DirectoraRRHH as any,
      activo: true,
    },
  })

  // Create Responsable de Caja
  const cajaPassword = await bcrypt.hash("caja2026", 10)
  const cajera = await prisma.user.upsert({
    where: { email: "meissy.escobar@graccnn.gob.ni" },
    update: {
      nombre: "Meissy Hallely",
      apellido: "Escobar Kandler",
      cedula: "607-240568-0003x",
      cargo: "Responsable de Caja (Cajera)",
      departamento: "Tesorería / Caja",
      role: Role.ResponsableCaja as any,
      activo: true
    },
    create: {
      email: "meissy.escobar@graccnn.gob.ni",
      password: cajaPassword,
      nombre: "Meissy Hallely",
      apellido: "Escobar Kandler",
      cedula: "607-240568-0003x",
      cargo: "Responsable de Caja (Cajera)",
      departamento: "Tesorería / Caja",
      role: Role.ResponsableCaja as any,
      activo: true,
    },
  })

  // Create Responsable Contabilidad (Julio Lopez Escobar)
  const julioPassword = await bcrypt.hash("julio2026", 10)
  const julio = await prisma.user.upsert({
    where: { email: "julio.lopez@graccnn.gob.ni" },
    update: {
      nombre: "Julio",
      apellido: "Lopez Escobar",
      cedula: "607-140373-0002B",
      cargo: "Contador General",
      departamento: "Dirección Administrativa Financiera – Contabilidad",
      role: Role.ContadorGeneral,
      activo: true
    },
    create: {
      email: "julio.lopez@graccnn.gob.ni",
      password: julioPassword,
      nombre: "Julio",
      apellido: "Lopez Escobar",
      cedula: "607-140373-0002B",
      cargo: "Contador General",
      departamento: "Dirección Administrativa Financiera – Contabilidad",
      role: Role.ContadorGeneral,
      activo: true,
    },
  })

  // Create Responsable Presupuesto (Yahira Tucker Medina)
  const yahiraPassword = await bcrypt.hash("presupuesto2024", 10)
  const yahira = await prisma.user.upsert({
    where: { email: "yahira.tucker@graccnn.gob.ni" },
    update: {
      nombre: "Yahira",
      apellido: "Tucker Medina",
      cedula: "607-305560-0000V",
      cargo: "Responsable de Presupuesto",
      departamento: "Dirección Administrativa Financiera",
      role: Role.ResponsablePresupuesto as any,
      activo: true
    },
    create: {
      email: "yahira.tucker@graccnn.gob.ni",
      password: yahiraPassword,
      nombre: "Yahira",
      apellido: "Tucker Medina",
      cedula: "607-305560-0000V",
      cargo: "Responsable de Presupuesto",
      departamento: "Dirección Administrativa Financiera",
      role: Role.ResponsablePresupuesto as any,
      activo: true,
    },
  })

  // Create Coordinador de Gobierno (Carlos José Aleman Cunningham)
  const coordinadorGobPassword = await bcrypt.hash("coordinador2026", 10)
  const coordinadorGob = await prisma.user.upsert({
    where: { email: "carlos.aleman@graccnn.gob.ni" },
    update: {
      nombre: "Carlos José",
      apellido: "Aleman Cunningham",
      cedula: "607-081073-003V",
      cargo: "Coordinador del Gobierno Regional",
      departamento: "Coordinación de Gobierno",
      role: Role.CoordinadorGobierno as any,
      activo: true
    },
    create: {
      email: "carlos.aleman@graccnn.gob.ni",
      password: coordinadorGobPassword,
      nombre: "Carlos José",
      apellido: "Aleman Cunningham",
      cedula: "607-081073-003V",
      cargo: "Coordinador del Gobierno Regional",
      departamento: "Coordinación de Gobierno",
      role: Role.CoordinadorGobierno as any,
      activo: true,
    },
  })

  // Create Directora DAF (Youngren Elizabeth Kinsham Moody)
  const dafUserPassword = await bcrypt.hash("daf2026", 10)
  const dafUser = await prisma.user.upsert({
    where: { email: "youngren.kinsham@graccnn.gob.ni" },
    update: {
      nombre: "Youngren Elizabeth",
      apellido: "Kinsham Moody",
      cedula: "607-151183-0005A",
      cargo: "Directora de la División Administrativa Financiera",
      departamento: "Dirección Administrativa Financiera",
      role: Role.DirectoraDAF as any,
      activo: true
    },
    create: {
      email: "youngren.kinsham@graccnn.gob.ni",
      password: dafUserPassword,
      nombre: "Youngren Elizabeth",
      apellido: "Kinsham Moody",
      cedula: "607-151183-0005A",
      cargo: "Directora de la División Administrativa Financiera",
      departamento: "Dirección Administrativa Financiera",
      role: Role.DirectoraDAF as any,
      activo: true,
    },
  })

  // Create Directora RRHH (Vicky Aracely González Filiponi)
  const rrhhUserPassword = await bcrypt.hash("rrhh2026", 10)
  const rrhhUser = await prisma.user.upsert({
    where: { email: "vicky.gonzalez@graccnn.gob.ni" },
    update: {
      nombre: "Vicky Aracely",
      apellido: "González Filiponi",
      cedula: "608-240878-0004J",
      cargo: "Directora División de Recursos Humanos",
      departamento: "División de Recursos Humanos",
      role: Role.DirectoraRRHH as any,
      activo: true
    },
    create: {
      email: "vicky.gonzalez@graccnn.gob.ni",
      password: rrhhUserPassword,
      nombre: "Vicky Aracely",
      apellido: "González Filiponi",
      cedula: "608-240878-0004J",
      cargo: "Directora División de Recursos Humanos",
      departamento: "División de Recursos Humanos",
      role: Role.DirectoraRRHH as any,
      activo: true,
    },
  })

  // Create Responsable Crédito (Lic. Sofia Loren Montoya Melgara)
  const creditoUserPassword = await bcrypt.hash("credito2026", 10)
  const creditoUser = await prisma.user.upsert({
    where: { email: "sofia.montoya@graccnn.gob.ni" },
    update: {
      nombre: "Sofia Loren",
      apellido: "Montoya Melgara",
      cedula: "607-080882-0000Y",
      cargo: "Responsable de Crédito (Caja Chica)",
      departamento: "Dirección Administrativa Financiera – Contabilidad",
      role: Role.ResponsableCredito as any,
      activo: true
    },
    create: {
      email: "sofia.montoya@graccnn.gob.ni",
      password: creditoUserPassword,
      nombre: "Sofia Loren",
      apellido: "Montoya Melgara",
      cedula: "607-080882-0000Y",
      cargo: "Responsable de Crédito (Caja Chica)",
      departamento: "Dirección Administrativa Financiera – Contabilidad",
      role: Role.ResponsableCredito as any,
      activo: true,
    },
  })

  // Clean up existing accounts to avoid duplicates or unwanted data
  try {
    await prisma.bankAccount.deleteMany({}) // Reset Accounts
    console.log("Deleted old accounts.")
  } catch (e) {
    console.log("No accounts to delete or table missing.")
  }

  const accountsToCreate = [
    {
      name: "CUENTA UNICA DEL TESORO",
      number: "10012705232122",
      type: "CORRIENTE",
      balance: 5000000.00,
      min: 100000,
      center: "TESORERIA-CENTRAL"
    },
    {
      name: "FONDOS PROPIOS",
      number: "10012705232114",
      type: "CORRIENTE",
      balance: 850000.00,
      min: 20000,
      center: "RECAUDACION"
    },
    {
      name: "TRANSFERENCIAS MUNICIPALES",
      number: "10012700003635",
      type: "CORRIENTE",
      balance: 2100000.00,
      min: 50000,
      center: "TRANSFERENCIAS"
    },
    {
      name: "NOMINA FISCAL",
      number: "10012701792120",
      type: "AHORRO",
      balance: 1200000.00,
      min: 10000,
      center: "RRHH-NOMINA"
    },
    {
      name: "PROYECTOS DE INVERSION",
      number: "10012700003255",
      type: "AHORRO",
      balance: 3500000.00,
      min: 50000,
      center: "PROYECTOS"
    },
    {
      name: "FONDO DE EMERGENCIA",
      number: "10012705883967",
      type: "AHORRO",
      balance: 500000.00,
      min: 25000,
      center: "EMERGENCIA"
    }
  ]

  console.log("Seeding 6 Correct BANPRO Accounts...")

  for (const acc of accountsToCreate) {
    await prisma.bankAccount.create({
      data: {
        bankName: "BANPRO",
        accountNumber: acc.number,
        accountName: acc.name,
        accountType: acc.type,
        currency: "CS",
        openingBalance: acc.balance,
        currentBalance: acc.balance,
        minBalance: acc.min,
        status: "ACTIVE",
        isActive: true,
        region: "GRACCN",
        costCenter: acc.center
      }
    })
  }
  console.log("Bank Accounts Seeded.")

  // Create Standard Budget Items (Partidas por Defecto)
  console.log("Seeding Standard Budget Items...")

  const budgetItems = [
    {
      code: "201-01",
      name: "COMBUSTIBLE Y LUBRICANTES",
      initial: 1500000,
      type: "FUNCIONAMIENTO",
      region: "BILWI",
      desc: "Suministro de combustible para flota vehicular institucional"
    },
    {
      code: "202-01",
      name: "VIÁTICOS AL INTERIOR",
      initial: 800000,
      type: "FUNCIONAMIENTO",
      region: "BILWI",
      desc: "Gastos de viaje y movilización de personal"
    },
    {
      code: "301-05",
      name: "MATERIALES DE OFICINA",
      initial: 450000,
      type: "FUNCIONAMIENTO",
      region: "BILWI",
      desc: "Papelería y útiles de escritorio"
    },
    {
      code: "401-02",
      name: "MANTENIMIENTO DE VEHÍCULOS",
      initial: 600000,
      type: "FUNCIONAMIENTO",
      region: "BILWI",
      desc: "Reparación y mantenimiento preventivo"
    },
    {
      code: "601-01",
      name: "CONSTRUCCIÓN PUENTE BILWI VILLA HERMOSA",
      initial: 3500000,
      type: "INVERSION",
      region: "BILWI",
      desc: "Proyecto de infraestructura vial estrategica"
    },
    {
      code: "602-15",
      name: "REHABILITACIÓN ESCUELA COMUNIDAD WASPAM",
      initial: 1200000,
      type: "INVERSION",
      region: "WASPAM",
      desc: "Mejoramiento de infraestructura educativa"
    }
  ]

  for (const item of budgetItems) {
    await prisma.budgetItem.upsert({
      where: { codigo: item.code },
      update: {
        montoDisponible: item.initial,
        descripcion: item.desc
      },
      create: {
        codigo: item.code,
        nombre: item.name,
        montoAsignado: item.initial,
        montoDisponible: item.initial,
        tipoGasto: item.type as any, // BudgetType enum
        anio: 2026,
        estado: "APROBADO" as any, // BudgetStatus
        centroRegional: item.region as any,
        descripcion: item.desc,
        creadoPorId: presupuesto.id, // Assigned to Presupuesto User
        categoria: "GASTO_CORRIENTE" // Fallback
      }
    })
  }

  console.log("Budget Items Seeded.")

  // Create Default Petty Cash
  console.log("Seeding Default Petty Cash...")
  await prisma.pettyCash.upsert({
    where: { nombre: "CAJA CHICA - ADMINISTRACION" },
    update: {},
    create: {
      nombre: "CAJA CHICA - ADMINISTRACION",
      montoInicial: 20000.00,
      montoActual: 20000.00,
      estado: "ACTIVA",
      usuarioId: creditoUser.id,
      institution: "GOBIERNO"
    }
  })
  console.log("Petty Cash Seeded.")

}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
