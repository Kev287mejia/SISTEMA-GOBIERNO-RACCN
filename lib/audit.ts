import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AuditAction } from "@prisma/client"

// Helper function to create audit log
export async function createAuditLog({
  usuarioId,
  accion,
  entidad,
  entidadId,
  detalles,
  descripcion,
  datosNuevos,
  ipAddress
}: {
  usuarioId?: string
  accion: string
  entidad: string
  entidadId?: string
  detalles?: any
  descripcion?: string
  datosNuevos?: any
  ipAddress?: string
}) {
  try {
    let finalUserId = usuarioId
    if (!finalUserId) {
      const session = await getServerSession(authOptions)
      finalUserId = session?.user?.id
    }

    if (!finalUserId) return // Cannot audit without user

    const finalDescripcion = descripcion || (typeof detalles === 'string' ? detalles : (detalles?.descripcion || `Acción: ${accion} sobre ${entidad}`))
    const finalDatosNuevos = datosNuevos || (detalles ? (typeof detalles === 'string' ? { info: detalles } : detalles) : undefined)

    await prisma.auditLog.create({
      data: {
        usuarioId: finalUserId,
        accion: accion as any,
        entidad,
        entidadId: entidadId || "N/A",
        descripcion: finalDescripcion,
        datosNuevos: finalDatosNuevos,
        ipAddress: ipAddress || '0.0.0.0',
        fecha: new Date()
      }
    })
  } catch (error) {
    console.error("[AUDIT_LOG_CREATE] Error:", error)
  }
}

// Adapters for legacy/other module calls
export async function auditCreate(entidad: string, entidadId: string, descripcion: string, datosNuevos: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return

  await prisma.auditLog.create({
    data: {
      usuarioId: session.user.id,
      accion: AuditAction.CREATE,
      entidad,
      entidadId,
      descripcion,
      datosNuevos,
      fecha: new Date()
    }
  })
}

export async function auditUpdate(entidad: string, entidadId: string, descripcion: string, datosAnteriores: any, datosNuevos: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return

  await prisma.auditLog.create({
    data: {
      usuarioId: session.user.id,
      accion: AuditAction.UPDATE,
      entidad,
      entidadId,
      descripcion,
      datosAnteriores,
      datosNuevos,
      fecha: new Date()
    }
  })
}

export async function auditDelete(entidad: string, entidadId: string, descripcion: string, datosAnteriores: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return

  await prisma.auditLog.create({
    data: {
      usuarioId: session.user.id,
      accion: AuditAction.DELETE,
      entidad,
      entidadId,
      descripcion,
      datosAnteriores,
      fecha: new Date()
    }
  })
}
