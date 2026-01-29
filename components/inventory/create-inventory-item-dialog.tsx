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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Package, Hash, Tags, Scale, ClipboardList, Wallet, BarChart4 } from "lucide-react"

interface CreateInventoryItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateInventoryItemDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateInventoryItemDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    codigo: "",
    unidadMedida: "",
    nombre: "",
    descripcion: "",
    categoria: "",
    metodoKardex: "FIFO",
    stockMinimo: "0",
    stockMaximo: "",
    costoUnitario: "0",
  })

  // Predefined Categories
  const categories = [
    "Materiales de Oficina",
    "Limpieza",
    "Tecnología",
    "Mobiliario",
    "Vehículos",
    "Herramientas",
    "Construcción",
    "Alimentos",
    "Combustible",
    "Otros"
  ]

  // SKU Generator Logic
  const generateSKU = async (category: string) => {
    if (!category) return

    try {
      const res = await fetch(`/api/inventory/sku-generator?category=${encodeURIComponent(category)}`)
      if (res.ok) {
        const data = await res.json()
        setFormData(prev => ({ ...prev, codigo: data.code }))
      }
    } catch (error) {
      console.error("Error generating SKU", error)
    }
  }

  // Effect to auto-generate when category changes IF code is empty
  const handleCategoryChange = (val: string) => {
    setFormData(prev => {
      const newState = { ...prev, categoria: val }
      return newState
    })
    // We check the new val directly
    if (val && formData.codigo === "") {
      generateSKU(val)
    }
  }

  // Predefined Units
  const units = [
    { value: "UN", label: "Unidad (Pzas)" },
    { value: "KG", label: "Kilogramos (Kg)" },
    { value: "LB", label: "Libras (Lb)" },
    { value: "L", label: "Litros (L)" },
    { value: "M", label: "Metros (m)" },
    { value: "CAJA", label: "Caja" },
    { value: "PAQ", label: "Paquete" },
    { value: "GAL", label: "Galón" },
    { value: "ROLLO", label: "Rollo" },
    { value: "RESMA", label: "Resma" }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/inventory/items", {
        method: "POST",
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
        setFormData({
          codigo: "",
          unidadMedida: "",
          nombre: "",
          descripcion: "",
          categoria: "",
          metodoKardex: "FIFO",
          stockMinimo: "0",
          stockMaximo: "",
          costoUnitario: "0",
        })
      } else {
        const error = await response.json()
        alert(error.error || "Error al crear el item")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al crear el item")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-50 border-none shadow-2xl">
        <DialogHeader className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-4">
          <DialogTitle className="flex items-center gap-3 text-xl font-black text-slate-800 uppercase tracking-tight">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Package className="h-6 w-6 text-indigo-600" />
            </div>
            Registro de Artículo
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium ml-12">
            Alta de nuevo producto en el catálogo maestro de inventario.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-2">

          {/* Identificación */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Hash className="h-4 w-4" /> Identificación del Producto
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold text-slate-600 uppercase">Código / SKU</Label>
                  <button
                    type="button"
                    onClick={() => generateSKU(formData.categoria)}
                    className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Generar Código
                  </button>
                </div>
                <div className="relative">
                  <Input
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="pl-8 bg-slate-50 border-slate-200 focus:bg-white transition-all font-mono font-bold text-slate-700"
                    placeholder="Autogenerado"
                  />
                  <Hash className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 uppercase">Unidad de Medida</Label>
                <Select
                  value={formData.unidadMedida}
                  onValueChange={(val) => setFormData({ ...formData, unidadMedida: val })}
                >
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Seleccione Unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600 uppercase">Nombre del Artículo</Label>
              <Input
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="bg-slate-50 border-slate-200 focus:bg-white text-lg font-semibold text-slate-800"
                placeholder="Ej: Resma de Papel Bond Tamaño Carta"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600 uppercase">Descripción Técnica</Label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="bg-slate-50 border-slate-200 focus:bg-white resize-none"
                rows={2}
                placeholder="Detalles adicionales, marca, especificaciones..."
              />
            </div>
          </div>

          {/* Clasificación y Valoración */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Tags className="h-4 w-4" /> Clasificación
              </h3>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 uppercase">Categoría</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Seleccione Categoría" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 uppercase">Método de Valuación</Label>
                <Select
                  value={formData.metodoKardex}
                  onValueChange={(val) => setFormData({ ...formData, metodoKardex: val })}
                >
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIFO">PEPS (Primeras Entradas, Primeras Salidas)</SelectItem>
                    <SelectItem value="LIFO">UEPS (Últimas Entradas, Primeras Salidas)</SelectItem>
                    <SelectItem value="Promedio">Costo Promedio Ponderado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Scale className="h-4 w-4" /> Control de Stock
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600 uppercase">Punto de Reorden</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      value={formData.stockMinimo}
                      onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
                      className="pl-8 bg-amber-50 border-amber-200 text-amber-700 font-bold"
                    />
                    <BarChart4 className="h-3.5 w-3.5 text-amber-500 absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-slate-400">Alerta de stock bajo</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600 uppercase">Capacidad Máx.</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stockMaximo}
                    onChange={(e) => setFormData({ ...formData, stockMaximo: e.target.value })}
                    className="bg-slate-50 border-slate-200"
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Costos */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Wallet className="h-32 w-32 text-white" />
            </div>
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                <Wallet className="h-8 w-8 text-indigo-400" />
              </div>
              <div className="flex-1">
                <Label className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Costo Base Inicial (C$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costoUnitario}
                  onChange={(e) => setFormData({ ...formData, costoUnitario: e.target.value })}
                  className="mt-2 bg-transparent border-none text-3xl font-black text-white placeholder-slate-600 focus-visible:ring-0 p-0 h-auto"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="hover:bg-slate-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-lg shadow-indigo-200"
            >
              {loading ? "Procesando..." : "Confirmar Alta de Artículo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
