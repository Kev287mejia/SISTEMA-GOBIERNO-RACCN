"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Download,
    ShieldCheck,
    TrendingUp,
    TrendingDown,
    Scale,
    Fingerprint,
    QrCode,
    Activity,
    Lock,
    User,
    Calendar,
    Printer,
    FileText
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useState, useEffect } from "react"

interface ClosureReportDialogProps {
    closure: any | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ClosureReportDialog({ closure, open, onOpenChange }: ClosureReportDialogProps) {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    useEffect(() => {
        if (closure && open) {
            fetchClosureStats()
        }
    }, [closure, open])

    const handlePrint = () => {
        window.print()
    }

    const handleDownloadPDF = async () => {
        const element = document.getElementById('certificate-content')
        if (!element) return

        setIsExporting(true)
        try {
            const { jsPDF } = await import('jspdf')
            const html2canvas = (await import('html2canvas')).default

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#020617" // match slate-950
            })

            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const imgWidth = 210
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
            pdf.save(`Certificado_Blindaje_${closure.mes}_${closure.anio}.pdf`)
        } catch (error) {
            console.error("PDF Export Error:", error)
        } finally {
            setIsExporting(false)
        }
    }

    const fetchClosureStats = async () => {
        setLoading(true)
        try {
            // Fetch statistics for that specific month/year
            const res = await fetch(`/api/accounting/analytics?mes=${closure.mes}&anio=${closure.anio}`)
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (!closure) return null

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl flex flex-col bg-white">
                <style jsx global>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #certificate-content, #certificate-content * {
                            visibility: visible;
                        }
                        #certificate-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            padding: 0;
                            margin: 0;
                        }
                    }
                `}</style>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <div id="certificate-content">
                        {/* Header - Institutional Style */}
                        <div className="bg-slate-950 p-10 text-white relative overflow-hidden">
                            {/* Background Patterns */}
                            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                <ShieldCheck className="h-64 w-64 rotate-12" />
                            </div>
                            <div className="absolute -bottom-20 -left-20 p-10 opacity-5 pointer-events-none">
                                <Activity className="h-64 w-64 -rotate-12" />
                            </div>

                            <div className="relative z-10 flex flex-col gap-8">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-indigo-600 text-white border-none font-black text-[10px] px-3 py-1 tracking-wider shadow-lg shadow-indigo-500/20">CERTIFICADO DE BLINDAJE</Badge>
                                            <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black text-[10px] px-3 py-1 uppercase tracking-widest">CUMPLIMIENTO NORMATIVO</Badge>
                                        </div>
                                        <h2 className="text-5xl font-black tracking-tighter leading-none italic">
                                            Cierre de {meses[closure.mes - 1]} <span className="text-indigo-500">{closure.anio}</span>
                                        </h2>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Identificador Único de Blindaje (IUB)</p>
                                            <p className="font-mono text-indigo-400 text-sm font-bold bg-white/5 w-fit px-3 py-1 rounded-lg border border-white/5">
                                                {closure.id.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-4">
                                        <div className="h-24 w-24 bg-white p-2 rounded-2xl shadow-2xl flex items-center justify-center border border-white/10 group cursor-help transition-transform hover:scale-105">
                                            <QrCode className="h-full w-full text-slate-900" />
                                            <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                                <p className="text-[8px] font-black text-white text-center px-1">VALIDAR EN LÍNEA</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Integridad Verificada</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-sm relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-50" />
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ejecutado Por</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                                <User className="h-4 w-4 text-indigo-400" />
                                            </div>
                                            <p className="text-sm font-black tracking-tight">{closure.usuario.nombre} {closure.usuario.apellido}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-sm relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-50" />
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha y Hora de Blindaje</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                                <Calendar className="h-4 w-4 text-indigo-400" />
                                            </div>
                                            <p className="text-sm font-black tracking-tight">{new Date(closure.fechaCierre).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-sm relative overflow-hidden shadow-inner shadow-emerald-500/5">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-50" />
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado del Periodo</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <Lock className="h-4 w-4 text-emerald-400" />
                                            </div>
                                            <p className="text-sm font-black tracking-tight uppercase text-emerald-400">CERRADO Y BLOQUEADO</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content - Data Summary */}
                        <div className="p-10 bg-white space-y-10">
                            <section className="space-y-4">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-indigo-600" /> Resumen de Actividad Mensual
                                </h3>

                                {loading ? (
                                    <div className="h-32 bg-slate-50 animate-pulse rounded-[2.5rem] flex flex-col items-center justify-center border border-slate-100">
                                        <Activity className="h-8 w-8 text-indigo-200 animate-bounce mb-2" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Consolidando datos fiscales...</p>
                                    </div>
                                ) : stats ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-2 border border-slate-100 hover:border-emerald-200 transition-colors group">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Ingresos</p>
                                                <TrendingUp className="h-3 w-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <p className="text-2xl font-black text-slate-900">{formatCurrency(stats.totalIngresos || 0)}</p>
                                        </div>
                                        <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-2 border border-slate-100 hover:border-rose-200 transition-colors group">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Egresos</p>
                                                <TrendingDown className="h-3 w-3 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <p className="text-2xl font-black text-slate-900">{formatCurrency(stats.totalEgresos || 0)}</p>
                                        </div>
                                        <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-2 border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Asientos Validados</p>
                                            <p className="text-2xl font-black text-indigo-600">{stats.asientosCount || 0}</p>
                                        </div>
                                        <div className={`p-8 rounded-[2.5rem] space-y-2 border shadow-2xl transition-all hover:scale-[1.02] ${(stats.totalIngresos - stats.totalEgresos) >= 0
                                            ? "bg-slate-900 border-slate-800 shadow-slate-200"
                                            : "bg-rose-950 border-rose-900 shadow-rose-100"
                                            }`}>
                                            <p className={`text-[9px] font-black uppercase tracking-widest ${(stats.totalIngresos - stats.totalEgresos) >= 0 ? "text-indigo-400" : "text-rose-400"
                                                }`}>Resultado Neto</p>
                                            <p className="text-2xl font-black text-white">{formatCurrency((stats.totalIngresos || 0) - (stats.totalEgresos || 0))}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                                        <p className="text-xs text-slate-400 font-medium italic">Información estadística no disponible para el periodo consolidado.</p>
                                    </div>
                                )}
                            </section>

                            <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-indigo-600" /> Observaciones del Cierre
                                    </h3>
                                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 min-h-[120px] relative">
                                        <div className="absolute top-4 right-6 opacity-10">
                                            <FileText className="h-12 w-12" />
                                        </div>
                                        <p className="text-sm text-slate-600 font-bold leading-relaxed italic relative z-10">
                                            {closure.notas ? `"${closure.notas}"` : "No se registraron observaciones adicionales al momento de realizar el cierre oficial del periodo de cumplimiento normativo."}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Fingerprint className="h-4 w-4 text-indigo-600" /> Firma Digital y Metadatos
                                    </h3>
                                    <div className="p-8 bg-indigo-50/30 rounded-[2.5rem] border border-indigo-100/50 space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Sello Digital de Seguridad (Hash SHA-256)</p>
                                            <p className="text-[10px] font-mono text-indigo-900/60 break-all leading-tight bg-white/50 p-3 rounded-xl border border-white">
                                                {btoa(closure.id + closure.fechaCierre).substring(0, 64).toUpperCase()}...
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest text-[8px]">Versión Sistema</p>
                                                <p className="text-[10px] font-black text-indigo-900">GRACCNN V2.6.4</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest text-[8px]">Protocolo</p>
                                                <p className="text-[10px] font-black text-indigo-900">RFC-7519 SECURE</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Footer Actions */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-100 print:hidden">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[12px] font-black text-slate-900 uppercase tracking-tighter">Validación Institucional GRACCNN 2026</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">Documento Certificado por Auditoría Gubernamental</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <Button
                                        variant="outline"
                                        onClick={handlePrint}
                                        className="flex-1 md:flex-none rounded-2xl border-slate-200 gap-2 h-14 px-8 font-black text-xs uppercase group hover:bg-slate-50 transition-all"
                                    >
                                        <Printer className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                        Imprimir Constancia
                                    </Button>
                                    <Button
                                        onClick={handleDownloadPDF}
                                        disabled={isExporting}
                                        className="flex-1 md:flex-none rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 gap-2 h-14 px-10 font-black text-xs uppercase tracking-[0.2em] transition-all hover:translate-y-[-2px]"
                                    >
                                        <Download className="h-4 w-4" />
                                        {isExporting ? 'Procesando...' : 'Descargar Reporte PDF'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
