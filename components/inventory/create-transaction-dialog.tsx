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
import { ArrowRightLeft, Link as LinkIcon } from "lucide-react"
import { InventoryTransactionType } from "@prisma/client"

interface InventoryItem {
  id: string
  codigo: string
  nombre: string
  unidadMedida: string
  stockActual: number
}

interface CreateTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem
  onSuccess: () => void
}

export function CreateTransactionDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: CreateTransactionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [accountingEntries, setAccountingEntries] = useState<any[]>([])
  const [formData, setFormData] = useState({
    tipo: InventoryTransactionType.ENTRADA as InventoryTransactionType,
    cantidad: "",
    costoUnitario: "",
    fecha: new Date().toISOString().split("T")[0],
    numeroDocumento: "",
    observaciones: "",
    accountingEntryId: "",
  })

  useEffect(() => {
    if (open) {
      // Fetch recent accounting entries for linking
      fetch("/api/accounting-entries?limit=20&estado=APROBADO")
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            setAccountingEntries(data.data)
          }
        })
        .catch(console.error)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/inventory/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          ...formData,
          cantidad: parseFloat(formData.cantidad),
          costoUnitario: parseFloat(formData.costoUnitario),
          fecha: formData.fecha ? new Date(formData.fecha) : undefined,
          accountingEntryId: formData.accountingEntryId || undefined,
        }),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
        setFormData({
          tipo: InventoryTransactionType.ENTRADA,
          cantidad: "",
          costoUnitario: "",
          fecha: new Date().toISOString().split("T")[0],
          numeroDocumento: "",
          observaciones: "",
          accountingEntryId: "",
        })
      } else {
        const error = await response.json()
        alert(error.error || "Error al crear la transacción")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al crear la transacción")
    } finally {
      setLoading(false)
    }
  }

  const isSalida = formData.tipo === InventoryTransactionType.SALIDA
  const maxCantidad = item.stockActual

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Nueva Transacción de Inventario
          </DialogTitle>
          <DialogDescription>
            {item.nombre} ({item.codigo}) - Stock actual: {item.stockActual}{" "}
            {item.unidadMedida}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Tipo de Transacción *</label>
              <select
                required
                value={formData.tipo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tipo: e.target.value as InventoryTransactionType,
                  })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value={InventoryTransactionType.ENTRADA}>Entrada</option>
                <option value={InventoryTransactionType.SALIDA}>Salida</option>
                <option value={InventoryTransactionType.AJUSTE}>Ajuste</option>
                <option value={InventoryTransactionType.DEVOLUCION}>
                  Devolución
                </option>
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
              <label className="text-sm font-medium">
                Cantidad ({item.unidadMedida}) *
              </label>
              <input
                type="number"
                required
                min={isSalida ? 0.01 : 0}
                max={isSalida ? maxCantidad : undefined}
                step="0.01"
                value={formData.cantidad}
                onChange={(e) =>
                  setFormData({ ...formData, cantidad: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="0.00"
              />
              {isSalida && (
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo disponible: {maxCantidad} {item.unidadMedida}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Costo Unitario *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.costoUnitario}
                onChange={(e) =>
                  setFormData({ ...formData, costoUnitario: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Número de Documento</label>
            <input
              type="text"
              value={formData.numeroDocumento}
              onChange={(e) =>
                setFormData({ ...formData, numeroDocumento: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 border rounded-md"
              placeholder="FAC-2024-001"
            />
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Vincular con Asiento Contable (Opcional)
            </label>
            <select
              value={formData.accountingEntryId}
              onChange={(e) =>
                setFormData({ ...formData, accountingEntryId: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              <option value="">Sin vincular</option>
              {accountingEntries.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.numero} - {entry.descripcion.substring(0, 50)} -{" "}
                  {entry.tipo}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Vincule esta transacción con un asiento contable aprobado
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={(e) =>
                setFormData({ ...formData, observaciones: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 border rounded-md"
              rows={3}
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
              {loading ? "Creando..." : "Crear Transacción"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
