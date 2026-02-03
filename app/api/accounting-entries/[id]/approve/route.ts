import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { canApproveEntry } from "@/lib/evidence-config"

/**
 * POST /api/accounting-entries/[id]/approve
 * Approve an accounting entry with evidence validation
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

    // Only certain roles can approve entries
    const allowedRoles: Role[] = [
      Role.Admin,
      Role.ContadorGeneral,
      Role.ResponsableContabilidad,
      Role.DirectoraDAF,
      Role.CoordinadorGobierno,
    ]

    if (!allowedRoles.includes(session.user.role as Role)) {
      return NextResponse.json(
        { error: "No tiene permisos para aprobar asientos contables" },
        { status: 403 }
      )
    }

    // Get the entry
    const entry = await prisma.accountingEntry.findUnique({
      where: { id: params.id, deletedAt: null },
    })

    if (!entry) {
      return NextResponse.json(
        { error: "Asiento contable no encontrado" },
        { status: 404 }
      )
    }

    // Check if already approved
    if (entry.estado === "APROBADO") {
      return NextResponse.json(
        { error: "Este asiento ya ha sido aprobado" },
        { status: 400 }
      )
    }

    // Validate evidence requirements
    const validation = canApproveEntry(
      Number(entry.monto),
      entry.evidenciaUrls,
      entry.estado
    )

    if (!validation.canApprove) {
      return NextResponse.json(
        {
          error: validation.reason,
          requiresEvidence: true,
          currentEvidenceCount: entry.evidenciaUrls.length,
        },
        { status: 400 }
      )
    }

    // Approve the entry
    const updatedEntry = await prisma.accountingEntry.update({
      where: { id: params.id },
      data: {
        estado: "APROBADO",
        aprobadoPorId: session.user.id,
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
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        usuarioId: session.user.id,
        accion: "APPROVE",
        entidad: "AccountingEntry",
        entidadId: params.id,
        descripcion: `Asiento ${entry.numero} aprobado por ${session.user.name || session.user.email}`,
        datosNuevos: {
          entryNumber: entry.numero,
          amount: Number(entry.monto),
          evidenceCount: entry.evidenciaUrls.length,
        },
      },
    })

    // Create notification for the creator
    if (entry.creadoPorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: entry.creadoPorId,
          type: "INFO",
          title: "Asiento Aprobado",
          message: `El asiento ${entry.numero} ha sido aprobado`,
          link: `/contabilidad?entry=${entry.id}`,
        },
      })
    }

    return NextResponse.json({
      message: "Asiento aprobado exitosamente",
      entry: updatedEntry,
    })
  } catch (error: any) {
    console.error("Error approving entry:", error)
    return NextResponse.json(
      { error: error.message || "Error al aprobar asiento" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/accounting-entries/[id]/reject
 * Reject an accounting entry
 */
export async function DELETE(
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

    // Only certain roles can reject entries
    const allowedRoles: Role[] = [
      Role.Admin,
      Role.ContadorGeneral,
      Role.ResponsableContabilidad,
      Role.DirectoraDAF,
      Role.CoordinadorGobierno,
    ]

    if (!allowedRoles.includes(session.user.role as Role)) {
      return NextResponse.json(
        { error: "No tiene permisos para rechazar asientos contables" },
        { status: 403 }
      )
    }

    const { reason } = await request.json()

    if (!reason) {
      return NextResponse.json(
        { error: "Debe proporcionar una razón para el rechazo" },
        { status: 400 }
      )
    }

    // Get the entry
    const entry = await prisma.accountingEntry.findUnique({
      where: { id: params.id, deletedAt: null },
    })

    if (!entry) {
      return NextResponse.json(
        { error: "Asiento contable no encontrado" },
        { status: 404 }
      )
    }

    // Reject the entry
    const updatedEntry = await prisma.accountingEntry.update({
      where: { id: params.id },
      data: {
        estado: "RECHAZADO",
      },
    })

    // Create observation with rejection reason
    await prisma.accountingObservation.create({
      data: {
        asientoContableId: params.id,
        creadoPorId: session.user.id,
        observacion: `RECHAZADO: ${reason}`,
        tipo: "RECHAZO",
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        usuarioId: session.user.id,
        accion: "REJECT",
        entidad: "AccountingEntry",
        entidadId: params.id,
        descripcion: `Asiento ${entry.numero} rechazado: ${reason}`,
        datosNuevos: {
          entryNumber: entry.numero,
          reason,
        },
      },
    })

    // Create notification for the creator
    await prisma.notification.create({
      data: {
        userId: entry.creadoPorId,
        type: "WARNING",
        title: "Asiento Rechazado",
        message: `El asiento ${entry.numero} ha sido rechazado: ${reason}`,
        link: `/contabilidad?entry=${entry.id}`,
      },
    })

    return NextResponse.json({
      message: "Asiento rechazado exitosamente",
      entry: updatedEntry,
    })
  } catch (error: any) {
    console.error("Error rejecting entry:", error)
    return NextResponse.json(
      { error: error.message || "Error al rechazar asiento" },
      { status: 500 }
    )
  }
}
