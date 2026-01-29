import { z } from "zod"
import { EntryType, Institution } from "@prisma/client"

export const createAccountingEntrySchema = z.object({
  tipo: z.nativeEnum(EntryType, {
    required_error: "El tipo de entrada es requerido",
    invalid_type_error: "Tipo de entrada inválido",
  }),
  fecha: z.coerce.date({
    required_error: "La fecha es requerida",
    invalid_type_error: "Fecha inválida",
  }),
  descripcion: z
    .string({
      required_error: "La descripción es requerida",
    })
    .min(3, "La descripción debe tener al menos 3 caracteres")
    .max(1000, "La descripción no puede exceder 1000 caracteres"),
  monto: z
    .number({
      required_error: "El monto es requerido",
      invalid_type_error: "El monto debe ser un número",
    })
    .positive("El monto debe ser mayor a cero")
    .max(999999999999.99, "El monto excede el límite permitido"),
  institucion: z.nativeEnum(Institution, {
    required_error: "La institución es requerida",
    invalid_type_error: "Institución inválida",
  }),
  cuentaContable: z
    .string({
      required_error: "La cuenta contable es requerida",
    })
    .min(1, "La cuenta contable es requerida")
    .max(50, "La cuenta contable no puede exceder 50 caracteres"),
  centroCosto: z
    .string()
    .max(50, "El centro de costo no puede exceder 50 caracteres")
    .optional(),
  proyecto: z
    .string()
    .max(50, "El proyecto no puede exceder 50 caracteres")
    .optional(),
  documentoRef: z
    .string()
    .max(100, "El documento de referencia no puede exceder 100 caracteres")
    .optional(),
  observaciones: z
    .string()
    .max(2000, "Las observaciones no pueden exceder 2000 caracteres")
    .optional(),
  evidenciaUrls: z.array(z.string()).optional().default([]),
})

export const updateAccountingEntrySchema = createAccountingEntrySchema.partial().extend({
  id: z.string().cuid("ID inválido"),
})

export const getAccountingEntrySchema = z.object({
  id: z.string().cuid("ID inválido"),
})

export const listAccountingEntriesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  tipo: z.nativeEnum(EntryType).optional(),
  institucion: z.nativeEnum(Institution).optional(),
  estado: z.string().optional(),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  search: z.string().max(200).optional(),
})

export type CreateAccountingEntryInput = z.infer<typeof createAccountingEntrySchema>
export type UpdateAccountingEntryInput = z.infer<typeof updateAccountingEntrySchema>
export type ListAccountingEntriesInput = z.infer<typeof listAccountingEntriesSchema>
