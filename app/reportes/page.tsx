"use client"

export const dynamic = "force-dynamic";
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  FileText,
  Download,
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Loader2,
  CheckCircle2,
  Eye,
  FileSpreadsheet,
  FileDown,
  Activity,
  PieChart
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import * as XLSX from 'xlsx'

type ReportType = "budget-execution" | "bank-movements" | "financial-summary"
type ExportFormat = "html" | "excel" | "csv"

interface BudgetItem {
  id: string
  codigo: string
  nombre: string
  tipoGasto: string
  centroRegional: string
  montoAsignado: number
  montoEjecutado: number
  montoDisponible: number
}

const reports = [
  {
    id: "budget-execution" as ReportType,
    title: "Ejecución Presupuestaria",
    description: "Detalle de partidas, techos asignados y gastos reales por centro regional.",
    icon: BarChart3,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500",
  },
  {
    id: "bank-movements" as ReportType,
    title: "Movimientos Bancarios",
    description: "Conciliación de entradas, salidas y cheques flotantes de todas las cuentas.",
    icon: Activity,
    color: "text-blue-600",
    bgColor: "bg-blue-500",
  },
  {
    id: "financial-summary" as ReportType,
    title: "Resumen Financiero Anual",
    description: "Estado consolidado de la salud financiera de la región (Ingresos vs Egresos).",
    icon: PieChart,
    color: "text-purple-600",
    bgColor: "bg-purple-500",
  }
]

import { ModuleHero } from "@/components/layout/module-hero"

export default function ReportesPage() {
  const [generating, setGenerating] = useState<ReportType | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<BudgetItem[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState<typeof reports[0] | null>(null)
  const [exportFormat, setExportFormat] = useState<ExportFormat>("html")
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    region: "all"
  })

  const loadPreviewData = async (report: typeof reports[0]) => {
    setSelectedReport(report)
    setPreviewOpen(true)
    setPreviewLoading(true)
    try {
      if (report.id === "budget-execution") {
        const res = await fetch("/api/budget/items")
        if (res.ok) {
          const data = await res.json()
          setPreviewData(data.data || [])
        }
      } else {
        setPreviewData([])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleGenerateReport = async (report: any, forcedFormat?: ExportFormat) => {
    const format = forcedFormat || exportFormat
    setGenerating(report.id)
    
    try {
      // Logic for different formats
      if (format === "excel") {
        const worksheet = XLSX.utils.json_to_sheet(previewData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte")
        XLSX.writeFile(workbook, `${report.id}_${filters.endDate}.xlsx`)
        toast.success("Excel generado correctamente")
      } else if (format === "csv") {
        const worksheet = XLSX.utils.json_to_sheet(previewData)
        const csv = XLSX.utils.sheet_to_csv(worksheet)
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.setAttribute("download", `${report.id}.csv`)
        link.click()
        toast.success("CSV generado correctamente")
      } else {
        toast.info("Generando vista imprimible...")
        // HTML Preview/Print logic
      }
    } catch (error) {
      toast.error("Error al generar reporte")
    } finally {
      setGenerating(null)
    }
  }

  const totalAsignado = previewData.reduce((acc, curr) => acc + Number(curr.montoAsignado), 0)
  const totalEjecutado = previewData.reduce((acc, curr) => acc + Number(curr.montoEjecutado), 0)
  const totalDisponible = totalAsignado - totalEjecutado

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#fcfcfc] pb-20">
        <ModuleHero 
          title="SISTEMA DE REPORTERÍA" 
          subtitle="DOCUMENTACIÓN OFICIAL Y ANALÍTICA FINANCIERA DEL GRACCNN"
        />

        <div className="max-w-7xl mx-auto px-8 -mt-20 relative z-30 space-y-8">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
               </div>
               <div>
                  <h3 className="text-white font-black uppercase text-xs tracking-widest">Inteligencia de Datos</h3>
                  <p className="text-slate-400 text-[10px] font-bold">Consolidación en tiempo real</p>
               </div>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="text-right">
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-tighter">Ejercicio Fiscal</p>
                  <p className="text-white font-black text-xl">{new Date().getFullYear()}</p>
               </div>
               <Separator orientation="vertical" className="h-8 bg-slate-700" />
               <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400 font-bold text-[10px] uppercase">Conexión Activa</span>
               </div>
            </div>
          </div>

        <Card className="border-none shadow-xl rounded-[2rem]">
          <CardHeader className="bg-gradient-to-br from-slate-50 to-transparent">
            <CardTitle className="text-xl font-black uppercase tracking-tight">Parámetros de Reportes</CardTitle>
            <CardDescription className="font-medium">Configure el período y filtros para generar reportes personalizados</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Fecha Inicio</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="h-12 rounded-xl border-slate-200 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Fecha Fin</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="h-12 rounded-xl border-slate-200 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Centro Regional</Label>
                <Select value={filters.region} onValueChange={(v) => setFilters({ ...filters, region: v })}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Todos los Centros</SelectItem>
                    <SelectItem value="BILWI">Bilwi</SelectItem>
                    <SelectItem value="WASPAM">Waspam</SelectItem>
                    <SelectItem value="ROSITA">Rosita</SelectItem>
                    <SelectItem value="SIUNA">Siuna</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Formato de Salida</Label>
                <Select value={exportFormat} onValueChange={(v: ExportFormat) => setExportFormat(v)}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="html">HTML (Imprimible)</SelectItem>
                    <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => {
            const Icon = report.icon
            const isGenerating = generating === report.id

            return (
              <Card key={report.id} className="group hover:shadow-2xl transition-all duration-300 border-none shadow-xl overflow-hidden rounded-[2rem]">
                <div className={`h-2 ${report.bgColor}`} />
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 rounded-2xl ${report.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className={`h-7 w-7 text-white`} />
                  </div>
                  <CardTitle className="text-lg font-black uppercase tracking-tight">{report.title}</CardTitle>
                  <CardDescription className="text-xs font-medium text-slate-500 uppercase tracking-wide">{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border-2 hover:bg-slate-50 active:scale-[0.98] transition-all"
                    onClick={() => loadPreviewData(report)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Vista Previa
                  </Button>
                  <Button
                    className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all"
                    onClick={() => handleGenerateReport(report)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar Reporte
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2rem] border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                Vista Previa: {selectedReport?.title}
              </DialogTitle>
              <DialogDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em]">
                Previsualización de datos generados para el período seleccionado
              </DialogDescription>
            </DialogHeader>

            {previewLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Sincronizando Base de Datos...</p>
              </div>
            ) : selectedReport?.id === "budget-execution" && previewData.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                    <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Techo Asignado</p>
                    <p className="text-2xl font-black text-emerald-900">{formatCurrency(totalAsignado)}</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <p className="text-[10px] font-black uppercase text-blue-600 mb-1">Gasto Ejecutado</p>
                    <p className="text-2xl font-black text-blue-900">{formatCurrency(totalEjecutado)}</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                    <p className="text-[10px] font-black uppercase text-purple-600 mb-1">Disponible</p>
                    <p className="text-2xl font-black text-purple-900">{formatCurrency(totalDisponible)}</p>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-4 text-left font-black uppercase text-slate-400 tracking-widest">Código</th>
                        <th className="px-5 py-4 text-left font-black uppercase text-slate-400 tracking-widest">Descripción Partida</th>
                        <th className="px-5 py-4 text-left font-black uppercase text-slate-400 tracking-widest">Centro</th>
                        <th className="px-5 py-4 text-right font-black uppercase text-slate-400 tracking-widest">Asignado</th>
                        <th className="px-5 py-4 text-right font-black uppercase text-slate-400 tracking-widest">Ejecutado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {previewData.slice(0, 10).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-4 font-mono font-bold text-indigo-600">{item.codigo}</td>
                          <td className="px-5 py-4 font-bold text-slate-900 uppercase truncate max-w-[200px]">{item.nombre}</td>
                          <td className="px-5 py-4 font-medium text-slate-500">{item.centroRegional}</td>
                          <td className="px-5 py-4 text-right font-bold tabular-nums">{formatCurrency(item.montoAsignado)}</td>
                          <td className="px-5 py-4 text-right font-black text-blue-600 tabular-nums">{formatCurrency(item.montoEjecutado)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl">
                   <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Últimos 10 registros mostrados en vista previa</p>
                   <div className="flex gap-2">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[9px] tracking-widest rounded-xl" onClick={() => handleGenerateReport(selectedReport, "excel")}>
                        Descargar Excel
                      </Button>
                      <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-black uppercase text-[9px] tracking-widest rounded-xl" onClick={() => setPreviewOpen(false)}>
                        Cerrar
                      </Button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <FileText className="h-16 w-16 mx-auto mb-4 text-slate-200" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin datos disponibles para el reporte seleccionado</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </DashboardLayout>
  )
}
