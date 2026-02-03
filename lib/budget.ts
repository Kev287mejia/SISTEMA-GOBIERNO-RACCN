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
  centroCosto?: string
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

    const execution = await (tx as any).budgetExecution.create({
      data: {
        budgetItemId: data.budgetItemId,
        monto: data.monto,
        descripcion: data.descripcion,
        referencia: data.referencia,
        mes: data.mes,
        centroCosto: data.centroCosto,
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
        partidaCod: budget.codigo,
        partidaNombre: budget.nombre
      }
    )

    // --- STRICT NOTIFICATION LOGIC (Fiscal Guard) ---
    try {
      await checkBudgetThresholds(budget.id, data.monto, session.user.id)
    } catch (notifError) {
      console.error("Non-blocking notification error:", notifError)
    }

    return execution
  })
}

/**
 * STRICT LOGIC: Checks budget health and notifies relevant stakeholders
 */
async function checkBudgetThresholds(budgetItemId: string, lastAmount: number, userId: string) {
  const { createNotification } = await import("./notifications")
  const { NotificationType, Role } = await import("@prisma/client")

  // Helper for currency formatting
  const formatCurrency = (amt: number) => `C$ ${amt.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const budget = await prisma.budgetItem.findUnique({
    where: { id: budgetItemId }
  })

  if (!budget) return

  const totalAsignado = Number(budget.montoAsignado)
  const totalEjecutado = Number(budget.montoEjecutado)
  const executionPercentage = (totalEjecutado / totalAsignado) * 100

  // 0. ALERT: Direct Confirmation to User
  await createNotification({
    userId,
    type: NotificationType.SUCCESS,
    title: "Ejecución Registrada",
    message: `Se ha procesado el cargo de ${formatCurrency(lastAmount)} a la partida ${budget.codigo}.`,
    link: `/presupuesto?openItem=${budget.id}`
  })

  // 1. ALERT: Unusual High Consumption (Single execution > 30% of total)
  if (lastAmount > totalAsignado * 0.3) {
    await createNotification({
      type: NotificationType.WARNING,
      title: "⚠️ Consumo de Alto Impacto",
      message: `Una sola ejecución ha consumido el ${(lastAmount / totalAsignado * 100).toFixed(1)}% del presupuesto total de la partida ${budget.codigo}.`,
      roles: [Role.Admin, Role.DirectoraDAF, Role.CoordinadorGobierno],
      link: `/presupuesto?openItem=${budget.id}`
    })
  }

  // 2. ALERT: Critical Thresholds
  if (executionPercentage >= 100) {
    await createNotification({
      type: NotificationType.ERROR,
      title: "🚨 PRESUPUESTO AGOTADO",
      message: `La partida ${budget.codigo} (${budget.nombre}) ha alcanzado el 100% de ejecución. No se permiten más cargos sin ampliación.`,
      roles: [Role.Admin, Role.DirectoraDAF, Role.ContadorGeneral],
      link: `/presupuesto`
    })
  } else if (executionPercentage >= 95) {
    await createNotification({
      type: NotificationType.WARNING,
      title: "🛑 Alerta de Disponibilidad Crítica",
      message: `La partida ${budget.codigo} tiene menos del 5% disponible (Ejecutado: ${executionPercentage.toFixed(1)}%).`,
      roles: [Role.Admin, Role.DirectoraDAF, Role.ResponsablePresupuesto],
      link: `/presupuesto?openItem=${budget.id}`
    })
  } else if (executionPercentage >= 80) {
    await createNotification({
      type: NotificationType.INFO,
      title: "📊 Seguimiento Presupuestario",
      message: `La partida ${budget.codigo} ha superado el 80% de ejecución.`,
      roles: [Role.ResponsablePresupuesto, Role.ContadorGeneral]
    })
  }
}
