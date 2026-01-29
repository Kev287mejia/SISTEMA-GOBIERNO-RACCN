"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import {
    BarChart3,
    Calendar,
    User,
    Target,
    TrendingUp,
    AlertCircle,
    FileText,
    Clock,
    CheckCircle2,
    PieChart,
    Activity,
    MapPin
} from "lucide-react"

interface BudgetItemDetailDialogProps {
    item: any | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function BudgetItemDetailDialog({ item, open, onOpenChange }: BudgetItemDetailDialogProps) {
    if (!item) return null

    const porcentajeEjecucion = (Number(item.montoEjecutado) / Number(item.montoAsignado)) * 100

    const getStatusConfig = (estado: string) => {
        switch (estado) {
            case "APROBADO":
                return { label: "APROBADO", icon: CheckCircle2, color: "bg-green-100 text-green-700 border-green-200" }
            case "EN_EJECUCION":
                return { label: "EN EJECUCIÓN", icon: Activity, color: "bg-blue-100 text-blue-700 border-blue-200" }
            case "PLANIFICADO":
                return { label: "PLANIFICADO", icon: Clock, color: "bg-gray-100 text-gray-700 border-gray-200" }
            default:
                return { label: estado, icon: AlertCircle, color: "bg-indigo-100 text-indigo-700 border-indigo-200" }
        }
    }

    // Activity is missing from imports, using BarChart3 as fallback for execution
    const status = getStatusConfig(item.estado)
    const StatusIcon = status.icon

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl overflow-hidden p-0 gap-0 border-none rounded-2xl shadow-2xl">
                {/* Header Section */}
                <div className="bg-emerald-600 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <BarChart3 className="h-40 w-40 rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-1">Partida Presupuestaria / {item.anio}</p>
                                <h2 className="text-3xl font-black leading-tight">{item.nombre}</h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="font-mono text-sm bg-black/20 px-2 py-0.5 rounded text-emerald-50">Cód: {item.codigo}</span>
                                    <Badge className={`${status.color} border-none font-black px-3 py-1 shadow-lg`}>
                                        {status.label}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mt-6">
                            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                                <p className="text-emerald-200 text-[9px] font-black uppercase tracking-widest">Asignado</p>
                                <p className="text-xl font-black">{formatCurrency(item.montoAsignado)}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                                <p className="text-emerald-200 text-[9px] font-black uppercase tracking-widest">Ejecutado</p>
                                <p className="text-xl font-black">{formatCurrency(item.montoEjecutado)}</p>
                            </div>
                            <div className="bg-emerald-700/50 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                                <p className="text-emerald-200 text-[9px] font-black uppercase tracking-widest">Disponible</p>
                                <p className="text-xl font-black text-emerald-200">{formatCurrency(item.montoDisponible)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 bg-white grid grid-cols-2 gap-8">
                    <div className="space-y-8">
                        {/* Execution Progress */}
                        <section className="space-y-4">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="h-3 w-3" /> Estado de Ejecución
                            </h3>

                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className={`text-2xl font-black ${porcentajeEjecucion > 95 ? 'text-red-600' : 'text-gray-900'}`}>{porcentajeEjecucion.toFixed(1)}%</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Progreso del gasto</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${porcentajeEjecucion > 95 ? 'bg-red-600 animate-pulse' : porcentajeEjecucion > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min(porcentajeEjecucion, 100)}%` }}
                                    />
                                </div>
                                {porcentajeEjecucion > 95 && (
                                    <div className="mt-2 bg-red-50 border border-red-100 p-3 rounded-lg flex items-center gap-3">
                                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                        <p className="text-[10px] font-black text-red-700 uppercase leading-tight">
                                            Aviso Crítico: Disponibilidad inferior al 5%. No procesar nuevos gastos sin ampliación.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* General Info */}
                        <section className="space-y-4">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Target className="h-3 w-3" /> Clasificación y Origen
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <PieChart className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Categoría</p>
                                        <p className="text-sm font-bold text-gray-800">{item.categoria}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                        <Target className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Tipo de Gasto</p>
                                        <p className="text-sm font-bold text-gray-800">{item.tipoGasto}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Centro Regional</p>
                                        <p className="text-sm font-bold text-gray-800 uppercase leading-none">{item.centroRegional}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Registrado Por</p>
                                        <p className="text-sm font-bold text-gray-800">
                                            {item.creadoPor ? `${item.creadoPor.nombre} ${item.creadoPor.apellido || ""}` : "Sistema Admin"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Section */}
                    <div className="space-y-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 h-full">
                        <section className="space-y-3">
                            <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Propósito de la Partida</h3>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                {item.descripcion || "Sin descripción detallada registrada para esta partida presupuestaria."}
                            </p>
                        </section>

                        <section className="space-y-3 pt-6 border-t border-gray-200">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Cronología Fiscal</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 font-bold flex items-center gap-2">
                                        <Calendar className="h-3 w-3 text-emerald-500" /> Inicio:
                                    </span>
                                    <span className="font-black text-gray-700">01/01/{item.anio}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 font-bold flex items-center gap-2">
                                        <Calendar className="h-3 w-3 text-red-400" /> Cierre:
                                    </span>
                                    <span className="font-black text-gray-700">31/12/{item.anio}</span>
                                </div>
                            </div>
                        </section>

                        <div className="pt-6 border-t border-gray-200 mt-auto">
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col gap-1 items-center justify-center text-center">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600 mb-1" />
                                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">Validado por Contraloría Intermedia</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t">
                    <button
                        onClick={() => {
                            window.print()
                        }}
                        className="px-6 py-2.5 text-[10px] font-black uppercase text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all border border-gray-200 flex items-center gap-2"
                    >
                        Imprimir Informe
                    </button>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-8 py-2.5 text-[10px] font-black uppercase bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-all shadow-lg shadow-emerald-100"
                    >
                        Cerrar Detalles
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
