"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  FileDown
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

  const reports = [
    {
      id: "budget-execution" as ReportType,
      title: "Ejecución Presupuestaria",
      description: "Reporte detallado de partidas presupuestarias y su nivel de ejecución",
      icon: BarChart3,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      endpoint: "/api/reports/budget-execution"
    },
    {
      id: "bank-movements" as ReportType,
      title: "Movimientos Bancarios",
      description: "Consolidado de transacciones bancarias por período",
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      endpoint: "/api/reports/bank-movements"
    },
    {
      id: "financial-summary" as ReportType,
      title: "Resumen Financiero",
      description: "Estado financiero consolidado del GRACCNN",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      endpoint: "/api/reports/financial-summary"
    }
  ]

  const loadPreviewData = async (report: typeof reports[0]) => {
    setPreviewLoading(true)
    setSelectedReport(report)
    setPreviewOpen(true)

    try {
      if (report.id === "budget-execution") {
        const queryParams = new URLSearchParams({
          centroRegional: filters.region,
          tipoGasto: "all"
        })

        const response = await fetch(`/api/budget/items?${queryParams}`)
        if (response.ok) {
          const data = await response.json()
          setPreviewData(data.data || [])
        }
      } else {
        setPreviewData([])
      }
    } catch (error) {
      console.error("Error loading preview:", error)
      toast.error("Error al cargar la vista previa")
    } finally {
      setPreviewLoading(false)
    }
  }

  const exportToExcel = (data: BudgetItem[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map(item => ({
        'Código': item.codigo,
        'Partida': item.nombre,
        'Tipo': item.tipoGasto,
        'Centro Regional': item.centroRegional,
        'Asignado': Number(item.montoAsignado),
        'Ejecutado': Number(item.montoEjecutado),
        'Disponible': Number(item.montoDisponible),
        'Porcentaje': Number(item.montoAsignado) > 0
          ? ((Number(item.montoEjecutado) / Number(item.montoAsignado)) * 100).toFixed(2) + '%'
          : '0%'
      }))
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Presupuesto")

    // Add totals row
    const totalAsignado = data.reduce((sum, item) => sum + Number(item.montoAsignado), 0)
    const totalEjecutado = data.reduce((sum, item) => sum + Number(item.montoEjecutado), 0)
    const totalDisponible = data.reduce((sum, item) => sum + Number(item.montoDisponible), 0)

    XLSX.utils.sheet_add_json(worksheet, [{
      'Código': 'TOTAL',
      'Partida': '',
      'Tipo': '',
      'Centro Regional': '',
      'Asignado': totalAsignado,
      'Ejecutado': totalEjecutado,
      'Disponible': totalDisponible,
      'Porcentaje': totalAsignado > 0 ? ((totalEjecutado / totalAsignado) * 100).toFixed(2) + '%' : '0%'
    }], { skipHeader: true, origin: -1 })

    XLSX.writeFile(workbook, filename)
  }

  const exportToCSV = (data: BudgetItem[], filename: string) => {
    const headers = ['Código', 'Partida', 'Tipo', 'Centro Regional', 'Asignado', 'Ejecutado', 'Disponible', 'Porcentaje']
    const rows = data.map(item => [
      item.codigo,
      item.nombre,
      item.tipoGasto,
      item.centroRegional,
      Number(item.montoAsignado),
      Number(item.montoEjecutado),
      Number(item.montoDisponible),
      Number(item.montoAsignado) > 0
        ? ((Number(item.montoEjecutado) / Number(item.montoAsignado)) * 100).toFixed(2) + '%'
        : '0%'
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  const handleGenerateReport = async (report: typeof reports[0], format: ExportFormat = exportFormat) => {
    setGenerating(report.id)
    setPreviewOpen(false)

    try {
      if (format === "excel" || format === "csv") {
        // For Excel/CSV, use the preview data
        if (previewData.length === 0) {
          await loadPreviewData(report)
        }

        const filename = `${report.id}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`

        if (format === "excel") {
          exportToExcel(previewData, filename)
        } else {
          exportToCSV(previewData, filename)
        }

        toast.success(`Reporte exportado a ${format.toUpperCase()} exitosamente`)
      } else {
        // For HTML, use the API endpoint
        const queryParams = new URLSearchParams({
          startDate: filters.startDate,
          endDate: filters.endDate,
          region: filters.region
        })

        const response = await fetch(`${report.endpoint}?${queryParams}`)

        if (!response.ok) {
          throw new Error("Error al generar el reporte")
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${report.id}_${new Date().toISOString().split('T')[0]}.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast.success(`Reporte "${report.title}" generado exitosamente`)
      }
    } catch (error) {
      console.error("Error generating report:", error)
      toast.error("Error al generar el reporte. Por favor intente nuevamente.")
    } finally {
      setGenerating(null)
    }
  }

  const totalAsignado = previewData.reduce((sum, item) => sum + Number(item.montoAsignado), 0)
  const totalEjecutado = previewData.reduce((sum, item) => sum + Number(item.montoEjecutado), 0)
  const totalDisponible = previewData.reduce((sum, item) => sum + Number(item.montoDisponible), 0)

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-full px-6 pb-20">

        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-10 rounded-[2.5rem] shadow-2xl shadow-purple-900/20 border border-purple-500/10">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <FileText className="h-64 w-64 text-white rotate-12" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Sistema de Reportería</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-white leading-tight">
                Generador de <span className="text-purple-400">Reportes</span>
              </h1>
              <p className="text-purple-100/60 font-medium max-w-xl text-lg">
                Documentación oficial y reportes financieros del GRACCNN con datos en tiempo real.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-purple-300">Período</p>
                    <p className="text-sm font-bold text-white">{new Date().getFullYear()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="border-none shadow-xl">
          <CardHeader className="bg-gradient-to-br from-slate-50 to-transparent">
            <CardTitle className="text-xl font-black uppercase tracking-tight">Parámetros de Reportes</CardTitle>
            <CardDescription className="font-medium">Configure el período y filtros para generar reportes personalizados</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha Inicio</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="h-12 rounded-xl border-slate-200 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha Fin</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="h-12 rounded-xl border-slate-200 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Centro Regional</Label>
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
                    <SelectItem value="BONANZA">Bonanza</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Formato</Label>
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

        {/* Report Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => {
            const Icon = report.icon
            const isGenerating = generating === report.id

            return (
              <Card key={report.id} className="group hover:shadow-2xl transition-all duration-300 border-none shadow-xl overflow-hidden">
                <div className={`h-2 ${report.bgColor}`} />
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 rounded-2xl ${report.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-7 w-7 ${report.color}`} />
                  </div>
                  <CardTitle className="text-lg font-black uppercase tracking-tight">{report.title}</CardTitle>
                  <CardDescription className="text-sm font-medium">{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border-2"
                    onClick={() => loadPreviewData(report)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Vista Previa
                  </Button>
                  <Button
                    className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg"
                    onClick={() => handleGenerateReport(report)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : exportFormat === "excel" ? (
                      <>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Exportar Excel
                      </>
                    ) : exportFormat === "csv" ? (
                      <>
                        <FileDown className="mr-2 h-4 w-4" />
                        Exportar CSV
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Generar HTML
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Info Card */}
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-black text-emerald-900 mb-1">Múltiples Formatos de Exportación</h3>
                <p className="text-sm text-emerald-700 font-medium">
                  Exporte sus reportes en HTML (para imprimir), Excel (para análisis) o CSV (para importar a otros sistemas).
                  Use "Vista Previa" para verificar los datos antes de generar el documento final.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase">
                Vista Previa: {selectedReport?.title}
              </DialogTitle>
              <DialogDescription>
                Revise los datos que se incluirán en el reporte antes de generarlo
              </DialogDescription>
            </DialogHeader>

            {previewLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
              </div>
            ) : selectedReport?.id === "budget-execution" && previewData.length > 0 ? (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="pt-6">
                      <p className="text-xs font-black uppercase text-emerald-600 mb-2">Total Asignado</p>
                      <p className="text-2xl font-black text-emerald-900">{formatCurrency(totalAsignado)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <p className="text-xs font-black uppercase text-blue-600 mb-2">Total Ejecutado</p>
                      <p className="text-2xl font-black text-blue-900">{formatCurrency(totalEjecutado)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="pt-6">
                      <p className="text-xs font-black uppercase text-purple-600 mb-2">Disponible</p>
                      <p className="text-2xl font-black text-purple-900">{formatCurrency(totalDisponible)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Table */}
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-black uppercase">Código</th>
                        <th className="px-4 py-3 text-left text-xs font-black uppercase">Partida</th>
                        <th className="px-4 py-3 text-left text-xs font-black uppercase">Centro</th>
                        <th className="px-4 py-3 text-right text-xs font-black uppercase">Asignado</th>
                        <th className="px-4 py-3 text-right text-xs font-black uppercase">Ejecutado</th>
                        <th className="px-4 py-3 text-right text-xs font-black uppercase">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {previewData.map((item) => {
                        const porcentaje = Number(item.montoAsignado) > 0
                          ? (Number(item.montoEjecutado) / Number(item.montoAsignado)) * 100
                          : 0
                        return (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono font-bold">{item.codigo}</td>
                            <td className="px-4 py-3 font-medium">{item.nombre}</td>
                            <td className="px-4 py-3 text-xs">{item.centroRegional}</td>
                            <td className="px-4 py-3 text-right font-bold">{formatCurrency(item.montoAsignado)}</td>
                            <td className="px-4 py-3 text-right font-bold text-blue-600">{formatCurrency(item.montoEjecutado)}</td>
                            <td className="px-4 py-3 text-right font-bold">{porcentaje.toFixed(1)}%</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleGenerateReport(selectedReport, "excel")}>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleGenerateReport(selectedReport, "csv")}>
                      <FileDown className="mr-2 h-4 w-4" />
                      CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleGenerateReport(selectedReport, "html")}>
                      <FileText className="mr-2 h-4 w-4" />
                      HTML
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500">Este reporte está en desarrollo</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  )
}
