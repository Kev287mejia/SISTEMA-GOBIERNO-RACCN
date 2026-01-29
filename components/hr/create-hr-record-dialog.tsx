"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Users } from "lucide-react"
import { HRRecordType } from "@prisma/client"

interface CreateHRRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateHRRecordDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateHRRecordDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tipo: HRRecordType.CONTRATACION as HRRecordType,
    fecha: new Date().toISOString().split("T")[0],
    descripcion: "",
    empleadoNombre: "",
    empleadoCedula: "",
    cargo: "",
    departamento: "",
    salario: "",
    fechaInicio: "",
    fechaFin: "",
    estado: "ACTIVO",
    observaciones: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/hr/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          salario: formData.salario ? parseFloat(formData.salario) : undefined,
          fechaInicio: formData.fechaInicio
            ? new Date(formData.fechaInicio)
            : undefined,
          fechaFin: formData.fechaFin ? new Date(formData.fechaFin) : undefined,
        }),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
        setFormData({
          tipo: HRRecordType.CONTRATACION,
          fecha: new Date().toISOString().split("T")[0],
          descripcion: "",
          empleadoNombre: "",
          empleadoCedula: "",
          cargo: "",
          departamento: "",
          salario: "",
          fechaInicio: "",
          fechaFin: "",
          estado: "ACTIVO",
          observaciones: "",
        })
      } else {
        const error = await response.json()
        alert(error.error || "Error al crear el registro")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al crear el registro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Nuevo Registro de RRHH
          </DialogTitle>
          <DialogDescription>
            Complete los datos para crear un nuevo registro de recursos humanos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Tipo de Registro *</label>
              <select
                required
                value={formData.tipo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tipo: e.target.value as HRRecordType,
                  })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value={HRRecordType.CONTRATACION}>Contratación</option>
                <option value={HRRecordType.ASCENSO}>Ascenso</option>
                <option value={HRRecordType.TRASLADO}>Traslado</option>
                <option value={HRRecordType.DESPIDO}>Despido</option>
                <option value={HRRecordType.RENUNCIA}>Renuncia</option>
                <option value={HRRecordType.VACACIONES}>Vacaciones</option>
                <option value={HRRecordType.LICENCIA}>Licencia</option>
                <option value={HRRecordType.EVALUACION}>Evaluación</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Fecha *</label>
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nombre del Empleado *</label>
              <input
                type="text"
                required
                value={formData.empleadoNombre}
                onChange={(e) =>
                  setFormData({ ...formData, empleadoNombre: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Nombre completo"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Cédula *</label>
              <input
                type="text"
                required
                value={formData.empleadoCedula}
                onChange={(e) =>
                  setFormData({ ...formData, empleadoCedula: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="1-1234-5678"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Cargo (Posición)</label>
              <input
                type="text"
                value={formData.cargo}
                onChange={(e) =>
                  setFormData({ ...formData, cargo: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Ej: Contador, Administrador"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Departamento</label>
              <input
                type="text"
                value={formData.departamento}
                onChange={(e) =>
                  setFormData({ ...formData, departamento: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Ej: Contabilidad, Administración"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Salario</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.salario}
                onChange={(e) =>
                  setFormData({ ...formData, salario: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Fecha de Inicio</label>
              <input
                type="date"
                value={formData.fechaInicio}
                onChange={(e) =>
                  setFormData({ ...formData, fechaInicio: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Fecha de Fin</label>
              <input
                type="date"
                value={formData.fechaFin}
                onChange={(e) =>
                  setFormData({ ...formData, fechaFin: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tipo de Contrato</label>
            <select
              value={formData.estado}
              onChange={(e) =>
                setFormData({ ...formData, estado: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="PENDIENTE">Pendiente</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Descripción *</label>
            <textarea
              required
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 border rounded-md"
              rows={3}
              placeholder="Descripción del registro..."
            />
          </div>

          <div>
            <label className="text-sm font-medium">Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={(e) =>
                setFormData({ ...formData, observaciones: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 border rounded-md"
              rows={2}
              placeholder="Observaciones adicionales..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Registro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
