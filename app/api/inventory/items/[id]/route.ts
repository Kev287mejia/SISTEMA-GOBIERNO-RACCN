import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  getInventoryItemSchema,
  updateInventoryItemSchema,
} from "@/lib/validations/inventory"
import { auditUpdate, auditDelete } from "@/lib/audit"

/**
 * GET /api/inventory/items/[id]
 * Get a single inventory item by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const validatedParams = getInventoryItemSchema.parse({ id: params.id })

    const item = await prisma.inventoryItem.findUnique({
      where: {
        id: validatedParams.id,
        deletedAt: null,
      },
      include: {
        creadoPor: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        transacciones: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            fecha: "desc",
          },
          take: 10,
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
            accountingEntry: {
              select: {
                id: true,
                numero: true,
                tipo: true,
              },
            },
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
    })

    if (!item) {
      return NextResponse.json(
        { error: "Item de inventario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        ...item,
        stockActual: Number(item.stockActual),
        stockMinimo: Number(item.stockMinimo),
        stockMaximo: item.stockMaximo ? Number(item.stockMaximo) : null,
        costoUnitario: Number(item.costoUnitario),
        transacciones: item.transacciones.map((t: any) => ({
          ...t,
          cantidad: Number(t.cantidad),
          costoUnitario: Number(t.costoUnitario),
          costoTotal: Number(t.costoTotal),
        })),
        transaccionesCount: item._count.transacciones,
      },
    })
  } catch (error: any) {
    console.error("Error getting inventory item:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "ID inválido", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al obtener el item de inventario" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/inventory/items/[id]
 * Update an inventory item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateInventoryItemSchema.parse({
      ...body,
      id: params.id,
    })

    const { id, ...updateData } = validatedData

    const existing = await prisma.inventoryItem.findUnique({
      where: { id },
    })

    if (!existing || existing.deletedAt) {
      return NextResponse.json(
        { error: "Item de inventario no encontrado" },
        { status: 404 }
      )
    }

    // Check if code is being changed and if it conflicts
    if (updateData.codigo && updateData.codigo !== existing.codigo) {
      const codeExists = await prisma.inventoryItem.findUnique({
        where: { codigo: updateData.codigo },
      })

      if (codeExists && !codeExists.deletedAt && codeExists.id !== id) {
        return NextResponse.json(
          { error: "Ya existe un item con este código" },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: updateData,
    })

    await auditUpdate(
      "InventoryItem",
      id,
      `Actualización de item de inventario: ${updated.nombre}`,
      existing,
      updated
    )

    return NextResponse.json({
      data: {
        ...updated,
        stockActual: Number(updated.stockActual),
        stockMinimo: Number(updated.stockMinimo),
        stockMaximo: updated.stockMaximo ? Number(updated.stockMaximo) : null,
        costoUnitario: Number(updated.costoUnitario),
      },
      message: "Item de inventario actualizado exitosamente",
    })
  } catch (error: any) {
    console.error("Error updating inventory item:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Error al actualizar el item de inventario" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/inventory/items/[id]
 * Soft delete an inventory item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const validatedParams = getInventoryItemSchema.parse({ id: params.id })

    const existing = await prisma.inventoryItem.findUnique({
      where: { id: validatedParams.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Item de inventario no encontrado" },
        { status: 404 }
      )
    }

    if (existing.deletedAt) {
      return NextResponse.json(
        { error: "El item ya ha sido eliminado" },
        { status: 400 }
      )
    }

    const deleted = await prisma.inventoryItem.update({
      where: { id: validatedParams.id },
      data: {
        deletedAt: new Date(),
        activo: false,
      },
    })

    await auditDelete(
      "InventoryItem",
      validatedParams.id,
      `Eliminación de item de inventario: ${existing.nombre}`,
      existing
    )

    return NextResponse.json({
      message: "Item de inventario eliminado exitosamente",
    })
  } catch (error: any) {
    console.error("Error deleting inventory item:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "ID inválido", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Error al eliminar el item de inventario" },
      { status: 500 }
    )
  }
}
