import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createAccountingEntrySchema, listAccountingEntriesSchema } from "@/lib/validations/accounting"
import { createAccountingEntry } from "@/lib/accounting"
import { EntryStatus, Role as PrismaRole, NotificationType } from "@prisma/client"
import { SecurityAudit } from "@/lib/security/audit"

/**
 * GET /api/accounting-entries
 * List accounting entries with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const query = {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
      tipo: searchParams.get("tipo") || undefined,
      institucion: searchParams.get("institucion") || undefined,
      estado: searchParams.get("estado") || undefined,
      fechaDesde: searchParams.get("fechaDesde") || undefined,
      fechaHasta: searchParams.get("fechaHasta") || undefined,
      search: searchParams.get("search") || undefined,
      hasCheck: searchParams.get("hasCheck") || undefined,
    }

    const validatedQuery = listAccountingEntriesSchema.parse(query)

    const canSeeDeleted = session?.user?.role === "Admin" || session?.user?.role === "Auditor"
    const includeDeleted = searchParams.get("includeDeleted") === "true" && canSeeDeleted

    const where: any = {
      ...(includeDeleted ? {} : { deletedAt: null }),
    }

    if (validatedQuery.tipo) {
      where.tipo = validatedQuery.tipo
    }

    if (validatedQuery.institucion) {
      where.institucion = validatedQuery.institucion
    }

    if (validatedQuery.estado) {
      where.estado = validatedQuery.estado as EntryStatus
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
        { descripcion: { contains: validatedQuery.search, mode: "insensitive" } },
        { numero: { contains: validatedQuery.search, mode: "insensitive" } },
        { cuentaContable: { contains: validatedQuery.search, mode: "insensitive" } },
      ]
    }

    if (query.hasCheck === "true") {
      where.check = { isNot: null }
    } else if (query.hasCheck === "false") {
      where.check = null
    }

    const skip = (validatedQuery.page - 1) * validatedQuery.limit

    const [entries, total, closedPeriods] = await Promise.all([
      prisma.accountingEntry.findMany({
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
          aprobadoPor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          check: true,
        },
      }),
      prisma.accountingEntry.count({ where }),
      prisma.accountingClosure.findMany({
        where: { estado: 'CERRADO' }
      })
    ])

    const entriesWithLock = entries.map((entry: any) => ({
      ...entry,
      isLocked: closedPeriods.some((cp: any) =>
        cp.mes === (entry.fecha.getMonth() + 1) &&
        cp.anio === entry.fecha.getFullYear()
      )
    }))

    return NextResponse.json({
      data: entriesWithLock,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total,
        totalPages: Math.ceil(total / validatedQuery.limit),
      },
    })
  } catch (error: any) {
    console.error("Error listing accounting entries:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Parámetros de consulta inválidos", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al obtener los asientos contables" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/accounting-entries
 * Create a new accounting entry
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const forbiddenRoles = ["CoordinadorGobierno", "DirectoraDAF"]
    if (!session?.user || forbiddenRoles.includes(session?.user?.role)) {
      return NextResponse.json(
        { error: "No tiene permisos para realizar esta acción" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createAccountingEntrySchema.parse(body)

    const entry = await createAccountingEntry(validatedData)

    // Security Audit Analyze (Unusual Operations Detection)
    await SecurityAudit.analyzeEntry(entry, session.user.id, session.user.name || "Usuario")

    // Notify financial team about new entry
    const { createNotification } = await import("@/lib/notifications")
    await createNotification({
      type: NotificationType.INFO,
      title: "Nuevo Asiento Contable",
      message: `${session.user.name} creó el asiento ${entry.numero}: ${entry.descripcion}`,
      link: "/contabilidad",
      roles: [PrismaRole.Admin, PrismaRole.ContadorGeneral, PrismaRole.DirectoraDAF]
    })

    return NextResponse.json(
      { data: entry, message: "Asiento contable creado exitosamente" },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating accounting entry:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    if (error.message === "Usuario no autenticado") {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Error al crear el asiento contable" },
      { status: 500 }
    )
  }
}
