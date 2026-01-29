import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAccountingEntrySchema, updateAccountingEntrySchema } from "@/lib/validations/accounting"
import { updateAccountingEntry, deleteAccountingEntry } from "@/lib/accounting"

/**
 * GET /api/accounting-entries/[id]
 * Get a single accounting entry by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const validatedParams = getAccountingEntrySchema.parse({ id: params.id })

    const entry = await prisma.accountingEntry.findUnique({
      where: {
        id: validatedParams.id,
        deletedAt: null,
      },
      include: {
        creadoPor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            role: true,
          },
        },
        aprobadoPor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            role: true,
          },
        },
      },
    })

    if (!entry) {
      return NextResponse.json(
        { error: "Asiento contable no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: entry })
  } catch (error: any) {
    console.error("Error getting accounting entry:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "ID inválido", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al obtener el asiento contable" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/accounting-entries/[id]
 * Update an accounting entry
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    const forbiddenRoles = ["CoordinadorGobierno", "DirectoraDAF"]
    if (!session?.user || forbiddenRoles.includes((session.user as any).role)) {
      return NextResponse.json(
        { error: "No tiene permisos para modificar registros" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateAccountingEntrySchema.parse({
      ...body,
      id: params.id,
    })

    const { id, ...updateData } = validatedData

    const entry = await updateAccountingEntry(id as string, updateData as any)

    return NextResponse.json({
      data: entry,
      message: "Asiento contable actualizado exitosamente",
    })
  } catch (error: any) {
    console.error("Error updating accounting entry:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    if (
      error.message === "Usuario no autenticado" ||
      error.message === "Asiento contable no encontrado" ||
      error.message === "No se puede actualizar un asiento eliminado" ||
      error.message === "No se puede actualizar un asiento aprobado"
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Error al actualizar el asiento contable" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/accounting-entries/[id]
 * Soft delete an accounting entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    const forbiddenRoles = ["CoordinadorGobierno", "DirectoraDAF"]
    if (!session?.user || forbiddenRoles.includes((session.user as any).role)) {
      return NextResponse.json(
        { error: "No tiene permisos para eliminar registros" },
        { status: 403 }
      )
    }

    const validatedParams = getAccountingEntrySchema.parse({ id: params.id })

    await deleteAccountingEntry(validatedParams.id)

    return NextResponse.json({
      message: "Asiento contable eliminado exitosamente",
    })
  } catch (error: any) {
    console.error("Error deleting accounting entry:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "ID inválido", details: error.errors },
        { status: 400 }
      )
    }

    if (
      error.message === "Usuario no autenticado" ||
      error.message === "Asiento contable no encontrado" ||
      error.message === "El asiento ya ha sido eliminado" ||
      error.message.includes("No se puede eliminar un asiento aprobado")
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Error al eliminar el asiento contable" },
      { status: 500 }
    )
  }
}
