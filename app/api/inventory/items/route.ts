import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  createInventoryItemSchema,
  listInventoryItemsSchema,
} from "@/lib/validations/inventory"
import { auditCreate } from "@/lib/audit"

/**
 * GET /api/inventory/items
 * List inventory items with pagination and filters
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
      categoria: searchParams.get("categoria") || undefined,
      search: searchParams.get("search") || undefined,
      activo: searchParams.get("activo") || undefined,
    }

    const validatedQuery = listInventoryItemsSchema.parse(query)

    const where: any = {
      deletedAt: null,
    }

    if (validatedQuery.categoria) {
      where.categoria = validatedQuery.categoria
    }

    if (validatedQuery.activo !== undefined) {
      where.activo = validatedQuery.activo
    }

    if (validatedQuery.search) {
      where.OR = [
        { nombre: { contains: validatedQuery.search, mode: "insensitive" } },
        { codigo: { contains: validatedQuery.search, mode: "insensitive" } },
        {
          descripcion: { contains: validatedQuery.search, mode: "insensitive" },
        },
      ]
    }

    const skip = (validatedQuery.page - 1) * validatedQuery.limit

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        skip,
        take: validatedQuery.limit,
        orderBy: {
          nombre: "asc",
        },
        include: {
          creadoPor: {
            select: {
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          _count: {
            select: {
              transacciones: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      }),
      prisma.inventoryItem.count({ where }),
    ])

    return NextResponse.json({
      data: items.map((item: any) => ({
        ...item,
        stockActual: Number(item.stockActual),
        stockMinimo: Number(item.stockMinimo),
        stockMaximo: item.stockMaximo ? Number(item.stockMaximo) : null,
        costoUnitario: Number(item.costoUnitario),
        transaccionesCount: item._count.transacciones,
      })),
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total,
        totalPages: Math.ceil(total / validatedQuery.limit),
      },
    })
  } catch (error: any) {
    console.error("Error listing inventory items:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Parámetros de consulta inválidos", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al obtener los items de inventario" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/items
 * Create a new inventory item
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createInventoryItemSchema.parse(body)

    // Check if code already exists
    const existing = await prisma.inventoryItem.findUnique({
      where: { codigo: validatedData.codigo },
    })

    if (existing && !existing.deletedAt) {
      return NextResponse.json(
        { error: "Ya existe un item con este código" },
        { status: 400 }
      )
    }

    const item = await prisma.inventoryItem.create({
      data: {
        ...validatedData,
        stockActual: 0,
        creadoPor: {
          connect: { id: session.user.id }
        },
      },
    })

    await auditCreate(
      "InventoryItem",
      item.id,
      `Creación de item de inventario: ${item.nombre} (${item.codigo})`,
      item
    )

    return NextResponse.json(
      {
        data: {
          ...item,
          stockActual: Number(item.stockActual),
          stockMinimo: Number(item.stockMinimo),
          stockMaximo: item.stockMaximo ? Number(item.stockMaximo) : null,
          costoUnitario: Number(item.costoUnitario),
        },
        message: "Item de inventario creado exitosamente",
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating inventory item:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Error al crear el item de inventario" },
      { status: 500 }
    )
  }
}
