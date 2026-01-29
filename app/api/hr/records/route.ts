import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  createHRRecordSchema,
  listHRRecordsSchema,
} from "@/lib/validations/hr"
import { auditCreate } from "@/lib/audit"
import { HRRecordType } from "@prisma/client"

/**
 * GET /api/hr/records
 * List HR records with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
      tipo: searchParams.get("tipo") || undefined,
      estado: searchParams.get("estado") || undefined,
      departamento: searchParams.get("departamento") || undefined,
      fechaDesde: searchParams.get("fechaDesde") || undefined,
      fechaHasta: searchParams.get("fechaHasta") || undefined,
      search: searchParams.get("search") || undefined,
      empleadoCedula: searchParams.get("empleadoCedula") || undefined,
    }

    const validatedQuery = listHRRecordsSchema.parse(query)

    const where: any = {
      deletedAt: null,
    }

    if (validatedQuery.tipo) {
      where.tipo = validatedQuery.tipo
    }

    if (validatedQuery.estado) {
      where.estado = validatedQuery.estado
    }

    if (validatedQuery.departamento) {
      where.departamento = validatedQuery.departamento
    }

    if (validatedQuery.empleadoCedula) {
      where.empleadoCedula = validatedQuery.empleadoCedula
    }

    if (validatedQuery.fechaDesde || validatedQuery.fechaHasta) {
      where.fecha = {}
      if (validatedQuery.fechaDesde) {
        where.fecha.gte = validatedQuery.fechaDesde
      }
      if (validatedQuery.fechaHasta) {
        where.fecha.lte = validatedQuery.fechaHasta
      }
    }

    if (validatedQuery.search) {
      where.OR = [
        { empleadoNombre: { contains: validatedQuery.search, mode: "insensitive" as const } },
        { empleadoCedula: { contains: validatedQuery.search, mode: "insensitive" as const } },
        { cargo: { contains: validatedQuery.search, mode: "insensitive" as const } },
        { departamento: { contains: validatedQuery.search, mode: "insensitive" as const } },
        { descripcion: { contains: validatedQuery.search, mode: "insensitive" as const } },
      ]
    }

    const skip = (validatedQuery.page - 1) * validatedQuery.limit

    const [records, total] = await Promise.all([
      prisma.hRRecord.findMany({
        where,
        skip,
        take: validatedQuery.limit,
        orderBy: {
          fecha: "desc",
        },
        include: {
          creadoPor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
        },
      }),
      prisma.hRRecord.count({ where }),
    ])

    return NextResponse.json({
      data: records.map((record) => ({
        ...record,
        salario: record.salario ? Number(record.salario) : null,
      })),
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total,
        totalPages: Math.ceil(total / validatedQuery.limit),
      },
    })
  } catch (error: any) {
    console.error("Error listing HR records:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Parámetros de consulta inválidos", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al obtener los registros de RRHH" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/hr/records
 * Create a new HR record
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createHRRecordSchema.parse(body)

    const record = await prisma.hRRecord.create({
      data: {
        ...validatedData,
        creadoPorId: session.user.id,
      },
      include: {
        creadoPor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
    })

    await auditCreate(
      "HRRecord",
      record.id,
      `Creación de registro RRHH: ${record.tipo} - ${record.empleadoNombre}`,
      record
    )

    return NextResponse.json(
      {
        data: {
          ...record,
          salario: record.salario ? Number(record.salario) : null,
        },
        message: "Registro de RRHH creado exitosamente",
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating HR record:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Error al crear el registro de RRHH" },
      { status: 500 }
    )
  }
}
