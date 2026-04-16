"use client"

export const dynamic = "force-dynamic";
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    FileBarChart,
    Printer,
    Download,
    TrendingUp,
    TrendingDown,
    Scale,
    PieChart,
    ArrowUpRight,
    ArrowDownLeft,
    Building2,
    Calendar,
    Loader2,
    Filter,
    ArrowRight,
    Target,
    Activity,
    AlertCircle,
    CheckCircle2
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { exportToPDF } from "@/lib/pdf-export"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReportesContablesPage() {
    const [compData, setCompData] = useState<any>(null)
    const [budgetData, setBudgetData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isExporting, setIsExporting] = useState(false)

    const [mes, setMes] = useState((new Date().getMonth() + 1).toString())
    const [anio, setAnio] = useState(new Date().getFullYear().toString())

    const meses = [
        { v: "1", l: "Enero" }, { v: "2", l: "Febrero" }, { v: "3", l: "Marzo" },
        { v: "4", l: "Abril" }, { v: "5", l: "Mayo" }, { v: "6", l: "Junio" },
        { v: "7", l: "Julio" }, { v: "8", l: "Agosto" }, { v: "9", l: "Septiembre" },
        { v: "10", l: "Octubre" }, { v: "11", l: "Noviembre" }, { v: "12", l: "Diciembre" }
    ]

    useEffect(() => {
        fetchData()
    }, [mes, anio])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [compRes, budgetRes] = await Promise.all([
                fetch(`/api/accounting/reports/comparative?mes=${mes}&anio=${anio}`, { cache: 'no-store' }),
                fetch(`/api/accounting/reports/budget-execution?anio=${anio}`, { cache: 'no-store' })
            ])
            const compJson = await compRes.json()
            const budgetJson = await budgetRes.json()
            console.log("FE_DEBUG - CompData:", compJson)
            setCompData(compJson)
            setBudgetData(budgetJson)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadPDF = async () => {
        setIsExporting(true)
        const filename = `EEFF_SENIOR_${anio}_${mes}`
        await exportToPDF("financial-report-content", filename)
        setIsExporting(false)
    }

    if (loading && !compData) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-10 w-10 animate-spin border-4 border-indigo-600 border-t-transparent rounded-full" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Generando Estados Financieros Senior...</p>
            </div>
        </DashboardLayout>
    )

    const current = compData?.current || {}
    const previous = compData?.previous || {}

    const utilAnterior = (previous.ingresos?.balance || 0) - (previous.gastos?.balance || 0)
    const utilActual = (current.ingresos?.balance || 0) - (current.gastos?.balance || 0)
    const utilVariacion = utilAnterior !== 0 ? ((utilActual - utilAnterior) / Math.abs(utilAnterior)) * 100 : 0

    // Asset comparison
    const activosActual = current.activos?.balance || 0
    const activosAnterior = previous.activos?.balance || 0
    const activosVariacion = activosAnterior !== 0 ? ((activosActual - activosAnterior) / activosAnterior) * 100 : 0

    return (
        <DashboardLayout>
            <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                        <Scale className="h-48 w-48 rotate-12" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <Scale className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
                                    Inteligencia Financiera <span className="text-indigo-600 italic">Senior</span>
                                </h1>
                                <p className="text-slate-500 font-bold text-sm flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Reportes Dinámicos y Ejecución Presupuestaria Real
                                </p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-2 rounded-2xl w-fit">
                            <div className="flex items-center gap-2 px-3 border-r border-slate-200">
                                <Filter className="h-4 w-4 text-slate-400" />
                                <span className="text-[10px] font-black uppercase text-slate-400">Filtros</span>
                            </div>
                            <Select value={mes} onValueChange={setMes}>
                                <SelectTrigger className="w-[160px] h-10 rounded-xl border-none bg-transparent font-bold text-sm focus:ring-0">
                                    <SelectValue placeholder="Mes" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-2xl">
                                    {meses.map(m => (
                                        <SelectItem key={m.v} value={m.v} className="rounded-lg font-bold">{m.l}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={anio} onValueChange={setAnio}>
                                <SelectTrigger className="w-[120px] h-10 rounded-xl border-none bg-transparent font-bold text-sm focus:ring-0">
                                    <SelectValue placeholder="Año" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-2xl">
                                    {["2024", "2025", "2026"].map(a => (
                                        <SelectItem key={a} value={a} className="rounded-lg font-bold">{a}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="outline" className="gap-2 rounded-2xl h-14 px-8 border-slate-200 shadow-sm font-black uppercase text-xs hover:bg-slate-50 transition-all" onClick={() => window.print()}>
                            <Printer className="h-5 w-5" /> Imprimir
                        </Button>
                        <Button
                            className="gap-2 rounded-2xl h-14 px-8 bg-slate-900 text-white shadow-xl shadow-slate-200 font-black uppercase text-xs hover:scale-105 transition-all"
                            onClick={handleDownloadPDF}
                            disabled={isExporting}
                        >
                            {isExporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                            {isExporting ? "Generando..." : "Descargar Reporte Senior"}
                        </Button>
                    </div>
                </div>

                {/* KPI Section with Comparisons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-none shadow-xl bg-indigo-600 text-white overflow-hidden rounded-[2rem] relative group">
                        <div className="absolute -bottom-6 -right-6 p-4 opacity-10 rotate-12 transition-transform group-hover:scale-125">
                            <TrendingUp className="h-32 w-32" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Patrimonio Neto Mes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">{formatCurrency(current.patrimonio?.balance || 0)}</div>
                            <div className="flex items-center gap-2 mt-3">
                                <Badge className="bg-white/10 text-white border-none font-bold text-[10px] py-1">Vs. Mes Ant: {formatCurrency(previous.patrimonio?.balance || 0)}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem] group border border-slate-50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Resultado Operativo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-black ${utilActual >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                                {formatCurrency(utilActual)}
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <div className={`flex items-center gap-1 font-black text-xs ${utilVariacion >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {utilVariacion >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                                    {Math.abs(utilVariacion).toFixed(1)}% de variación
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">respecto al cierre anterior</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem] group border border-slate-50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Total activos consolidados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900">
                                {formatCurrency(activosActual)}
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <div className={`flex items-center gap-1 font-black text-xs ${activosVariacion >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {activosVariacion >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                                    {Math.abs(activosVariacion).toFixed(1)}%
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Crecimiento de capital</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden rounded-[2rem] group border border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ratio de Solvencia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-white">
                                {current.pasivos?.balance > 0 ? (activosActual / current.pasivos.balance).toFixed(2) : "∞"}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-tighter flex items-center gap-2">
                                <AlertCircle className="h-3.5 w-3.5 text-amber-500" /> Índice de cobertura pasiva
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div id="financial-report-content" className="space-y-8 bg-transparent">
                    <Tabs defaultValue="balance" className="space-y-8">
                        <TabsList className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm h-18 flex justify-start gap-2 w-fit">
                            <TabsTrigger value="balance" className="rounded-[1.5rem] px-10 h-14 font-black uppercase tracking-widest text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">Balance Comparativo</TabsTrigger>
                            <TabsTrigger value="pyl" className="rounded-[1.5rem] px-10 h-14 font-black uppercase tracking-widest text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">P&L Senior (Resultados)</TabsTrigger>
                            <TabsTrigger value="budget" className="rounded-[1.5rem] px-10 h-14 font-black uppercase tracking-widest text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all flex items-center gap-2">
                                <Target className="h-4 w-4" /> Ejecución Presupuestaria Real
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="balance" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* Activos Comparativos */}
                                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white border border-slate-50">
                                    <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                                        <div className="space-y-1">
                                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Activos Totales</CardTitle>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Estado comparativo mensual</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black">{formatCurrency(activosActual)}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">Período Actual</div>
                                        </div>
                                    </div>
                                    <CardContent className="p-0 overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[800px]">
                                            <thead>
                                                <tr className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b">
                                                    <th className="px-6 py-4">Cuenta / Rubro</th>
                                                    <th className="px-6 py-4 text-right">Actual</th>
                                                    <th className="px-6 py-4 text-right">Anterior</th>
                                                    <th className="px-6 py-4 text-right">Variación</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {Object.keys({ ...current.activos?.subcategories, ...previous.activos?.subcategories }).sort().map(key => {
                                                    const valAct = current.activos?.subcategories[key] || 0
                                                    const valAnt = previous.activos?.subcategories[key] || 0
                                                    const variacion = valAnt !== 0 ? ((valAct - valAnt) / Math.abs(valAnt)) * 100 : (valAct !== 0 ? 100 : 0)
                                                    return (
                                                        <tr key={key} className="hover:bg-slate-50/50 transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-[10px] ${valAct >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                                        {key}
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">Gestión Activos Consolidada</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right font-black text-slate-900 text-sm">{formatCurrency(valAct)}</td>
                                                            <td className="px-6 py-4 text-right font-bold text-slate-400 text-sm">{formatCurrency(valAnt)}</td>
                                                            <td className={`px-6 py-4 text-right font-black text-xs ${variacion >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                                <div className="flex items-center justify-end gap-1 bg-slate-50 px-3 py-1.5 rounded-full inline-flex">
                                                                    {variacion >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                                    {Math.abs(variacion).toFixed(1)}%
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>

                                {/* Pasivos y Patrimonio Comparativos */}
                                <div className="space-y-8">
                                    <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white border border-slate-50">
                                        <CardHeader className="bg-rose-50/50 p-6 border-b border-rose-100 flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle className="text-[10px] font-black uppercase text-rose-700 tracking-[0.2em]">Pasivos Proyectados</CardTitle>
                                                <p className="text-[9px] text-rose-400 font-bold uppercase mt-1">Obligaciones y Deudas</p>
                                            </div>
                                            <Badge className="bg-rose-600 text-white border-none px-4 py-1 rounded-full text-xs font-black shadow-lg shadow-rose-100">{formatCurrency(current.pasivos?.balance || 0)}</Badge>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="divide-y divide-slate-50">
                                                {Object.keys({ ...current.pasivos?.subcategories, ...previous.pasivos?.subcategories }).map(key => {
                                                    const valAct = current.pasivos?.subcategories[key] || 0
                                                    const valAnt = previous.pasivos?.subcategories[key] || 0
                                                    return (
                                                        <div key={key} className="px-8 py-5 flex justify-between items-center group hover:bg-slate-50 transition-all">
                                                            <div className="space-y-1">
                                                                <p className="text-xs font-black text-slate-700 uppercase tracking-tighter">{key}</p>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Valor Anterior: {formatCurrency(valAnt)}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm font-black text-slate-900">{formatCurrency(valAct)}</div>
                                                                <div className={`text-[10px] font-black ${valAct >= valAnt ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                                    {valAct >= valAnt ? '+' : '-'}{Math.abs(((valAct - valAnt) || 0)).toFixed(0)} var.
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white border border-slate-50">
                                        <CardHeader className="bg-slate-900 p-6 border-b border-slate-800 flex flex-row items-center justify-between text-white">
                                            <div>
                                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Patrimonio Público</CardTitle>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Consolidado Institucional</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-black">{formatCurrency(current.patrimonio?.balance || 0)}</div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="divide-y divide-slate-50">
                                                {Object.keys({ ...current.patrimonio?.subcategories, ...previous.patrimonio?.subcategories }).map(key => (
                                                    <div key={key} className="px-8 py-5 flex justify-between items-center hover:bg-slate-50 transition-all cursor-default">
                                                        <span className="text-xs font-black text-slate-700 uppercase">{key}</span>
                                                        <span className="text-sm font-black text-indigo-600">{formatCurrency(current.patrimonio?.subcategories[key] || 0)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="pyl" className="animate-in fade-in zoom-in-95 duration-500">
                            <Card className="border-none shadow-3xl rounded-[3rem] overflow-hidden w-full bg-white border border-slate-50">
                                <CardHeader className="bg-slate-900 text-white p-12 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                        <Activity className="h-64 w-64 rotate-12" />
                                    </div>
                                    <div className="relative z-10 text-center space-y-4">
                                        <h3 className="text-xs font-black upperCase tracking-widest text-indigo-400">Estado de Rendimiento Financiero</h3>
                                        <p className="text-2xl font-black tracking-tighter">Resumen de Gestión {meses.find(m => m.v === mes)?.l} {anio}</p>
                                        <div className="flex justify-center gap-4">
                                            <Badge className="bg-white/10 text-white border-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase">Consolidado Regional</Badge>
                                            <Badge className="bg-indigo-500 text-white border-none px-4 py-1 rounded-full text-[10px] font-black uppercase italic">Validación Senior v3.2</Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-12 space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black uppercase text-slate-400 border-b-2 border-slate-50 pb-3 flex items-center justify-between">
                                                <span>Ingresos Operativos</span>
                                                <span className="text-emerald-500"><TrendingUp className="h-4 w-4" /></span>
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end border-b border-dashed border-slate-100 pb-4">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-black text-slate-900 uppercase">Ingresos Totales del Mes</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">vs. Mes Anterior: {formatCurrency(previous.ingresos?.balance || 0)}</p>
                                                    </div>
                                                    <span className="text-xl font-black text-emerald-600">{formatCurrency(current.ingresos?.balance || 0)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black uppercase text-slate-400 border-b-2 border-slate-50 pb-3 flex items-center justify-between">
                                                <span>Egresos y Gastos</span>
                                                <span className="text-rose-500"><TrendingDown className="h-4 w-4" /></span>
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end border-b border-dashed border-slate-100 pb-4">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-black text-slate-900 uppercase">Gasto Corriente Consolidado</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">vs. Mes Anterior: {formatCurrency(previous.gastos?.balance || 0)}</p>
                                                    </div>
                                                    <span className="text-xl font-black text-rose-600">({formatCurrency(current.gastos?.balance || 0)})</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 relative group overflow-hidden">
                                        <div className={`absolute top-0 right-0 h-full w-2 ${utilActual >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                                            <div className="space-y-2">
                                                <span className={`text-[12px] font-black uppercase tracking-widest ${utilActual >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                                                    {utilActual >= 0 ? 'Resultado de Gestión Positivo' : 'Resultado de Gestión Negativo'}
                                                </span>
                                                <h4 className="text-5xl font-black text-slate-900 tracking-tighter">
                                                    {formatCurrency(utilActual)}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-black ${utilVariacion >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {utilVariacion >= 0 ? '▲' : '▼'} {Math.abs(utilVariacion).toFixed(1)}% de rendimiento relativo
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-center md:text-right space-y-4">
                                                <div className="h-16 w-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto md:ml-auto mb-2">
                                                    <Scale className={`h-8 w-8 ${utilActual >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase max-w-[200px] leading-relaxed">
                                                    Este resultado refleja el balance neto de operaciones liquidadas en el período {mes}/{anio}.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="bg-slate-900 p-8 text-center border-t border-slate-800">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Fin de Reporte Senior - División de Administración y Finanzas (DAF)</p>
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="budget" className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <Card className="lg:col-span-1 border-none shadow-2xl rounded-[2.5rem] bg-white border border-slate-50 p-8 space-y-8">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Resumen por Categoría</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Gasto Contable vs. Techo Presupuestario</p>
                                    </div>
                                    <div className="space-y-6">
                                        {budgetData?.summary?.map((cat: any) => {
                                            const pct = (cat.ejecutado / cat.asignado) * 100
                                            return (
                                                <div key={cat.categoria} className="space-y-3">
                                                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-tighter">
                                                        <span className="text-slate-600">{cat.categoria}</span>
                                                        <span className={pct > 90 ? 'text-rose-500' : 'text-indigo-600'}>{pct.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${pct > 90 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                                                            style={{ width: `${Math.min(pct, 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                                        <span>Ejec: {formatCurrency(cat.ejecutado)}</span>
                                                        <span>Presup: {formatCurrency(cat.asignado)}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </Card>

                                <Card className="lg:col-span-2 border-none shadow-2xl rounded-[2.5rem] bg-indigo-900 text-white p-10 relative overflow-hidden flex flex-col justify-center">
                                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                                        <Target className="h-64 w-64 rotate-12" />
                                    </div>
                                    <div className="relative z-10 space-y-6">
                                        <Badge className="bg-emerald-500 text-white border-none px-4 py-1 rounded-full text-[10px] font-black uppercase shadow-lg shadow-emerald-500/20">Ejecución en Tiempo Real</Badge>
                                        <h2 className="text-5xl font-black tracking-tighter leading-tight max-w-2xl">
                                            Control <span className="text-emerald-400">Presupuestario</span> basado en la Contabilidad General
                                        </h2>
                                        <p className="text-indigo-200 text-lg font-medium leading-relaxed max-w-xl">
                                            A diferencia de los reportes tradicionales, este módulo compara los <span className="text-white font-black underline">Asientos Contables Aprobados</span> directamente con las partidas presupuestarias.
                                        </p>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                                            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                                <p className="text-[10px] font-black uppercase text-indigo-300">Variación Promedio</p>
                                                <p className="text-2xl font-black text-white">
                                                    {(budgetData?.items?.reduce((acc: number, item: any) => acc + item.porcentaje, 0) / (budgetData?.items?.length || 1)).toFixed(1)}%
                                                </p>
                                            </div>
                                            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                                <p className="text-[10px] font-black uppercase text-indigo-300">Total Disponible</p>
                                                <p className="text-2xl font-black text-emerald-400">
                                                    {formatCurrency(budgetData?.summary?.reduce((acc: number, item: any) => acc + item.disponible, 0) || 0)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white border border-slate-50">
                                <div className="p-8 border-b flex justify-between items-center bg-slate-50">
                                    <div>
                                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900">Detalle de Ejecución por Partida</CardTitle>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Comparando Planificado vs. Contabilizado {anio}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Ok</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-rose-500 animation-pulse" />
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Sobre-ejecución</span>
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-0 overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[900px]">
                                        <thead>
                                            <tr className="bg-white text-[9px] font-black uppercase tracking-widest text-slate-400 border-b">
                                                <th className="px-6 py-4">Código / Renglón</th>
                                                <th className="px-6 py-4">Nombre de la Partida</th>
                                                <th className="px-6 py-4 text-right">Asignado Anual</th>
                                                <th className="px-6 py-4 text-right">Ejecutado (Caja)</th>
                                                <th className="px-6 py-4 text-right">Ejecutado (Cont.)</th>
                                                <th className="px-6 py-4 text-right">Disponible</th>
                                                <th className="px-6 py-4 text-center">% Ejec.</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {budgetData?.items?.map((item: any) => (
                                                <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                                                    <td className="px-6 py-3">
                                                        <Badge className="bg-slate-100 text-slate-700 font-black text-[10px] rounded-lg border-none tracking-tighter">{item.codigo}</Badge>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black text-slate-900 truncate max-w-[250px]">{item.nombre}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{item.categoria}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-right font-bold text-slate-600 text-xs">{formatCurrency(item.montoAsignado)}</td>
                                                    <td className="px-6 py-3 text-right font-bold text-slate-400 text-xs">{formatCurrency(item.montoEjecutadoSistema)}</td>
                                                    <td className="px-6 py-3 text-right font-black text-indigo-600 text-xs">{formatCurrency(item.montoEjecutadoReal)}</td>
                                                    <td className={`px-6 py-3 text-right font-black text-xs ${item.montoDisponible < 0 ? 'text-rose-600 font-black' : 'text-slate-900'}`}>{formatCurrency(item.montoDisponible)}</td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className={`text-[9px] font-black ${item.porcentaje > 95 ? 'text-rose-600' : 'text-indigo-600'}`}>{item.porcentaje.toFixed(1)}%</span>
                                                            <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-700 ${item.porcentaje > 95 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                                                    style={{ width: `${Math.min(item.porcentaje, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Footer Signature Section - Visible on Print/Export */}
                <div className="hidden print:grid grid-cols-3 gap-12 mt-20 pt-12 border-t border-slate-900 px-10 mb-20 text-center">
                    <div className="space-y-4">
                        <div className="h-20" />
                        <div className="border-t border-slate-900 pt-3">
                            <p className="text-[11px] font-black uppercase">Lic. Yahira Tucker Medina</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Responsable de Contabilidad - GRACCNN</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-20" />
                        <div className="border-t border-slate-900 pt-3">
                            <p className="text-[11px] font-black uppercase">Dirección de Administración y Finanzas</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Autorización Fiscal Nivel 3</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-20 flex items-center justify-center">
                            <ShieldCheck className="h-12 w-12 text-slate-200" />
                        </div>
                        <div className="border-t border-slate-900 pt-3">
                            <p className="text-[11px] font-black uppercase">Sello de Auditoría Gubernamental</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Certificación Electrónica - SHA256</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout >
    )
}
