import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  getHRRecordSchema,
  updateHRRecordSchema,
} from "@/lib/validations/hr"
import { auditUpdate, auditDelete } from "@/lib/audit"

/**
 * GET /api/hr/records/[id]
 * Get a single HR record by ID
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

    const validatedParams = getHRRecordSchema.parse({ id: params.id })

    const record = await prisma.hRRecord.findUnique({
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
      },
    })

    if (!record) {
      return NextResponse.json(
        { error: "Registro de RRHH no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        ...record,
        salario: record.salario ? Number(record.salario) : null,
      },
    })
  } catch (error: any) {
    console.error("Error getting HR record:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "ID inválido", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al obtener el registro de RRHH" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/hr/records/[id]
 * Update an HR record
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
    const validatedData = updateHRRecordSchema.parse({
      ...body,
      id: params.id,
    })

    const { id, ...updateData } = validatedData

    const existing = await prisma.hRRecord.findUnique({
      where: { id },
    })

    if (!existing || existing.deletedAt) {
      return NextResponse.json(
        { error: "Registro de RRHH no encontrado" },
        { status: 404 }
      )
    }

    const updated = await prisma.hRRecord.update({
      where: { id },
      data: updateData,
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

    await auditUpdate(
      "HRRecord",
      id,
      `Actualización de registro RRHH: ${updated.empleadoNombre}`,
      existing,
      updated
    )

    return NextResponse.json({
      data: {
        ...updated,
        salario: updated.salario ? Number(updated.salario) : null,
      },
      message: "Registro de RRHH actualizado exitosamente",
    })
  } catch (error: any) {
    console.error("Error updating HR record:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Error al actualizar el registro de RRHH" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/hr/records/[id]
 * Soft delete an HR record
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

    const validatedParams = getHRRecordSchema.parse({ id: params.id })

    const existing = await prisma.hRRecord.findUnique({
      where: { id: validatedParams.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Registro de RRHH no encontrado" },
        { status: 404 }
      )
    }

    if (existing.deletedAt) {
      return NextResponse.json(
        { error: "El registro ya ha sido eliminado" },
        { status: 400 }
      )
    }

    const deleted = await prisma.hRRecord.update({
      where: { id: validatedParams.id },
      data: {
        deletedAt: new Date(),
        estado: "INACTIVO",
      },
    })

    await auditDelete(
      "HRRecord",
      validatedParams.id,
      `Eliminación de registro RRHH: ${existing.empleadoNombre}`,
      existing
    )

    return NextResponse.json({
      message: "Registro de RRHH eliminado exitosamente",
    })
  } catch (error: any) {
    console.error("Error deleting HR record:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "ID inválido", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Error al eliminar el registro de RRHH" },
      { status: 500 }
    )
  }
}
