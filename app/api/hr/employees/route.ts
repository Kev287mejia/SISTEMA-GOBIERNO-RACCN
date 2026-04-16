import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session?.user?.role !== Role.Admin && session?.user?.role !== Role.RRHH && session?.user?.role !== Role.ContadorGeneral)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")

    const where = search ? {
      OR: [
        { nombre: { contains: search, mode: 'insensitive' as const } },
        { apellido: { contains: search, mode: 'insensitive' as const } },
        { cedula: { contains: search } },
      ]
    } : {}

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        contratos: {
          where: { estado: 'ACTIVO' },
          include: { cargo: true },
          take: 1
        }
      }
    })

    return NextResponse.json(employees)
  } catch (error) {
    console.error("[EMPLOYEES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session?.user?.role !== Role.Admin && session?.user?.role !== Role.RRHH)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const {
      nombre,
      apellido,
      cedula,
      inss,
      ruc,
      email,
      telefono,
      direccion,
      fechaNacimiento,
      genero,
      estadoCivil,
      profesion,
      nivelAcademico,
      hijos,
      contactoEmergencia,
      telefonoEmergencia,
      fechaIngreso,
      cargoId,
      salario,
      tipoContrato,
      banco,
      tipoCuenta,
      numeroCuenta
    } = body

    if (!nombre || !apellido || !cedula || !fechaIngreso) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { cedula }
    })

    if (existingEmployee) {
      return new NextResponse("Employee with this ID already exists", { status: 409 })
    }

    // Create employee and initial contract in transaction
    const employee = await prisma.$transaction(async (tx) => {
      const newEmployee = await tx.employee.create({
        data: {
          nombre,
          apellido,
          cedula,
          inss,
          ruc,
          email,
          telefono,
          direccion,
          fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
          genero,
          estadoCivil,
          profesion,
          nivelAcademico,
          hijos: hijos ? parseInt(hijos) : 0,
          contactoEmergencia,
          telefonoEmergencia,
          fechaIngreso: new Date(fechaIngreso),
          banco,
          tipoCuenta,
          numeroCuenta
        }
      })

      if (cargoId && salario) {
        await tx.contract.create({
          data: {
            empleadoId: newEmployee.id,
            cargoId,
            salarioBase: salario,
            tipo: tipoContrato || 'INDEFINIDO',
            fechaInicio: new Date(fechaIngreso),
          }
        })
      }

      return newEmployee
    })

    // Real-time notification for HR
    try {
      const { createNotification } = await import("@/lib/notifications")
      const { Role: PrismaRole, NotificationType } = await import("@prisma/client")
      await createNotification({
        type: NotificationType.SUCCESS,
        title: "Nuevo Empleado Registrado",
        message: `${session.user.name} registró a ${employee.nombre} ${employee.apellido}`,
        link: `/rrhh/employees`,
        roles: [PrismaRole.Admin, PrismaRole.DirectoraRRHH, PrismaRole.RRHH]
      })
    } catch (notifError) {
      console.error("Failed to send HR notification:", notifError)
    }

    // Log action
    await prisma.auditLog.create({
      data: {
        accion: 'CREATE',
        entidad: 'Employee',
        entidadId: employee.id,
        descripcion: `Created employee ${employee.nombre} ${employee.apellido}`,
        datosNuevos: JSON.parse(JSON.stringify(employee)),
        usuarioId: session.user.id
      }
    })

    return NextResponse.json(employee)
  } catch (error) {
    console.error("[EMPLOYEES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
