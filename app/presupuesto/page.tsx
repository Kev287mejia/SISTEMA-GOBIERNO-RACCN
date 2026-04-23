"use client"

export const dynamic = "force-dynamic";
import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Search,
  Filter,
  BarChart3,
  ArrowUpRight,
  Target,
  FileBarChart,
  Eye,
  MapPin,
  Loader2
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { BudgetItemDetailDialog } from "@/components/budget/budget-item-detail-dialog"
import { BudgetExecutionForm } from "@/components/budget/budget-execution-form"
import { BudgetReportDialog } from "@/components/budget/budget-report-dialog"
import { BudgetCharts } from "@/components/budget/budget-charts"
import { BudgetProgressBar } from "@/components/budget/budget-progress-bar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { toast } from "sonner"

type BudgetItem = {
  id: string
  codigo: string
  nombre: string
  categoria: string
  anio: number
  montoAsignado: number
  montoEjecutado: number
  montoDisponible: number
  estado: string
  tipoGasto: string
  centroRegional: string
  descripcion?: string
  creadoPor?: {
    nombre: string
    apellido: string
  }
}

function SearchResultsHandler({ budgetItems, onOpen }: { budgetItems: BudgetItem[], onOpen: (item: BudgetItem) => void }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const id = searchParams.get('openItem')
    if (id && budgetItems.length > 0) {
      const item = budgetItems.find(x => x.id === id)
      if (item) {
        onOpen(item)
        router.replace(pathname, { scroll: false })
      }
    }
  }, [searchParams, budgetItems, onOpen, router, pathname])
  return null
}

import { ModuleHero } from "@/components/layout/module-hero"

export default function PresupuestoPage() {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedItem, setSelectedItem] = useState<BudgetItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isExecutionOpen, setIsExecutionOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  const [analyticsData, setAnalyticsData] = useState({ trendData: [], pieData: [] })
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)

  const [regionFilter, setRegionFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const [newItem, setNewItem] = useState({
    codigo: "",
    nombre: "",
    categoria: "INVERSION",
    anio: new Date().getFullYear(),
    montoAsignado: "",
    tipoGasto: "INVERSION",
    centroRegional: "BILWI",
    descripcion: ""
  })

  const fetchBudgetItems = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (regionFilter !== "all") query.set("region", regionFilter)
      if (typeFilter !== "all") query.set("type", typeFilter)
      
      const res = await fetch(`/api/budget/items?${query.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setBudgetItems(data.data || [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true)
    try {
      const res = await fetch("/api/budget/analytics")
      if (res.ok) {
        const data = await res.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  useEffect(() => {
    fetchBudgetItems()
    fetchAnalytics()
  }, [regionFilter, typeFilter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/budget/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newItem,
          montoAsignado: parseFloat(newItem.montoAsignado)
        })
      })
      if (res.ok) {
        toast.success("Partida presupuestaria creada")
        setIsDialogOpen(false)
        fetchBudgetItems()
      }
    } catch (error) {
      toast.error("Error al crear partida")
    }
  }

  const filteredItems = budgetItems.filter(item => 
    item.nombre.toLowerCase().includes(search.toLowerCase()) ||
    item.codigo.toLowerCase().includes(search.toLowerCase())
  )

  const totalAsignado = budgetItems.reduce((acc, item) => acc + Number(item.montoAsignado), 0)
  const totalEjecutado = budgetItems.reduce((acc, item) => acc + Number(item.montoEjecutado), 0)
  const totalDisponible = totalAsignado - totalEjecutado
  const itemsCriticos = budgetItems.filter(item => (Number(item.montoEjecutado) / Number(item.montoAsignado)) > 0.95)

  const handleOpenDetail = (item: BudgetItem) => {
    setSelectedItem(item)
    setIsDetailOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#fcfcfc] pb-20">
        <ModuleHero 
          title="CONTROL PRESUPUESTARIO" 
          subtitle="MONITOREO DE EJECUCIÓN FISCAL, PLANIFICACIÓN SNIP Y DISPONIBILIDAD"
        />

        <div className="max-w-7xl mx-auto px-8 -mt-20 relative z-30 space-y-10">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-slate-100 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-hidden relative">
            <div className="relative z-10">
               <h3 className="text-slate-900 font-black uppercase text-xs tracking-[0.2em] mb-1">Responsable de Gestión</h3>
               <p className="text-slate-500 font-bold text-sm">Lic. Yahira Tucker Medina</p>
            </div>
            
            <div className="relative z-10 flex flex-wrap items-center gap-4">
              <Button
                variant="outline"
                className="h-12 px-6 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold uppercase tracking-widest text-[10px] gap-2"
                onClick={() => setIsReportOpen(true)}
              >
                <FileBarChart className="h-4 w-4 text-emerald-500" /> Inteligencia y Reportes
              </Button>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-indigo-100">
                    <Plus className="h-4 w-4" /> Nueva Partida SNIP
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[600px] border-none shadow-2xl rounded-[2rem] overflow-hidden p-0">
                  <div className="bg-slate-900 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Plus className="h-40 w-40" />
                    </div>
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-black tracking-tight">Registro de Partida</DialogTitle>
                      <CardDescription className="text-slate-400 font-medium italic mt-2">Instrumento de planificación para asignación de recursos públicos.</CardDescription>
                    </DialogHeader>
                  </div>

                  <form onSubmit={handleSubmit} className="p-8 bg-white space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Código Identificador</label>
                        <Input
                          required
                          className="h-14 px-5 rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-emerald-500 font-bold transition-all"
                          value={newItem.codigo}
                          onChange={(e) => setNewItem({ ...newItem, codigo: e.target.value })}
                          placeholder="Ej: 5.1.04"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Techo Presupuestario (C$)</label>
                        <Input
                          required
                          type="number"
                          step="0.01"
                          className="h-14 px-5 rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-emerald-500 font-bold transition-all"
                          value={newItem.montoAsignado}
                          onChange={(e) => setNewItem({ ...newItem, montoAsignado: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nombre de la Partida / Proyecto</label>
                      <Input
                        required
                        className="h-14 px-5 rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-emerald-500 font-bold transition-all"
                        value={newItem.nombre}
                        onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
                        placeholder="Descripción corta del destino del fondo..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Naturaleza del Gasto</label>
                        <Select
                          value={newItem.tipoGasto}
                          onValueChange={(v) => setNewItem({ ...newItem, tipoGasto: v })}
                        >
                          <SelectTrigger className="h-14 px-5 rounded-2xl border-slate-100 bg-slate-50 font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            <SelectItem value="FUNCIONAMIENTO">Gasto Operativo (Funcionamiento)</SelectItem>
                            <SelectItem value="INVERSION">Inversión Pública (PIP)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Destino Regional</label>
                        <Select
                          value={newItem.centroRegional}
                          onValueChange={(v) => setNewItem({ ...newItem, centroRegional: v })}
                        >
                          <SelectTrigger className="h-14 px-5 rounded-2xl border-slate-100 bg-slate-50 font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            <SelectItem value="BILWI">Bilwi</SelectItem>
                            <SelectItem value="WASPAM">Waspam</SelectItem>
                            <SelectItem value="ROSITA">Rosita</SelectItem>
                            <SelectItem value="SIUNA">Siuna</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <DialogFooter className="pt-4">
                      <Button type="submit" className="w-full h-14 bg-slate-900 hover:bg-slate-800 rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-slate-200">
                        Formalizar Apertura de Partida
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {itemsCriticos.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-6 shadow-lg shadow-red-100">
              <div className="h-16 w-16 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-200 flex-shrink-0 rotate-3 animate-pulse">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-black text-red-900 uppercase tracking-tight">Alertas de Disponibilidad</h3>
                  <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[9px] font-black tracking-widest uppercase shadow-lg">Crítico</span>
                </div>
                <p className="text-sm text-red-700/80 font-medium">
                  Se han detectado <span className="font-black underline underline-offset-2">{itemsCriticos.length} partidas</span> con nivel de ejecución superior al 95%. Proceder con cautela antes de registrar nuevos egresos.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-3">
            <div className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <DollarSign className="h-32 w-32" />
              </div>
              <div className="relative z-10 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Techo Asignado {new Date().getFullYear()}</p>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{formatCurrency(totalAsignado)}</h2>
              </div>
              <div className="mt-8 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full w-full shadow-lg" />
              </div>
            </div>

            <div className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
              <div className="relative z-10 space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gasto Ejecutado</p>
                  <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[10px] font-black shadow-lg">{totalAsignado > 0 ? ((totalEjecutado / totalAsignado) * 100).toFixed(1) : 0}%</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{formatCurrency(totalEjecutado)}</h2>
              </div>
              <div className="mt-8 h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-[1.5s] ease-out shadow-lg"
                  style={{ width: `${(totalEjecutado / totalAsignado) * 100}%` }}
                />
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] shadow-xl shadow-slate-900/20 border border-slate-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
              <div className="relative z-10 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Saldo Disponible</p>
                <h2 className="text-4xl font-black text-white tracking-tighter">{formatCurrency(totalDisponible)}</h2>
              </div>
              <div className="mt-8 flex justify-between gap-1 h-3 group-hover:gap-1.5 transition-all">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`h-full flex-1 rounded-sm transition-all ${i < (totalDisponible / totalAsignado * 20) ? 'bg-emerald-500 shadow-sm' : 'bg-slate-700'}`} />
                ))}
              </div>
            </div>
          </div>

          <BudgetCharts
            trendData={analyticsData.trendData}
            pieData={analyticsData.pieData}
            loading={loadingAnalytics}
          />

          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all duration-500">
            <div className="p-10 border-b border-slate-50 bg-gradient-to-br from-slate-50/50 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 uppercase">Partidas Registradas</h2>
                <p className="text-sm font-medium text-slate-500">Visualización detallada de la distribución financiera regional.</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-3xl shadow-lg border border-slate-100">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Filtrar por código o nombre..."
                    className="pl-11 h-12 w-[300px] border-none bg-slate-50 rounded-2xl text-sm font-medium focus-visible:ring-emerald-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="h-12 w-[160px] bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600">
                    <SelectValue placeholder="Centro Reg." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    <SelectItem value="all">Todo Centro</SelectItem>
                    <SelectItem value="BILWI">Bilwi</SelectItem>
                    <SelectItem value="WASPAM">Waspam</SelectItem>
                    <SelectItem value="ROSITA">Rosita</SelectItem>
                    <SelectItem value="SIUNA">Siuna</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 bg-gradient-to-br from-slate-50/20 to-transparent">
                  <Loader2 className="h-16 w-16 animate-spin text-emerald-600" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Consultando Registro Fiscal...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-32 bg-gradient-to-br from-slate-50/10 to-transparent">
                  <Search className="h-10 w-10 text-slate-300 mx-auto mb-6" />
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Sin correspondencias</h3>
                </div>
              ) : (
                <div className="relative w-full overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-50/50 to-transparent border-b border-slate-100">
                        <th className="h-12 px-4 text-left align-middle font-black text-[9px] uppercase tracking-widest text-slate-400">Código</th>
                        <th className="h-12 px-4 text-left align-middle font-black text-[9px] uppercase tracking-widest text-slate-400">Partida</th>
                        <th className="h-12 px-3 text-right align-middle font-black text-[9px] uppercase tracking-widest text-slate-400">Asignado</th>
                        <th className="h-12 px-3 text-right align-middle font-black text-[9px] uppercase tracking-widest text-slate-400">Ejecutado</th>
                        <th className="h-12 px-3 text-right align-middle font-black text-[9px] uppercase tracking-widest text-slate-400">Disponible</th>
                        <th className="h-12 px-3 text-center align-middle font-black text-[9px] uppercase tracking-widest text-slate-400">%</th>
                        <th className="h-12 px-3 text-right align-middle font-black text-[9px] uppercase tracking-widest text-slate-400">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredItems.map((item) => {
                        const porcentaje = (Number(item.montoEjecutado) / Number(item.montoAsignado)) * 100
                        return (
                          <tr key={item.id} className="group hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-transparent transition-all duration-300">
                            <td className="px-4 py-4">
                              <span className="font-mono text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit">{item.codigo}</span>
                            </td>
                            <td className="px-4 py-4 max-w-[200px]">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-slate-800 text-xs uppercase truncate">{item.nombre}</span>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.tipoGasto}</span>
                              </div>
                            </td>
                            <td className="px-3 py-4 text-right font-black text-slate-900 tabular-nums text-xs">{formatCurrency(item.montoAsignado)}</td>
                            <td className="px-3 py-4 text-right font-black text-blue-600 tabular-nums text-xs">{formatCurrency(item.montoEjecutado)}</td>
                            <td className="px-3 py-4 text-right tabular-nums">
                              <span className={`font-black px-2 py-1 rounded-lg shadow-sm text-xs ${item.montoDisponible >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                {formatCurrency(item.montoDisponible)}
                              </span>
                            </td>
                            <td className="px-3 py-4">
                              <BudgetProgressBar
                                current={Number(item.montoEjecutado)}
                                total={Number(item.montoAsignado)}
                                height="h-2"
                              />
                            </td>
                            <td className="px-3 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => handleOpenDetail(item)}>
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => {
                                  setSelectedItem(item)
                                  setIsExecutionOpen(true)
                                }}>
                                  <ArrowUpRight className="h-3.5 w-3.5" />
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
            </div>
          </div>

          <BudgetItemDetailDialog item={selectedItem} open={isDetailOpen} onOpenChange={setIsDetailOpen} />
          
          <Dialog open={isExecutionOpen} onOpenChange={setIsExecutionOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <BudgetExecutionForm budgetItemId={selectedItem?.id || ""} onSuccess={() => {
                setIsExecutionOpen(false)
                fetchBudgetItems()
                fetchAnalytics()
              }} />
            </DialogContent>
          </Dialog>

          <BudgetReportDialog open={isReportOpen} onOpenChange={setIsReportOpen} />
          
          <Suspense fallback={null}>
            <SearchResultsHandler budgetItems={budgetItems} onOpen={handleOpenDetail} />
          </Suspense>
        </div>
      </div>
    </DashboardLayout>
  )
}
