"use client"

export const dynamic = "force-dynamic";
import { useState } from "react"
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
    FileText,
    Download,
    BarChart3,
    TrendingUp,
    PieChart,
    Calendar,
    Loader2,
    CheckCircle2,
    Eye,
    Building2,
    ArrowRight
} from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

import { exportToPDF } from "@/lib/pdf-export"
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LineChart,
    Line,
    Cell,
    PieChart as RechartsPieChart,
    Pie
} from "recharts"

export default function BudgetReportsPage() {
    const [generating, setGenerating] = useState<string | null>(null)
    const [reportData, setReportData] = useState<any>(null)
    const [selectedReport, setSelectedReport] = useState<any>(null)
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        region: "all"
    })

    const reports = [
        {
            id: "execution-cc",
            title: "Ejecución por Centro de Costo",
            description: "Distribución del gasto real agrupado por unidades operativas y departamentos.",
            icon: Building2,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
            endpoint: "/api/budget/reports/cost-center"
        },
        // ... (others stay same)
        {
            id: "budget-summary",
            title: "Resumen de Partidas SNIP",
            description: "Estado consolidado de proyectos de inversión y gastos de funcionamiento.",
            icon: BarChart3,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            endpoint: "/api/budget/items"
        },
        {
            id: "monthly-trend",
            title: "Tendencia de Gasto Mensual",
            description: "Análisis comparativo de la ejecución presupuestaria a lo largo del año fiscal.",
            icon: TrendingUp,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            endpoint: "/api/budget/analytics"
        }
    ]

    const handleGenerate = async (report: any) => {
        setGenerating(report.id)
        setReportData(null)
        try {
            const query = new URLSearchParams({
                startDate: filters.startDate,
                endDate: filters.endDate,
                centroRegional: filters.region
            }).toString()

            const res = await fetch(`${report.endpoint}?${query}`)
            if (res.ok) {
                const json = await res.json()
                const data = json.data || json // Handle different API response formats
                setReportData(data)
                setSelectedReport(report)
                toast.success(`Reporte "${report.title}" generado correctamente`)

                // Scroll to result
                setTimeout(() => {
                    document.getElementById('report-result')?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
            } else {
                toast.error("Error al generar el reporte")
            }
        } catch (error) {
            toast.error("Error de conexión")
        } finally {
            setGenerating(null)
        }
    }

    const handleExportPDF = async () => {
        if (!selectedReport) return
        const filename = `${selectedReport.id}_${filters.region}_${new Date().toISOString().split('T')[0]}`
        await exportToPDF("budget-report-pdf-content", filename)
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-12 rounded-[3rem] shadow-2xl border border-white/5">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                        <BarChart3 className="h-64 w-64 text-white rotate-12" />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Inteligencia Financiera</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter">Reportería <span className="text-indigo-400">Presupuestaria</span></h1>
                        <p className="text-indigo-100/60 font-medium max-w-xl text-lg">Análisis avanzado de la ejecución fiscal regional del GRACCNN.</p>
                    </div>
                </div>

                {/* Global Filters */}
                <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b p-8">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Parámetros de Análisis</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Fecha de Inicio</Label>
                                <Input
                                    type="date"
                                    className="h-14 rounded-2xl bg-slate-50 border-none font-bold focus:ring-indigo-500"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Fecha de Corte</Label>
                                <Input
                                    type="date"
                                    className="h-14 rounded-2xl bg-slate-50 border-none font-bold focus:ring-indigo-500"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Enfoque Regional</Label>
                                <Select value={filters.region} onValueChange={(v) => setFilters({ ...filters, region: v })}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                        <SelectItem value="all">Consolidado Regional</SelectItem>
                                        <SelectItem value="BILWI">Bilwi</SelectItem>
                                        <SelectItem value="WASPAM">Waspam</SelectItem>
                                        <SelectItem value="ROSITA">Rosita</SelectItem>
                                        <SelectItem value="SIUNA">Siuna</SelectItem>
                                        <SelectItem value="BONANZA">Bonanza</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Report Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reports.map((report) => (
                        <Card key={report.id} className="group border-none shadow-xl rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                            <div className={`h-2 ${report.bgColor}`} />
                            <CardHeader className="p-8 pb-4">
                                <div className={`h-16 w-16 ${report.bgColor} ${report.color} rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                                    <report.icon className="h-8 w-8" />
                                </div>
                                <CardTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">{report.title}</CardTitle>
                                <CardDescription className="text-slate-500 font-medium mt-2 leading-relaxed">{report.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-4">
                                <Button
                                    className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-100 text-white font-black uppercase tracking-widest text-[10px] gap-3 shadow-lg transition-all"
                                    onClick={() => handleGenerate(report)}
                                    disabled={generating === report.id}
                                >
                                    {generating === report.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                                    {generating === report.id ? "Generando..." : "Generar Reporte"}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Report Result Section */}
                {(reportData || generating) && (
                    <div id="report-result" className="scroll-mt-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
                            <CardHeader className="p-10 border-b flex flex-row items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-2">Vista Previa del Reporte</p>
                                    <CardTitle className="text-3xl font-black text-slate-900 uppercase">{selectedReport?.title || "Generando..."}</CardTitle>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Corte al {new Date(filters.endDate).toLocaleDateString()}</p>
                                </div>
                                {reportData && (
                                    <Button
                                        onClick={handleExportPDF}
                                        className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl shadow-indigo-200"
                                    >
                                        <Download className="h-5 w-5" /> Descargar PDF Oficial
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                {generating ? (
                                    <div className="py-40 flex flex-col items-center justify-center gap-6">
                                        <Loader2 className="h-16 w-16 animate-spin text-indigo-100" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] animate-pulse">Consultando Base de Datos Fiscal...</p>
                                    </div>
                                ) : (
                                    <div id="budget-report-pdf-content" className="p-10 bg-white">
                                        {/* Hidden Institutional Header for PDF */}
                                        <div className="hidden print:block mb-10 border-b-2 border-slate-900 pb-8 text-center md:text-left">
                                            <h2 className="text-2xl font-black uppercase tracking-tighter">Gobierno Regional Autónomo de la Costa Caribe Norte</h2>
                                            <h3 className="text-lg font-bold text-slate-700 uppercase">Reporte: {selectedReport?.title}</h3>
                                            <div className="flex justify-between items-center mt-6 text-[10px] font-black uppercase text-slate-500">
                                                <span>Región: {filters.region === 'all' ? 'CONSOLIDADO REGIONAL' : filters.region}</span>
                                                <span>Periodo: {filters.startDate} al {filters.endDate}</span>
                                                <span>Fecha Emisión: {new Date().toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {selectedReport?.id === "execution-cc" && (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-900 text-white">
                                                            <th className="p-4 text-left font-black uppercase tracking-widest text-[10px] rounded-tl-2xl">Unidad Operativa / Centro de Costo</th>
                                                            <th className="p-4 text-right font-black uppercase tracking-widest text-[10px]">Total Ejecutado</th>
                                                            <th className="p-4 text-right font-black uppercase tracking-widest text-[10px] rounded-tr-2xl">Participación %</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 border-x border-b rounded-b-2xl overflow-hidden">
                                                        {reportData.map((cc: any, idx: number) => {
                                                            const totalRegion = reportData.reduce((sum: number, item: any) => sum + item.totalEjecutado, 0)
                                                            return (
                                                                <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                                                                    <td className="p-5">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                                                            <span className="font-black text-slate-800 uppercase text-xs">{cc.centroCosto.replace('_', ' ')}</span>
                                                                        </div>
                                                                        <div className="ml-5 mt-2 space-y-1">
                                                                            {cc.items.map((item: any, i: number) => (
                                                                                <div key={i} className="flex justify-between text-[10px] text-slate-500 font-medium">
                                                                                    <span>{item.codigo} - {item.nombre}</span>
                                                                                    <span className="font-bold">{formatCurrency(item.ejecutado)}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-5 text-right font-black text-slate-900">{formatCurrency(cc.totalEjecutado)}</td>
                                                                    <td className="p-5 text-right">
                                                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-black text-[10px]">
                                                                            {totalRegion > 0 ? ((cc.totalEjecutado / totalRegion) * 100).toFixed(1) : 0}%
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                        <tr className="bg-slate-50">
                                                            <td className="p-5 font-black uppercase text-slate-900">Total Consolidado</td>
                                                            <td className="p-5 text-right font-black text-indigo-600 text-lg">
                                                                {formatCurrency(reportData.reduce((sum: number, item: any) => sum + item.totalEjecutado, 0))}
                                                            </td>
                                                            <td className="p-5 text-right font-black">100%</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {selectedReport?.id === "monthly-trend" && (
                                            <div className="space-y-10">
                                                <div className="h-[400px] w-full bg-slate-50/30 rounded-[2rem] p-6 border border-slate-100">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={reportData.trendData || []}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                            <XAxis
                                                                dataKey="name"
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                                                            />
                                                            <YAxis
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                                                                tickFormatter={(value) => `C$${value / 1000}k`}
                                                            />
                                                            <Tooltip
                                                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                                                formatter={(value: any) => [formatCurrency(value), "Ejecutado"]}
                                                            />
                                                            <Bar dataKey="gasto" radius={[6, 6, 0, 0]}>
                                                                {(reportData.trendData || []).map((entry: any, index: number) => (
                                                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="bg-indigo-900 rounded-[2rem] p-8 text-white">
                                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Mes de Mayor Ejecución</p>
                                                        {(() => {
                                                            const maxMonth = [...(reportData.trendData || [])].sort((a, b) => b.gasto - a.gasto)[0]
                                                            return (
                                                                <>
                                                                    <h4 className="text-4xl font-black">{maxMonth?.name || "N/A"}</h4>
                                                                    <p className="text-indigo-200 mt-2 font-bold">{formatCurrency(maxMonth?.gasto || 0)} emitidos</p>
                                                                </>
                                                            )
                                                        })()}
                                                    </div>
                                                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
                                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Promedio Mensual</p>
                                                        <h4 className="text-4xl font-black">
                                                            {formatCurrency((reportData.trendData || []).reduce((a: any, b: any) => a + b.gasto, 0) / 12)}
                                                        </h4>
                                                        <p className="text-slate-400 mt-2 font-bold">Rendimiento fiscal proyectado</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedReport?.id === "budget-summary" && (
                                            <div className="space-y-8">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Partidas</p>
                                                        <p className="text-2xl font-black text-slate-900">{(reportData.data || reportData).length}</p>
                                                    </div>
                                                    {/* Additional stats... */}
                                                </div>
                                                <div className="overflow-hidden rounded-2xl border border-slate-100">
                                                    <table className="w-full text-xs text-left">
                                                        <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest">
                                                            <tr>
                                                                <th className="p-4">Código / Nombre</th>
                                                                <th className="p-4 text-right">Asignado</th>
                                                                <th className="p-4 text-right">Ejecutado</th>
                                                                <th className="p-4 text-right">Disponible</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-50">
                                                            {(reportData.data || reportData).map((item: any) => (
                                                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                                    <td className="p-4">
                                                                        <p className="font-bold text-slate-900">{item.codigo}</p>
                                                                        <p className="text-slate-500">{item.nombre}</p>
                                                                    </td>
                                                                    <td className="p-4 text-right font-bold text-slate-600">{formatCurrency(item.montoAsignado)}</td>
                                                                    <td className="p-4 text-right font-bold text-indigo-600">{formatCurrency(item.montoEjecutado)}</td>
                                                                    <td className="p-4 text-right font-black text-emerald-600">{formatCurrency(item.montoAsignado - item.montoEjecutado)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Signature lines for the PDF */}
                                        <div className="hidden print:grid grid-cols-2 gap-20 mt-32 px-10">
                                            <div className="border-t-2 border-slate-900 pt-6 text-center">
                                                <p className="text-sm font-black uppercase">Responsable Presupuesto</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Lic. Yahira Tucker Medina</p>
                                            </div>
                                            <div className="border-t-2 border-slate-900 pt-6 text-center">
                                                <p className="text-sm font-black uppercase">Firma y Sello DAF</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Control de Fiscalización Regional</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Premium Footer Info */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5">
                    <div className="flex items-center gap-6">
                        <div className="h-14 w-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                            <CheckCircle2 className="h-7 w-7 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Datos Certificados</h3>
                            <p className="text-slate-400 text-sm font-medium">Todos los reportes cumplen con la normativa fiscal vigente de la región.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="h-14 px-8 rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10 font-black uppercase text-[10px] tracking-widest">
                        Manual de Procedimientos
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    )
}
