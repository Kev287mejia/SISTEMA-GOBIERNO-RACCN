import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getAccountingEntrySchema } from "@/lib/validations/accounting"
import { approveAccountingEntry } from "@/lib/accounting"

/**
 * POST /api/accounting-entries/[id]/approve
 * Approve an accounting entry
 */
export async function POST(
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

    // Check if user has permission to approve (Admin or ContadorGeneral)
    if (
      session.user.role !== "Admin" &&
      session.user.role !== "ContadorGeneral"
    ) {
      return NextResponse.json(
        { error: "No tiene permisos para aprobar asientos contables" },
        { status: 403 }
      )
    }

    const validatedParams = getAccountingEntrySchema.parse({ id: params.id })

    const entry = await approveAccountingEntry(validatedParams.id)

    return NextResponse.json({
      data: entry,
      message: "Asiento contable aprobado exitosamente",
    })
  } catch (error: any) {
    console.error("Error approving accounting entry:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "ID inválido", details: error.errors },
        { status: 400 }
      )
    }

    if (
      error.message === "Usuario no autenticado" ||
      error.message === "Asiento contable no encontrado" ||
      error.message === "No se puede aprobar un asiento eliminado" ||
      error.message === "El asiento ya está aprobado"
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Error al aprobar el asiento contable" },
      { status: 500 }
    )
  }
}
