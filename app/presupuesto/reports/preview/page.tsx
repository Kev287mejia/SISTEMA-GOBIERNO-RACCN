"use client"

export const dynamic = "force-dynamic"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Printer, ArrowLeft, FileBarChart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

function BudgetReportPreviewContent() {
    const searchParams = useSearchParams()
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const type = searchParams.get("type")
    const anio = searchParams.get("anio")

    useEffect(() => {
        const fetchData = async () => {
            const query = new URLSearchParams({ type: type || "", anio: anio || "" }).toString()
            const res = await fetch(`/api/budget/reports?${query}`)
            if (res.ok) {
                const json = await res.json()
                setData(json.data || [])
            }
            setLoading(false)
        }
        fetchData()
    }, [type, anio])

    const handlePrint = () => window.print()

    const getReportTitle = () => {
        if (type === 'execution-regional') return "INFORME DE EJECUCIÓN POR CENTRO REGIONAL"
        if (type === 'comparative') return "ANÁLISIS COMPARATIVO (ASIGNADO VS EJECUTADO)"
        if (type === 'debt-investment') return "ESTADO DE DEUDA - INVERSIÓN PÚBLICA (PIP)"
        return "INFORME PRESUPUESTARIO"
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Preparando reporte fiscal...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:bg-white print:p-0">
            <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden print:shadow-none print:rounded-none">
                {/* Header Controls */}
                <div className="flex items-center justify-between p-6 border-b bg-slate-900 text-white print:hidden">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                        </Button>
                        <h1 className="text-sm font-black uppercase tracking-widest border-l pl-4 border-slate-700">Sistema de Gestión Fiscal GRACCNN</h1>
                    </div>
                    <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 font-bold uppercase text-[10px] tracking-widest">
                        <Printer className="h-3.5 w-3.5 mr-2" /> Imprimir Documento Oficial
                    </Button>
                </div>

                {/* Report Content */}
                <div className="p-16 print:p-12">
                    <div className="flex justify-between items-start mb-12 border-b-4 border-slate-900 pb-10">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-slate-900 uppercase leading-tight">GOBIERNO REGIONAL AUTÓNOMO</h2>
                            <h3 className="text-xl font-bold text-emerald-800">COSTA CARIBE NORTE (GRACCNN)</h3>
                            <p className="text-xs font-black text-slate-500 mt-4 tracking-widest">DIRECCIÓN ADMINISTRATIVA FINANCIERA (DAF)</p>
                            <div className="mt-4 pt-2 border-t border-slate-200">
                                <span className="bg-slate-900 text-white px-3 py-1 text-[10px] font-black uppercase">{getReportTitle()}</span>
                            </div>
                        </div>
                        <div className="text-right space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block text-left">
                                <p className="text-[10px] font-black text-slate-400 uppercase">Ejercicio Fiscal</p>
                                <p className="text-lg font-black text-slate-800">{anio}</p>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase italic">Emitido por: Lic. Yahira Tucker Medina</p>
                        </div>
                    </div>

                    {/* Report Specific Table Content */}
                    <div className="min-h-[600px]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-black tracking-widest border-y-2 border-slate-900">
                                    <th className="p-4 text-left">Clasificador / Centro</th>
                                    <th className="p-4 text-left">Concepto del Gasto</th>
                                    <th className="p-4 text-right">Monto Asignado</th>
                                    <th className="p-4 text-right">Ejecución Real</th>
                                    <th className="p-4 text-right">Saldo Disponible</th>
                                    <th className="p-4 text-center">% Ejec.</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-medium text-slate-600">
                                {data.map((row: any, i: number) => {
                                    const asignado = row.montoAsignado || row._sum?.montoAsignado || 0
                                    const ejecutado = row.montoEjecutado || row._sum?.montoEjecutado || 0
                                    const disponible = row.montoDisponible || row._sum?.montoDisponible || 0
                                    const perc = asignado > 0 ? (ejecutado / asignado) * 100 : 0

                                    return (
                                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="p-4 font-bold text-slate-900 uppercase">
                                                {row.centroRegional || row.codigo}
                                            </td>
                                            <td className="p-4 capitalize truncate max-w-[250px]">
                                                {row.nombre || (row.tipoGasto === 'INVERSION' ? 'Gastos de Capital' : 'Gasto Corriente')}
                                            </td>
                                            <td className="p-4 text-right font-bold text-slate-800">{formatCurrency(asignado)}</td>
                                            <td className="p-4 text-right font-black text-blue-700">{formatCurrency(ejecutado)}</td>
                                            <td className="p-4 text-right font-black text-emerald-700">{formatCurrency(disponible)}</td>
                                            <td className="p-4 text-center font-black text-slate-800 bg-slate-50">{perc.toFixed(1)}%</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-900 text-white font-black text-[12px]">
                                    <td colSpan={2} className="p-5 text-right uppercase tracking-widest">Totales Consolidados:</td>
                                    <td className="p-5 text-right border-x border-slate-800 bg-slate-800">
                                        {formatCurrency(data.reduce((acc, x) => acc + Number(x.montoAsignado || x._sum?.montoAsignado || 0), 0))}
                                    </td>
                                    <td className="p-5 text-right border-x border-slate-800 bg-slate-800">
                                        {formatCurrency(data.reduce((acc, x) => acc + Number(x.montoEjecutado || x._sum?.montoEjecutado || 0), 0))}
                                    </td>
                                    <td className="p-5 text-right border-x border-slate-800 bg-emerald-700 text-white">
                                        {formatCurrency(data.reduce((acc, x) => acc + Number(x.montoDisponible || x._sum?.montoDisponible || 0), 0))}
                                    </td>
                                    <td className="p-5 text-center bg-slate-800">-</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* FIRMAS DE RESPONSABILIDAD */}
                    <div className="mt-32 grid grid-cols-3 gap-20">
                        <div className="border-t-2 border-slate-900 pt-6 flex flex-col items-center">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-10">Elaborado por:</p>
                            <p className="text-xs font-black uppercase text-slate-900">Lic. Yahira Tucker Medina</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Responsable de Presupuesto - DAF</p>
                        </div>
                        <div className="border-t-2 border-slate-900 pt-6 flex flex-col items-center">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-10">Revisado por:</p>
                            <p className="text-xs font-black uppercase text-slate-900">Contador General</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Gobierno Regional Autonómo</p>
                        </div>
                        <div className="border-t-2 border-slate-900 pt-6 flex flex-col items-center">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-10">Autorizado por:</p>
                            <p className="text-xs font-black uppercase text-slate-900">Directora DAF</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">GRACCNN - Sello Institucional</p>
                        </div>
                    </div>

                    <div className="mt-20 border-t pt-8">
                        <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">
                            <span>Sistema de Contabilidad Gubernamental - GRACCNN 2026</span>
                            <span>Hoja de Control Presupuestario No. {Math.floor(Math.random() * 10000)}</span>
                            <span>Documento Certificado para Auditoría Interna</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function BudgetReportPreview() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Cargando reporte fiscal...</p>
            </div>
        }>
            <BudgetReportPreviewContent />
        </Suspense>
    )
}
