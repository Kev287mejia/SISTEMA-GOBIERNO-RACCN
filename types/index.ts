// Tipos globales para el sistema contable
import {
  User,
  AccountingEntry,
  BudgetItem,
  InventoryItem,
  InventoryTransaction,
  HRRecord,
  AuditLog,
  EntryType,
  EntryStatus,
  BudgetStatus,
  InventoryTransactionType,
  HRRecordType,
  AuditAction,
  Role,
  Institution,
} from "@prisma/client"

// Re-export Prisma types
export type {
  User,
  AccountingEntry,
  BudgetItem,
  InventoryItem,
  InventoryTransaction,
  HRRecord,
  AuditLog,
  EntryType,
  EntryStatus,
  BudgetStatus,
  InventoryTransactionType,
  HRRecordType,
  AuditAction,
  Role,
  Institution,
}

// Extended types with relations
export type UserWithRelations = User & {
  createdEntries?: AccountingEntry[]
  approvedEntries?: AccountingEntry[]
  createdBudgets?: BudgetItem[]
  approvedBudgets?: BudgetItem[]
  inventoryRecords?: InventoryTransaction[]
  hrRecords?: HRRecord[]
  auditLogs?: AuditLog[]
}

export type AccountingEntryWithRelations = AccountingEntry & {
  creadoPor?: User
  aprobadoPor?: User | null
}

export type BudgetItemWithRelations = BudgetItem & {
  creadoPor?: User
  aprobadoPor?: User | null
}

export type InventoryItemWithRelations = InventoryItem & {
  transacciones?: InventoryTransaction[]
}

export type InventoryTransactionWithRelations = InventoryTransaction & {
  item?: InventoryItem
  usuario?: User
}

export type HRRecordWithRelations = HRRecord & {
  creadoPor?: User
}

export type AuditLogWithRelations = AuditLog & {
  usuario?: User
}

// DTOs for creating/updating records
export interface CreateAccountingEntryDTO {
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
}

export interface CreateBudgetItemDTO {
  codigo: string
  nombre: string
  descripcion?: string
  categoria: string
  año: number
  montoAsignado: number
  fechaInicio?: Date
  fechaFin?: Date
}

export interface CreateInventoryItemDTO {
  codigo: string
  nombre: string
  descripcion?: string
  unidadMedida: string
  categoria: string
  stockMinimo?: number
  stockMaximo?: number
  costoUnitario?: number
  metodoKardex?: string
}

export interface CreateInventoryTransactionDTO {
  tipo: InventoryTransactionType
  cantidad: number
  costoUnitario: number
  fecha?: Date
  numeroDocumento?: string
  observaciones?: string
}

export interface CreateHRRecordDTO {
  tipo: HRRecordType
  fecha: Date
  descripcion: string
  empleadoNombre: string
  empleadoCedula: string
  cargo?: string
  departamento?: string
  salario?: number
  fechaInicio?: Date
  fechaFin?: Date
  documentos?: string
  observaciones?: string
}

// Legacy types for backward compatibility
export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: string
}

export interface Transaccion {
  id: string
  fecha: Date
  descripcion: string
  monto: number
  tipo: "ingreso" | "egreso"
}

export interface Factura {
  id: string
  numero: string
  fecha: Date
  monto: number
  estado: "pendiente" | "pagada" | "cancelada"
}

export interface Presupuesto {
  id: string
  año: number
  montoAsignado: number
  montoGastado: number
  categoria: string
}
