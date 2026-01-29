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
import { InventoryTransactionType } from "@prisma/client"
import {
  ArrowRightLeft,
  ClipboardList,
  Calendar,
  FileText,
  CreditCard,
  User,
  Building2,
  AlertTriangle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/utils"

interface InventoryItem {
  id: string
  codigo: string
  nombre: string
  unidadMedida: string
  stockActual: number
  costoUnitario: number
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
  const [formData, setFormData] = useState({
    tipo: "ENTRADA" as InventoryTransactionType,
    cantidad: "",
    costoUnitario: "",
    fecha: new Date().toISOString().split("T")[0],
    numeroDocumento: "",
    observaciones: "",
    solicitante: "", // New field for Requestor
    departamento: "" // New field for Department
  })

  // Reset form when item changes or dialog opens
  useEffect(() => {
    if (open && item) {
      setFormData({
        tipo: "ENTRADA",
        cantidad: "",
        costoUnitario: item.costoUnitario.toString(),
        fecha: new Date().toISOString().split("T")[0],
        numeroDocumento: "",
        observaciones: "",
        solicitante: "",
        departamento: ""
      })
    }
  }, [open, item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/inventory/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          tipo: formData.tipo,
          cantidad: parseFloat(formData.cantidad),
          costoUnitario: parseFloat(formData.costoUnitario),
          fecha: new Date(formData.fecha),
          documentoRef: formData.numeroDocumento, // Mapped to API expected field
          observaciones: formData.observaciones + (formData.solicitante ? ` | Solicitado por: ${formData.solicitante}` : "") + (formData.departamento ? ` | Ubicación: ${formData.departamento}` : "")
        }),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
      } else {
        const error = await response.json()
        alert(error.error || "Error al crear la transacción")
      }
    } catch (error) {
      console.error("Error transaccion", error)
      alert("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const isSalida = formData.tipo === "SALIDA"

  // Dynamic color for transaction type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ENTRADA': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SALIDA': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'AJUSTE': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white p-0 border-none shadow-2xl gap-0 rounded-2xl">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <ArrowRightLeft className="h-6 w-6 text-indigo-300" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Kardex de Inventario</DialogTitle>
              <DialogDescription className="text-slate-400 font-medium text-xs">Registro de movimientos de entrada y salida</DialogDescription>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-2xl font-black text-white">{item.codigo}</p>
            <p className="text-xs text-slate-400 uppercase font-bold">{item.unidadMedida}</p>
          </div>
        </div>

        {/* Product Summary */}
        <div className="bg-slate-50 border-b border-l-4 border-l-indigo-500 border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Artículo Seleccionado</p>
            <p className="text-lg font-bold text-slate-800">{item.nombre}</p>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Existencia Actual</p>
              <p className="text-xl font-black text-slate-800 text-right">{item.stockActual} <span className="text-xs text-slate-500 font-bold">{item.unidadMedida}</span></p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Costo Promedio</p>
              <p className="text-xl font-black text-slate-800 text-right">{formatCurrency(item.costoUnitario)}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna Izquierda: Datos Principales */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList className="h-4 w-4 text-indigo-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Detalle del Movimiento</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(val) => setFormData({ ...formData, tipo: val as any })}
                  >
                    <SelectTrigger className={`border-2 font-bold ${getTypeColor(formData.tipo)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENTRADA">ENTRADA (Compra/Alta)</SelectItem>
                      <SelectItem value="SALIDA">SALIDA (Consumo/Baja)</SelectItem>
                      <SelectItem value="AJUSTE">AJUSTE (Corrección)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Fecha de Registro</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      required
                      className="pl-9 bg-slate-50 border-slate-200"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    />
                    <Calendar className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-indigo-900 uppercase tracking-wide">Cantidad a {isSalida ? 'Despachar' : 'Ingresar'}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    className="text-3xl font-black h-16 border-indigo-200 text-indigo-700 bg-white shadow-sm"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                  />
                  {isSalida && Number(formData.cantidad) > item.stockActual && (
                    <p className="text-xs text-red-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Excede el stock disponible
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-indigo-700 uppercase">Costo Unitario (C$)</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      required
                      className="pl-9 bg-white border-indigo-200 font-bold"
                      value={formData.costoUnitario}
                      onChange={(e) => setFormData({ ...formData, costoUnitario: e.target.value })}
                    />
                    <CreditCard className="h-4 w-4 text-indigo-400 absolute left-3 top-2.5" />
                  </div>
                  {isSalida && (
                    <p className="text-[10px] text-slate-400">
                      * Para salidas se recomienda mantener el costo promedio actual ({formatCurrency(item.costoUnitario)})
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Columna Derecha: Referencias y Contexto */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Soporte y Trazabilidad</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Documento de Referencia</Label>
                  <Input
                    placeholder="Ej: Factura #1234, Requisición #001"
                    className="bg-slate-50 border-slate-200"
                    value={formData.numeroDocumento}
                    onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                  />
                </div>

                {isSalida && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase">Solicitante</Label>
                      <div className="relative">
                        <Input
                          placeholder="Nombre de quien recibe"
                          className="pl-9 bg-slate-50 border-slate-200"
                          value={formData.solicitante}
                          onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                        />
                        <User className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase">Departamento / Destino</Label>
                      <div className="relative">
                        <Input
                          placeholder="Ej: Administración"
                          className="pl-9 bg-slate-50 border-slate-200"
                          value={formData.departamento}
                          onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                        />
                        <Building2 className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Observaciones</Label>
                  <Textarea
                    rows={4}
                    placeholder="Detalles adicionales, estado del producto, motivo del ajuste..."
                    className="bg-slate-50 border-slate-200 resize-none"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-slate-100 items-center">
            <p className="text-xs text-slate-400 italic mr-auto">
              * Esta acción actualizará el stock inmediatamente y no se puede deshacer.
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="hover:bg-slate-100 font-bold text-slate-600"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={`px-8 font-black uppercase tracking-widest shadow-lg ${isSalida ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
            >
              {loading ? "Procesando..." : `Confirmar ${formData.tipo}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
