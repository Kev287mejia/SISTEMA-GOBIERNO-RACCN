"use client"

export const dynamic = "force-dynamic";
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Search,
  Filter,
  Eye,
  ArrowRightLeft,
  Layers,
  ClipboardList,
  History,
  Box,
  FileBarChart,
  Loader2
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { InventoryItemDetailDialog } from "@/components/inventory/inventory-item-detail-dialog"
import { KardexReportDialog } from "@/components/inventory/kardex-report-dialog"
import { CreateInventoryItemDialog } from "@/components/inventory/create-inventory-item-dialog"

type InventoryItem = {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  unidadMedida: string
  categoria: string
  stockActual: number
  stockMinimo: number
  stockMaximo: number
  costoUnitario: number
  metodoKardex: string
  transaccionesCount: number
  createdAt: string
  updatedAt: string
}

import { ModuleHero } from "@/components/layout/module-hero"

export default function InventarioPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [search, setSearch] = useState("")

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/inventory/items")
      if (res.ok) {
        const data = await res.json()
        setItems(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const filteredItems = items.filter(item => 
    item.nombre.toLowerCase().includes(search.toLowerCase()) ||
    item.codigo.toLowerCase().includes(search.toLowerCase())
  )

  const lowStockItems = items.filter(item => item.stockActual <= item.stockMinimo)

  const handleOpenDetail = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsDetailOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#fcfcfc] pb-20">
        <ModuleHero 
          title="CONTROL DE INVENTARIO" 
          subtitle="GESTIÓN INTEGRAL DE KARDEX, SUMINISTROS Y EXISTENCIAS INSTITUCIONALES"
        />

        <div className="max-w-7xl mx-auto px-8 -mt-20 relative z-30 space-y-10">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-slate-100 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
               <Button
                  variant="outline"
                  className="h-12 px-6 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold uppercase tracking-widest text-[10px] gap-2"
                  onClick={() => setIsReportOpen(true)}
                >
                  <FileBarChart className="h-4 w-4 text-indigo-500" /> Informe Kardex
                </Button>
                
                <CreateInventoryItemDialog
                  open={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                  onSuccess={fetchItems}
                />
                
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-indigo-100"
                >
                  <Plus className="h-4 w-4" /> Nuevo Artículo
                </Button>
            </div>

            <div className="relative w-full lg:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Buscar por código o nombre..." 
                    className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/50"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
          </div>

          {lowStockItems.length > 0 && (
            <Card className="border-none bg-amber-50 border-l-4 border-l-amber-500 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 flex-shrink-0">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-amber-900 uppercase">Alerta de Existencias Bajas</h3>
                  <p className="text-xs text-amber-700 font-medium">
                    Se han detectado <span className="font-bold underline">{lowStockItems.length} artículos</span> por debajo del stock mínimo. Requiere reposición.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-2xl font-black uppercase tracking-tight">Catálogo de Suministros</CardTitle>
                        <CardDescription className="text-slate-400 font-medium">Inventario actualizado en tiempo real</CardDescription>
                    </div>
                    <Box className="h-10 w-10 text-slate-700 opacity-50" />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="p-20 text-center">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto text-indigo-500 mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando almacén...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Código</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Artículo</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Stock Actual</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Costo Unit.</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor Total</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{item.codigo}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-slate-900">{item.nombre}</div>
                                            <div className="text-[10px] font-medium text-slate-400 uppercase">{item.categoria}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-lg font-black ${item.stockActual <= item.stockMinimo ? 'text-rose-600' : 'text-slate-900'}`}>
                                                    {item.stockActual}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.unidadMedida}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-mono text-sm">{formatCurrency(item.costoUnitario)}</td>
                                        <td className="px-8 py-6 font-bold text-slate-900">{formatCurrency(item.stockActual * item.costoUnitario)}</td>
                                        <td className="px-8 py-6 text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                                onClick={() => handleOpenDetail(item)}
                                            >
                                                <Eye className="h-4 w-4 mr-2" /> Kardex
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
          </Card>

          <InventoryItemDetailDialog
            item={selectedItem}
            open={isDetailOpen}
            onOpenChange={setIsDetailOpen}
          />
          
          <KardexReportDialog
            open={isReportOpen}
            onOpenChange={setIsReportOpen}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
