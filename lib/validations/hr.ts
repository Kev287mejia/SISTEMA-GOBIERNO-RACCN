import { z } from "zod"
import { HRRecordType } from "@prisma/client"

export const createHRRecordSchema = z.object({
  tipo: z.nativeEnum(HRRecordType, {
    required_error: "El tipo de registro es requerido",
  }),
  fecha: z.coerce.date({
    required_error: "La fecha es requerida",
  }),
  descripcion: z
    .string({
      required_error: "La descripción es requerida",
    })
    .min(3, "La descripción debe tener al menos 3 caracteres")
    .max(2000, "La descripción no puede exceder 2000 caracteres"),
  empleadoNombre: z
    .string({
      required_error: "El nombre del empleado es requerido",
    })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(200, "El nombre no puede exceder 200 caracteres"),
  empleadoCedula: z
    .string({
      required_error: "La cédula del empleado es requerida",
    })
    .min(9, "La cédula debe tener al menos 9 caracteres")
    .max(20, "La cédula no puede exceder 20 caracteres"),
  cargo: z
    .string()
    .max(200, "El cargo no puede exceder 200 caracteres")
    .optional(),
  departamento: z
    .string()
    .max(200, "El departamento no puede exceder 200 caracteres")
    .optional(),
  salario: z
    .number()
    .min(0, "El salario debe ser mayor o igual a cero")
    .max(999999999999.99, "El salario excede el límite permitido")
    .optional(),
  fechaInicio: z.coerce.date().optional(),
  fechaFin: z.coerce.date().optional(),
  estado: z
    .string()
    .default("ACTIVO")
    .refine((val) => ["ACTIVO", "INACTIVO", "PENDIENTE"].includes(val), {
      message: "El estado debe ser ACTIVO, INACTIVO o PENDIENTE",
    }),
  documentos: z.string().max(5000).optional(),
  observaciones: z.string().max(2000).optional(),
})

export const updateHRRecordSchema = createHRRecordSchema.partial().extend({
  id: z.string().cuid("ID inválido"),
})

export const getHRRecordSchema = z.object({
  id: z.string().cuid("ID inválido"),
})

export const listHRRecordsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  tipo: z.nativeEnum(HRRecordType).optional(),
  estado: z.string().optional(),
  departamento: z.string().optional(),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  search: z.string().max(200).optional(),
  empleadoCedula: z.string().optional(),
})

export const getEmployeeByCedulaSchema = z.object({
  cedula: z.string().min(9).max(20),
})

export type CreateHRRecordInput = z.infer<typeof createHRRecordSchema>
export type UpdateHRRecordInput = z.infer<typeof updateHRRecordSchema>
export type ListHRRecordsInput = z.infer<typeof listHRRecordsSchema>
