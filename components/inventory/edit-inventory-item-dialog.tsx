"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Package } from "lucide-react"

interface InventoryItem {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  unidadMedida: string
  categoria: string
  stockMinimo: number
  stockMaximo?: number | null
  costoUnitario: number
  metodoKardex: string
}

interface EditInventoryItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem
  onSuccess: () => void
}

export function EditInventoryItemDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: EditInventoryItemDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    unidadMedida: "",
    categoria: "",
    stockMinimo: "0",
    stockMaximo: "",
    costoUnitario: "0",
    metodoKardex: "FIFO",
  })

  useEffect(() => {
    if (item && open) {
      setFormData({
        codigo: item.codigo,
        nombre: item.nombre,
        descripcion: item.descripcion || "",
        unidadMedida: item.unidadMedida,
        categoria: item.categoria,
        stockMinimo: item.stockMinimo.toString(),
        stockMaximo: item.stockMaximo?.toString() || "",
        costoUnitario: item.costoUnitario.toString(),
        metodoKardex: item.metodoKardex,
      })
    }
  }, [item, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/inventory/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          stockMinimo: parseFloat(formData.stockMinimo) || 0,
          stockMaximo: formData.stockMaximo
            ? parseFloat(formData.stockMaximo)
            : undefined,
          costoUnitario: parseFloat(formData.costoUnitario) || 0,
        }),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
      } else {
        const error = await response.json()
        alert(error.error || "Error al actualizar el item")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al actualizar el item")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Editar Item de Inventario
          </DialogTitle>
          <DialogDescription>
            Modifique los datos del item de inventario
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Código *</label>
              <input
                type="text"
                required
                value={formData.codigo}
                onChange={(e) =>
                  setFormData({ ...formData, codigo: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Unidad de Medida *</label>
              <input
                type="text"
                required
                value={formData.unidadMedida}
                onChange={(e) =>
                  setFormData({ ...formData, unidadMedida: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Nombre *</label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 border rounded-md"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Categoría *</label>
            <input
              type="text"
              required
              value={formData.categoria}
              onChange={(e) =>
                setFormData({ ...formData, categoria: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Stock Mínimo *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.stockMinimo}
                onChange={(e) =>
                  setFormData({ ...formData, stockMinimo: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Stock Máximo</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.stockMaximo}
                onChange={(e) =>
                  setFormData({ ...formData, stockMaximo: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Costo Unitario</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.costoUnitario}
                onChange={(e) =>
                  setFormData({ ...formData, costoUnitario: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Método Kardex</label>
            <select
              value={formData.metodoKardex}
              onChange={(e) =>
                setFormData({ ...formData, metodoKardex: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              <option value="FIFO">FIFO</option>
              <option value="LIFO">LIFO</option>
              <option value="Promedio">Promedio</option>
            </select>
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
              {loading ? "Actualizando..." : "Actualizar Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
