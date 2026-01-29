import { prisma } from "./prisma"
import { EntryType, EntryStatus, Institution } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { auditCreate, auditUpdate, auditDelete } from "./audit"

// Import Socket.IO functions (using dynamic require for CommonJS compatibility)
function getSocketIO() {
  try {
    // Try to get the Socket.IO instance from the CommonJS module
    const socketModule = require("./socket")
    return {
      emitAccountingEntryEvent: socketModule.emitAccountingEntryEvent,
      AccountingEntryEvent: socketModule.AccountingEntryEvent,
    }
  } catch (error) {
    // Socket.IO not available (e.g., during build)
    return {
      emitAccountingEntryEvent: () => { },
      AccountingEntryEvent: {
        CREATED: "accounting-entry:created",
        UPDATED: "accounting-entry:updated",
        DELETED: "accounting-entry:deleted",
        APPROVED: "accounting-entry:approved",
      },
    }
  }
}

/**
 * Generate next sequential entry number
 */
export async function getNextEntryNumber(institucion: Institution): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = institucion === Institution.GOBIERNO
    ? `AS-GOB-${year}-`
    : `AS-CON-${year}-`

  const lastEntry = await prisma.accountingEntry.findFirst({
    where: {
      numero: {
        startsWith: prefix,
      },
      deletedAt: null,
    },
    orderBy: {
      numero: "desc",
    },
  })

  if (!lastEntry) {
    return `${prefix}0001`
  }

  const lastNumber = parseInt(lastEntry.numero.split("-").pop() || "0")
  const nextNumber = (lastNumber + 1).toString().padStart(4, "0")

  return `${prefix}${nextNumber}`
}

/**
 * Create a new accounting entry
 */
export async function createAccountingEntry(data: {
  tipo: EntryType
  fecha: Date
  descripcion: string
  monto: number
  institucion: Institution
  cuentaContable: string
  centroCosto?: string
  proyecto?: string
  documentoRef?: string
  observaciones?: string
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Usuario no autenticado")
  }

  return await prisma.$transaction(async (tx) => {
    const numero = await getNextEntryNumber(data.institucion)

    const entry = await tx.accountingEntry.create({
      data: {
        ...data,
        numero,
        estado: EntryStatus.BORRADOR,
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
      "AccountingEntry",
      entry.id,
      `Creación de asiento contable ${numero}: ${data.descripcion}`,
      {
        ...entry,
        cuentaCodigo: entry.cuentaContable
      }
    )

    // Emit Socket.IO event
    const socketIO = getSocketIO()
    socketIO.emitAccountingEntryEvent(socketIO.AccountingEntryEvent.CREATED, {
      id: entry.id,
      numero: entry.numero,
      tipo: entry.tipo,
      monto: entry.monto,
      descripcion: entry.descripcion,
      institucion: entry.institucion,
      estado: entry.estado,
      fecha: entry.fecha,
      creadoPor: entry.creadoPor,
    })

    return entry
  })
}

/**
 * Update an accounting entry
 */
export async function updateAccountingEntry(
  id: string,
  data: {
    tipo?: EntryType
    fecha?: Date
    descripcion?: string
    monto?: number
    institucion?: Institution
    cuentaContable?: string
    centroCosto?: string
    proyecto?: string
    documentoRef?: string
    observaciones?: string
  }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Usuario no autenticado")
  }

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.accountingEntry.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new Error("Asiento contable no encontrado")
    }

    if (existing.deletedAt) {
      throw new Error("No se puede actualizar un asiento eliminado")
    }

    if (existing.estado === EntryStatus.APROBADO) {
      throw new Error("No se puede actualizar un asiento aprobado")
    }

    // If institution changed, regenerate number
    let numero = existing.numero
    if (data.institucion && data.institucion !== existing.institucion) {
      numero = await getNextEntryNumber(data.institucion)
    }

    const updated = await tx.accountingEntry.update({
      where: { id },
      data: {
        ...data,
        numero,
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

    await auditUpdate(
      "AccountingEntry",
      id,
      `Actualización de asiento contable ${numero}`,
      existing,
      updated
    )

    // Emit Socket.IO event
    const socketIO = getSocketIO()
    socketIO.emitAccountingEntryEvent(socketIO.AccountingEntryEvent.UPDATED, {
      id: updated.id,
      numero: updated.numero,
      tipo: updated.tipo,
      monto: updated.monto,
      descripcion: updated.descripcion,
      institucion: updated.institucion,
      estado: updated.estado,
      fecha: updated.fecha,
      creadoPor: updated.creadoPor,
      aprobadoPor: updated.aprobadoPor,
    })

    return updated
  })
}

/**
 * Soft delete an accounting entry
 */
export async function deleteAccountingEntry(id: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Usuario no autenticado")
  }

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.accountingEntry.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new Error("Asiento contable no encontrado")
    }

    if (existing.deletedAt) {
      throw new Error("El asiento ya ha sido eliminado")
    }

    if (existing.estado === EntryStatus.APROBADO) {
      throw new Error("No se puede eliminar un asiento aprobado. Use anular en su lugar.")
    }

    const deleted = await tx.accountingEntry.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })

    await auditDelete(
      "AccountingEntry",
      id,
      `Eliminación de asiento contable ${existing.numero}`,
      existing
    )

    // Emit Socket.IO event
    const socketIO = getSocketIO()
    socketIO.emitAccountingEntryEvent(socketIO.AccountingEntryEvent.DELETED, {
      id: existing.id,
      numero: existing.numero,
      tipo: existing.tipo,
      monto: existing.monto,
      descripcion: existing.descripcion,
      institucion: existing.institucion,
    })

    return deleted
  })
}

/**
 * Approve an accounting entry
 */
export async function approveAccountingEntry(entryId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Usuario no autenticado")
  }

  return await prisma.$transaction(async (tx) => {
    const entry = await tx.accountingEntry.findUnique({
      where: { id: entryId },
    })

    if (!entry) {
      throw new Error("Asiento contable no encontrado")
    }

    if (entry.deletedAt) {
      throw new Error("No se puede aprobar un asiento eliminado")
    }

    if (entry.estado === EntryStatus.APROBADO) {
      throw new Error("El asiento ya está aprobado")
    }

    const approved = await tx.accountingEntry.update({
      where: { id: entryId },
      data: {
        estado: EntryStatus.APROBADO,
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

    await auditCreate(
      "AccountingEntry",
      approved.id,
      `Aprobación de asiento contable ${approved.numero}`,
      approved
    )

    // Emit Socket.IO event
    const socketIO = getSocketIO()
    socketIO.emitAccountingEntryEvent(socketIO.AccountingEntryEvent.APPROVED, {
      id: approved.id,
      numero: approved.numero,
      tipo: approved.tipo,
      monto: approved.monto,
      descripcion: approved.descripcion,
      institucion: approved.institucion,
      estado: approved.estado,
      fecha: approved.fecha,
      creadoPor: approved.creadoPor,
      aprobadoPor: approved.aprobadoPor,
    })

    return approved
  })
}
