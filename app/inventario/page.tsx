
"use client"

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
  FileBarChart
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { InventoryItemDetailDialog } from "@/components/inventory/inventory-item-detail-dialog"
import { KardexReportDialog } from "@/components/inventory/kardex-report-dialog"

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
  creadoPor?: {
    nombre: string
    apellido: string
    email: string
  }
}

export default function InventarioPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [newItem, setNewItem] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    unidadMedida: "",
    categoria: "SUMINISTROS",
    stockMinimo: "",
    stockMaximo: "",
    costoUnitario: "",
    metodoKardex: "PROMEDIO"
  })

  const [newTransaction, setNewTransaction] = useState({
    tipo: "ENTRADA",
    cantidad: "",
    costoUnitario: "",
    documentoRef: "",
    observaciones: ""
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/inventory/items")
      if (res.ok) {
        const data = await res.json()
        setItems(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/inventory/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newItem,
          stockMinimo: Number(newItem.stockMinimo),
          stockMaximo: Number(newItem.stockMaximo),
          costoUnitario: Number(newItem.costoUnitario)
        }),
      })

      if (res.ok) {
        setIsDialogOpen(false)
        setNewItem({ codigo: "", nombre: "", descripcion: "", unidadMedida: "", categoria: "SUMINISTROS", stockMinimo: "", stockMaximo: "", costoUnitario: "", metodoKardex: "PROMEDIO" })
        fetchItems()
      } else {
        const errorData = await res.json()
        alert(`Error: ${errorData.error || "No se pudo registrar el artículo"}`)
      }
    } catch (error) {
      console.error("Error creating item:", error)
      alert("Error de conexión al intentar registrar el artículo.")
    }
  }

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    try {
      const res = await fetch("/api/inventory/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: selectedItem.id,
          ...newTransaction,
          cantidad: Number(newTransaction.cantidad),
          costoUnitario: Number(newTransaction.costoUnitario) || selectedItem.costoUnitario
        }),
      })

      if (res.ok) {
        setIsTransactionDialogOpen(false)
        setNewTransaction({ tipo: "ENTRADA", cantidad: "", costoUnitario: "", documentoRef: "", observaciones: "" })
        setSelectedItem(null)
        fetchItems()
      }
    } catch (error) {
      console.error("Error creating transaction:", error)
    }
  }

  const filteredItems = items.filter(item =>
    item.nombre.toLowerCase().includes(search.toLowerCase()) ||
    item.codigo.toLowerCase().includes(search.toLowerCase()) ||
    item.categoria.toLowerCase().includes(search.toLowerCase())
  )

  const lowStockItems = items.filter(item => item.stockActual <= item.stockMinimo)
  const totalValue = items.reduce((sum, item) => sum + (Number(item.stockActual) * Number(item.costoUnitario)), 0)

  const handleOpenDetail = async (item: InventoryItem) => {
    try {
      const res = await fetch(`/api/inventory/items/${item.id}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedItem(data.data)
        setIsDetailOpen(true)
      }
    } catch (error) {
      console.error("Error fetching item details:", error)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900">Control de Inventario</h1>
            <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
              <Box className="h-4 w-4 text-indigo-500" />
              Gestión de Kardex y existencias institucionales {new Date().getFullYear()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2 shadow-sm border-gray-200"
              onClick={() => setIsReportOpen(true)}
            >
              <FileBarChart className="h-4 w-4" /> Informe Kardex
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-lg shadow-indigo-100">
                  <Plus className="h-4 w-4" /> Nuevo Artículo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">Registro de Artículo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitItem} className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Código / SKU</label>
                      <Input
                        required
                        className="rounded-xl border-gray-100 bg-gray-50 focus-visible:ring-indigo-500"
                        value={newItem.codigo}
                        onChange={(e) => setNewItem({ ...newItem, codigo: e.target.value })}
                        placeholder="Ej: ART-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Unidad de Medida</label>
                      <Input
                        required
                        className="rounded-xl border-gray-100 bg-gray-50 focus-visible:ring-indigo-500"
                        value={newItem.unidadMedida}
                        onChange={(e) => setNewItem({ ...newItem, unidadMedida: e.target.value })}
                        placeholder="UN, KG, MT"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nombre del Artículo</label>
                    <Input
                      required
                      className="rounded-xl border-gray-100 bg-gray-50 focus-visible:ring-indigo-500"
                      value={newItem.nombre}
                      onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
                      placeholder="Descripción corta del item"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Descripción Técnica</label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                      value={newItem.descripcion}
                      onChange={(e) => setNewItem({ ...newItem, descripcion: e.target.value })}
                      placeholder="Especificaciones o detalles del artículo..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Categoría</label>
                      <Input
                        required
                        className="rounded-xl border-gray-100 bg-gray-50 focus-visible:ring-indigo-500"
                        value={newItem.categoria}
                        onChange={(e) => setNewItem({ ...newItem, categoria: e.target.value })}
                        placeholder="OFICINA, LIMPIEZA"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Método de Valuación</label>
                      <select
                        required
                        className="flex h-10 w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                        value={newItem.metodoKardex}
                        onChange={(e) => setNewItem({ ...newItem, metodoKardex: e.target.value })}
                      >
                        <option value="PROMEDIO">Promedio Ponderado</option>
                        <option value="FIFO">FIFO (PEPS)</option>
                        <option value="LIFO">LIFO (UEPS)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Punto de Reorden</label>
                      <Input
                        required
                        type="number"
                        className="rounded-xl border-gray-100 bg-gray-50 focus-visible:ring-indigo-500"
                        value={newItem.stockMinimo}
                        onChange={(e) => setNewItem({ ...newItem, stockMinimo: e.target.value })}
                        placeholder="Mín"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Capacidad Máx.</label>
                      <Input
                        required
                        type="number"
                        className="rounded-xl border-gray-100 bg-gray-50 focus-visible:ring-indigo-500"
                        value={newItem.stockMaximo}
                        onChange={(e) => setNewItem({ ...newItem, stockMaximo: e.target.value })}
                        placeholder="Máx"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Costo Base (C$)</label>
                      <Input
                        required
                        type="number"
                        step="0.01"
                        className="rounded-xl border-gray-100 bg-gray-50 focus-visible:ring-indigo-500"
                        value={newItem.costoUnitario}
                        onChange={(e) => setNewItem({ ...newItem, costoUnitario: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-100">
                      Confirmar Alta de Artículo
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Alertas de Stock */}
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
              <Button
                variant="outline"
                size="sm"
                className="border-amber-200 text-amber-700 hover:bg-amber-100 bg-white rounded-xl text-[10px] font-black"
                onClick={() => setSearch(lowStockItems[0].codigo)}
              >
                Localizar Items
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dynamic Stats Section */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-none shadow-sm bg-white overflow-hidden group relative">
            <div className="absolute top-0 right-0 p-4 text-gray-50 group-hover:text-indigo-50 transition-colors">
              <Package className="h-16 w-16" />
            </div>
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Artículos</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-black text-gray-900">{items.length}</div>
              <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-indigo-500" /> Items catalogados
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 transition-all group-hover:w-2" />
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Valor de Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-gray-900">{formatCurrency(totalValue)}</div>
              <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">Costo total acumulado</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 transition-all group-hover:w-2" />
            <CardHeader className="pb-2 text-amber-600">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest">Reponción Urgente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-gray-900">{lowStockItems.length}</div>
              <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">Items bajo el mínimo</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-indigo-900 overflow-hidden relative group">
            <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:rotate-12 transition-transform">
              <History className="h-24 w-24 text-white" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">Movimientos Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-white">0</div>
              <p className="text-[10px] text-indigo-400 mt-2 font-bold uppercase">Entradas / Salidas registradas</p>
            </CardContent>
          </Card>
        </div>

        {/* Master List Card */}
        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl">
          <CardHeader className="border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between py-6 gap-4">
            <div>
              <CardTitle className="text-xl font-black text-gray-900 uppercase tracking-tight">Registro de Existencias (Kardex)</CardTitle>
              <CardDescription className="text-xs font-medium text-gray-400">Control físico y financiero de inventario institucional</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por código, nombre..."
                  className="pl-10 w-[300px] border-none bg-gray-50 rounded-xl text-sm focus-visible:ring-indigo-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="ghost" size="icon" className="bg-gray-50 rounded-xl">
                <Filter className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-10 w-10 animate-spin border-4 border-indigo-600 border-t-transparent rounded-full" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Actualizando existencias...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-24 bg-gray-50/20">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-200" />
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Sin artículos</h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto mt-2">No se encontraron items que coincidan con la búsqueda.</p>
              </div>
            ) : (
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="h-14 px-6 text-left align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">ID / SKU</th>
                      <th className="h-14 px-6 text-left align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Nombre del Artículo</th>
                      <th className="h-14 px-6 text-center align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Stock Actual</th>
                      <th className="h-14 px-6 text-right align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Costo Unit.</th>
                      <th className="h-14 px-6 text-right align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Valor Total</th>
                      <th className="h-14 px-6 text-center align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Estado</th>
                      <th className="h-14 px-6 text-right align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredItems.map((item) => {
                      const isLowStock = item.stockActual <= item.stockMinimo
                      const valorTotal = Number(item.stockActual) * Number(item.costoUnitario)

                      return (
                        <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-mono text-xs font-black text-indigo-600 tracking-tighter">{item.codigo}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">{item.categoria}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-800 block max-w-[200px] truncate">{item.nombre}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className={`text-sm font-black ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>{item.stockActual}</span>
                              <span className="text-[9px] font-bold text-gray-400 uppercase">{item.unidadMedida}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-black text-gray-500">{formatCurrency(item.costoUnitario)}</td>
                          <td className="px-6 py-4 text-right font-black text-gray-900">{formatCurrency(valorTotal)}</td>
                          <td className="px-6 py-4 text-center">
                            {isLowStock ? (
                              <Badge variant="destructive" className="h-5 text-[9px] font-black uppercase px-2 shadow-sm shadow-red-100">Bajo Stock</Badge>
                            ) : (
                              <Badge variant="outline" className="h-5 text-[9px] font-black uppercase px-2 border-emerald-200 text-emerald-600 bg-emerald-50">Normal</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Dialog open={isTransactionDialogOpen && selectedItem?.id === item.id} onOpenChange={(open) => {
                                setIsTransactionDialogOpen(open)
                                if (!open) setSelectedItem(null)
                              }}>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-black text-[10px] uppercase rounded-lg"
                                    onClick={() => setSelectedItem(item)}
                                  >
                                    <ArrowRightLeft className="mr-1.5 h-3 w-3" /> Kardex
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl font-black">Registrar Movimiento</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={handleSubmitTransaction} className="space-y-6 py-4">
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tipo de Movimiento</label>
                                      <select
                                        required
                                        className="flex h-10 w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                                        value={newTransaction.tipo}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, tipo: e.target.value })}
                                      >
                                        <option value="ENTRADA">Entrada (Compra/Donación)</option>
                                        <option value="SALIDA">Salida (Consumo/Despacho)</option>
                                        <option value="AJUSTE">Ajuste de Inventario</option>
                                      </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cantidad</label>
                                        <Input
                                          required
                                          type="number"
                                          className="rounded-xl border-gray-100 bg-gray-50"
                                          value={newTransaction.cantidad}
                                          onChange={(e) => setNewTransaction({ ...newTransaction, cantidad: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Costo Unitario (C$)</label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          className="rounded-xl border-gray-100 bg-gray-50"
                                          value={newTransaction.costoUnitario}
                                          onChange={(e) => setNewTransaction({ ...newTransaction, costoUnitario: e.target.value })}
                                          placeholder={item.costoUnitario.toString()}
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Documento de Referencia</label>
                                      <Input
                                        className="rounded-xl border-gray-100 bg-gray-50"
                                        value={newTransaction.documentoRef}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, documentoRef: e.target.value })}
                                        placeholder="N° Factura o Comprobante"
                                      />
                                    </div>
                                    <DialogFooter>
                                      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-black uppercase tracking-widest text-xs">Registrar Movimiento</Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 rounded-lg hover:bg-white group-hover:shadow-sm"
                                onClick={() => handleOpenDetail(item)}
                              >
                                <Eye className="h-4 w-4 text-indigo-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          <div className="bg-gray-50/80 p-6 border-t border-gray-100 flex items-center justify-between italic font-medium text-gray-400 text-[10px]">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <ClipboardList className="h-3.5 w-3.5" />
                <span>Control Automático de Stock (Alertas activas)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Costeo bajo método Promedio Ponderado</span>
              </div>
            </div>
            <p>Actualizado: {mounted ? new Date().toLocaleString() : "..."}</p>
          </div>
        </Card>
      </div>

      <InventoryItemDetailDialog
        item={selectedItem}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      <KardexReportDialog
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
      />
    </DashboardLayout>
  )
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
  )
}
