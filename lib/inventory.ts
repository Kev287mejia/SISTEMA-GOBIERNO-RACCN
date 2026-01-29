import { prisma } from "./prisma"
import { InventoryTransactionType } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { auditCreate } from "./audit"

/**
 * Create inventory transaction and update stock
 */
export async function createInventoryTransaction(data: {
  itemId: string
  tipo: InventoryTransactionType
  cantidad: number
  costoUnitario: number
  fecha?: Date
  numeroDocumento?: string
  observaciones?: string
  accountingEntryId?: string
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Usuario no autenticado")
  }

  const item = await prisma.inventoryItem.findUnique({
    where: { id: data.itemId },
  })

  if (!item) {
    throw new Error("Item de inventario no encontrado")
  }

  const costoTotal = data.cantidad * data.costoUnitario
  let nuevoStock = Number(item.stockActual)
  let nuevoCostoUnitario = Number(item.costoUnitario)

  // Update stock based on transaction type
  if (data.tipo === InventoryTransactionType.ENTRADA) {
    nuevoStock += data.cantidad
    // Update average cost (weighted average)
    const totalCosto = Number(item.costoUnitario) * Number(item.stockActual) + costoTotal
    nuevoCostoUnitario = totalCosto / nuevoStock
  } else if (data.tipo === InventoryTransactionType.SALIDA) {
    if (nuevoStock < data.cantidad) {
      throw new Error("Stock insuficiente")
    }
    nuevoStock -= data.cantidad
  } else if (data.tipo === InventoryTransactionType.AJUSTE) {
    nuevoStock = data.cantidad
  }

  // Verify accounting entry if provided
  if (data.accountingEntryId) {
    const accountingEntry = await prisma.accountingEntry.findUnique({
      where: { id: data.accountingEntryId },
    })

    if (!accountingEntry || accountingEntry.deletedAt) {
      throw new Error("Asiento contable no encontrado")
    }
  }

  // Create transaction
  const transaction = await prisma.inventoryTransaction.create({
    data: {
      ...data,
      costoTotal,
      usuarioId: session.user.id,
    },
    include: {
      item: {
        select: {
          nombre: true,
          codigo: true,
        },
      },
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
  })

  // Update item stock
  await prisma.inventoryItem.update({
    where: { id: data.itemId },
    data: {
      stockActual: nuevoStock,
      costoUnitario: nuevoCostoUnitario,
    },
  })

  await auditCreate(
    "InventoryTransaction",
    transaction.id,
    `Transacción de inventario: ${data.tipo} de ${data.cantidad} unidades`,
    transaction
  )

  return transaction
}
