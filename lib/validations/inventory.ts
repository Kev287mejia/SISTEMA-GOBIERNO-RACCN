import { z } from "zod"
import { InventoryTransactionType } from "@prisma/client"

export const createInventoryItemSchema = z.object({
  codigo: z
    .string({
      required_error: "El código es requerido",
    })
    .min(1, "El código es requerido")
    .max(50, "El código no puede exceder 50 caracteres"),
  nombre: z
    .string({
      required_error: "El nombre es requerido",
    })
    .min(1, "El nombre es requerido")
    .max(200, "El nombre no puede exceder 200 caracteres"),
  descripcion: z
    .string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .optional(),
  unidadMedida: z
    .string({
      required_error: "La unidad de medida es requerida",
    })
    .min(1, "La unidad de medida es requerida")
    .max(20, "La unidad de medida no puede exceder 20 caracteres"),
  categoria: z
    .string({
      required_error: "La categoría es requerida",
    })
    .min(1, "La categoría es requerida")
    .max(100, "La categoría no puede exceder 100 caracteres"),
  stockMinimo: z
    .number({
      required_error: "El stock mínimo es requerido",
    })
    .min(0, "El stock mínimo debe ser mayor o igual a cero")
    .default(0),
  stockMaximo: z
    .number()
    .min(0, "El stock máximo debe ser mayor o igual a cero")
    .optional(),
  costoUnitario: z
    .number()
    .min(0, "El costo unitario debe ser mayor o igual a cero")
    .default(0),
  metodoKardex: z
    .string()
    .default("FIFO")
    .refine((val) => ["FIFO", "LIFO", "PROMEDIO"].includes(val), {
      message: "El método Kardex debe ser FIFO, LIFO o PROMEDIO",
    }),
})

export const updateInventoryItemSchema = createInventoryItemSchema.partial().extend({
  id: z.string().cuid("ID inválido"),
})

export const createInventoryTransactionSchema = z.object({
  itemId: z.string().cuid("ID de item inválido"),
  tipo: z.nativeEnum(InventoryTransactionType, {
    required_error: "El tipo de transacción es requerido",
  }),
  cantidad: z
    .number({
      required_error: "La cantidad es requerida",
    })
    .positive("La cantidad debe ser mayor a cero"),
  costoUnitario: z
    .number({
      required_error: "El costo unitario es requerido",
    })
    .min(0, "El costo unitario debe ser mayor o igual a cero"),
  fecha: z.coerce.date().optional(),
  numeroDocumento: z
    .string()
    .max(100, "El número de documento no puede exceder 100 caracteres")
    .optional(),
  observaciones: z
    .string()
    .max(2000, "Las observaciones no pueden exceder 2000 caracteres")
    .optional(),
  accountingEntryId: z.string().cuid("ID de asiento contable inválido").optional(),
})

export const getInventoryItemSchema = z.object({
  id: z.string().cuid("ID inválido"),
})

export const listInventoryItemsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  categoria: z.string().optional(),
  search: z.string().max(200).optional(),
  activo: z.coerce.boolean().optional(),
})

export const listInventoryTransactionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  itemId: z.string().cuid().optional(),
  tipo: z.nativeEnum(InventoryTransactionType).optional(),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
})

export type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>
export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>
export type CreateInventoryTransactionInput = z.infer<
  typeof createInventoryTransactionSchema
>
export type ListInventoryItemsInput = z.infer<typeof listInventoryItemsSchema>
export type ListInventoryTransactionsInput = z.infer<
  typeof listInventoryTransactionsSchema
>
