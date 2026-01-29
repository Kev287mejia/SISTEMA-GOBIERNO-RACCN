import { prisma } from "./prisma"
import { BudgetStatus, RegionalCenter, BudgetType } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { auditCreate } from "./audit"

/**
 * Create a new budget item
 */
export async function createBudgetItem(data: {
  codigo: string
  nombre: string
  descripcion?: string
  categoria: string
  anio: number
  montoAsignado: number
  tipoGasto: BudgetType
  centroRegional: RegionalCenter
  fechaInicio?: Date
  fechaFin?: Date
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Usuario no autenticado")
  }

  const budget = await prisma.budgetItem.create({
    data: {
      ...data,
      montoEjecutado: 0,
      montoDisponible: data.montoAsignado,
      estado: BudgetStatus.PLANIFICADO,
      creadoPorId: session.user.id,
    },
  })

  await auditCreate(
    "BudgetItem",
    budget.id,
    `Creación de partida presupuestaria ${budget.codigo}: ${budget.nombre}`,
    budget
  )

  return budget
}

/**
 * Record a budget execution entry
 */
export async function recordBudgetExecution(data: {
  budgetItemId: string
  monto: number
  descripcion: string
  referencia?: string
  mes: number
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Usuario no autenticado")

  return await prisma.$transaction(async (tx) => {
    const budget = await tx.budgetItem.findUnique({
      where: { id: data.budgetItemId }
    })

    if (!budget) throw new Error("Partida no encontrada")

    const newEjecutado = Number(budget.montoEjecutado) + data.monto
    const newDisponible = Number(budget.montoAsignado) - newEjecutado

    if (newDisponible < 0) {
      throw new Error("Saldo insuficiente: La ejecución excede el presupuesto disponible.")
    }

    const execution = await tx.budgetExecution.create({
      data: {
        budgetItemId: data.budgetItemId,
        monto: data.monto,
        descripcion: data.descripcion,
        referencia: data.referencia,
        mes: data.mes,
        usuarioId: session.user.id
      }
    })

    await tx.budgetItem.update({
      where: { id: data.budgetItemId },
      data: {
        montoEjecutado: newEjecutado,
        montoDisponible: newDisponible,
        estado: 'EN_EJECUCION'
      }
    })

    await auditCreate(
      "BudgetExecution",
      execution.id,
      `Ejecución presupuestaria registrada: ${data.monto} en partida ${budget.codigo}`,
      {
        ...execution,
        partidaCod: budget.codigo, // Dato legible para el auditor
        partidaNombre: budget.nombre
      }
    )

    return execution
  })
}
