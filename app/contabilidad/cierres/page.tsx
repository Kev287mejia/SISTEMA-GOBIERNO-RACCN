"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Lock,
    Unlock,
    Calendar,
    ShieldCheck,
    History,
    AlertCircle,
    Clock,
    User as UserIcon,
    CheckCircle2,
    CalendarDays
} from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { ClosureReportDialog } from "@/components/accounting/closure-report-dialog"

export default function CierresContablesPage() {
    const { data: session } = useSession()
    const [closures, setClosures] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Current month/year for selection
    const now = new Date()
    const [selectedMes, setSelectedMes] = useState(now.getMonth() + 1)
    const [selectedAnio, setSelectedAnio] = useState(now.getFullYear())

    // Closure details dialog
    const [viewClosure, setViewClosure] = useState<any | null>(null)

    useEffect(() => {
        fetchClosures()
    }, [])

    const fetchClosures = async () => {
        try {
            const res = await fetch("/api/accounting/closures")
            if (res.ok) {
                const data = await res.json()
                setClosures(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleClosePeriod = async () => {
        const monthName = new Date(selectedAnio, selectedMes - 1).toLocaleString('es-NI', { month: 'long' })

        if (!confirm(`¿Está seguro que desea CERRAR el periodo de ${monthName} ${selectedAnio}? Una vez cerrado, no se podrán crear o modificar asientos en este periodo.`)) {
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch("/api/accounting/closures", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mes: selectedMes, anio: selectedAnio })
            })

            if (res.ok) {
                toast.success(`Periodo ${monthName} ${selectedAnio} cerrado exitosamente.`)
                fetchClosures()
            } else {
                const err = await res.json()
                const details = err.details ? `: ${err.details}` : ""
                toast.error(`${err.error || "Error al cerrar periodo"}${details}`, {
                    duration: 5000,
                    description: err.code ? `Código de sistema: ${err.code}` : undefined
                })
            }
        } catch (error) {
            toast.error("Error de conexión")
        } finally {
            setIsSubmitting(false)
        }
    }

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    const totalCerrados = closures.length

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Lock className="h-8 w-8 text-indigo-600" />
                            Cierre de Periodos
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Blindaje de estados financieros y bloqueo de modificaciones retroactivas
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <ShieldCheck className="h-4 w-4 text-indigo-600" />
                        <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">{totalCerrados} Periodos Blindados</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Form Side */}
                    <Card className="md:col-span-1 border-none shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-slate-900 text-white">
                        <CardHeader className="border-b border-white/10 pb-6">
                            <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-indigo-400" /> Nuevo Cierre
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-xs font-medium">
                                Seleccione el mes para el bloqueo oficial
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Mes Contable</label>
                                    <select
                                        className="w-full bg-slate-800 border-none rounded-xl h-12 px-4 font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={selectedMes}
                                        onChange={(e) => setSelectedMes(parseInt(e.target.value))}
                                    >
                                        {meses.map((m, i) => (
                                            <option key={m} value={i + 1}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Año Fiscal</label>
                                    <select
                                        className="w-full bg-slate-800 border-none rounded-xl h-12 px-4 font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={selectedAnio}
                                        onChange={(e) => setSelectedAnio(parseInt(e.target.value))}
                                    >
                                        {[2024, 2025, 2026].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 space-y-2">
                                <div className="flex items-center gap-2 text-amber-400">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase">Advertencia Senior</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                    El cierre de periodo es **irreversible** desde el panel estándar. Requiere intervención de Base de Datos para desbloquear.
                                </p>
                            </div>

                            <Button
                                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs group"
                                onClick={handleClosePeriod}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Procesando..." : (
                                    <>
                                        Ejecutar Cierre Oficial
                                        <Lock className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* List Side */}
                    <div className="md:col-span-2 space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                            <History className="h-4 w-4" /> Historial de Blindajes Contables
                        </h3>

                        {loading ? (
                            <div className="p-20 text-center animate-pulse">
                                <Clock className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Consultando bloqueos...</p>
                            </div>
                        ) : closures.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] p-16 text-center space-y-4">
                                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                    <Unlock className="h-10 w-10 text-slate-300" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-900">No hay periodos cerrados</h4>
                                    <p className="text-slate-400 text-sm font-medium">La contabilidad se encuentra abierta para todos los meses registrados.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {closures.map((c) => (
                                    <Card key={c.id} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden group">
                                        <CardContent className="p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-2xl flex flex-col items-center justify-center border border-emerald-100">
                                                    <span className="text-[10px] font-black uppercase leading-tight">{meses[c.mes - 1].substring(0, 3)}</span>
                                                    <span className="text-xl font-black">{c.anio}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-lg font-black text-slate-900">{meses[c.mes - 1]} {c.anio}</h4>
                                                        <Badge className="bg-emerald-500 text-white border-none font-black text-[9px] px-2 py-0.5 shadow-sm shadow-emerald-100">BLINDADO</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        <span className="flex items-center gap-1.5 border-r pr-4">
                                                            <UserIcon className="h-3 w-3 text-indigo-400" />
                                                            {c.usuario.nombre} {c.usuario.apellido}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                                            Cerrado el {new Date(c.fechaCierre).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-slate-400 hover:text-indigo-600 font-bold uppercase text-[9px]"
                                                    onClick={() => setViewClosure(c)}
                                                >
                                                    Ver Reporte
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ClosureReportDialog
                closure={viewClosure}
                open={!!viewClosure}
                onOpenChange={(open) => !open && setViewClosure(null)}
            />
        </DashboardLayout>
    )
}
