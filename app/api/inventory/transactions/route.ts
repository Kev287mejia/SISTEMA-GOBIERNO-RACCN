import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  createInventoryTransactionSchema,
  listInventoryTransactionsSchema,
} from "@/lib/validations/inventory"
import { createInventoryTransaction } from "@/lib/inventory"

/**
 * GET /api/inventory/transactions
 * List inventory transactions with pagination and filters
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
      itemId: searchParams.get("itemId") || undefined,
      tipo: searchParams.get("tipo") || undefined,
      fechaDesde: searchParams.get("fechaDesde") || undefined,
      fechaHasta: searchParams.get("fechaHasta") || undefined,
    }

    const validatedQuery = listInventoryTransactionsSchema.parse(query)

    const where: any = {
      deletedAt: null,
    }

    if (validatedQuery.itemId) {
      where.itemId = validatedQuery.itemId
    }

    if (validatedQuery.tipo) {
      where.tipo = validatedQuery.tipo as any
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

    const skip = (validatedQuery.page - 1) * validatedQuery.limit

    const [transactions, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        skip,
        take: validatedQuery.limit,
        orderBy: {
          fecha: "desc",
        },
        include: {
          item: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              unidadMedida: true,
            },
          },
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          accountingEntry: {
            select: {
              id: true,
              numero: true,
              tipo: true,
              monto: true,
            },
          },
        },
      }),
      prisma.inventoryTransaction.count({ where }),
    ])

    return NextResponse.json({
      data: transactions.map((t) => ({
        ...t,
        cantidad: Number(t.cantidad),
        costoUnitario: Number(t.costoUnitario),
        costoTotal: Number(t.costoTotal),
        accountingEntry: t.accountingEntry
          ? {
            ...t.accountingEntry,
            monto: Number(t.accountingEntry.monto),
          }
          : null,
      })),
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total,
        totalPages: Math.ceil(total / validatedQuery.limit),
      },
    })
  } catch (error: any) {
    console.error("Error listing inventory transactions:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Parámetros de consulta inválidos", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al obtener las transacciones de inventario" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/transactions
 * Create a new inventory transaction
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createInventoryTransactionSchema.parse(body)

    const transaction = await createInventoryTransaction(validatedData)

    return NextResponse.json(
      {
        data: {
          ...transaction,
          cantidad: Number(transaction.cantidad),
          costoUnitario: Number(transaction.costoUnitario),
          costoTotal: Number(transaction.costoTotal),
        },
        message: "Transacción de inventario creada exitosamente",
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating inventory transaction:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    if (
      error.message === "Usuario no autenticado" ||
      error.message === "Item de inventario no encontrado" ||
      error.message === "Stock insuficiente" ||
      error.message === "Asiento contable no encontrado"
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        error: error.message || "Error al crear la transacción de inventario",
      },
      { status: 500 }
    )
  }
}
