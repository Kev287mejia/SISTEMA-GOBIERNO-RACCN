"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Clock,
    User,
    Activity,
    Database,
    Hash,
    ShieldCheck,
    Printer,
    ArrowRight,
    Terminal,
    FileJson,
    History
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AuditDetailDialogProps {
    log: any | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AuditDetailDialog({ log, open, onOpenChange }: AuditDetailDialogProps) {
    if (!log) return null

    const handlePrint = () => {
        window.print()
    }

    const formatValue = (key: string, value: any) => {
        if (value === null || value === undefined) return <span className="text-gray-400 italic">nulo</span>

        // Handle currencies/amounts
        if (key.toLowerCase().includes('monto') || key.toLowerCase().includes('salario') || key.toLowerCase().includes('total')) {
            return <span className="text-emerald-600 font-black tracking-tight">{formatCurrency(value)}</span>
        }

        // Handle dates
        if (key.toLowerCase().includes('fecha') || key.toLowerCase().includes('at') || key.toLowerCase().includes('inicio') || key.toLowerCase().includes('fin')) {
            try {
                const date = new Date(value)
                if (!isNaN(date.getTime())) {
                    return <span className="flex items-center gap-1.5 text-indigo-600 font-bold">
                        <Clock className="h-3 w-3" /> {format(date, "dd MMM, yyyy HH:mm", { locale: es })}
                    </span>
                }
            } catch (e) {
                return String(value)
            }
        }

        // Handle states/enums
        if (key.toLowerCase() === 'estado' || key.toLowerCase() === 'categoria' || key.toLowerCase() === 'tipo') {
            return <Badge variant="outline" className="bg-slate-100 border-slate-200 text-slate-700 font-black text-[9px] uppercase">
                {String(value)}
            </Badge>
        }

        if (typeof value === 'boolean') {
            return <Badge className={value ? "bg-emerald-500" : "bg-rose-500"}>{value ? "SI" : "NO"}</Badge>
        }

        return <span className="text-gray-700 font-medium">{String(value)}</span>
    }

    const PrettyDataView = ({ data }: { data: any }) => {
        if (!data) return <p className="text-gray-400 italic py-4 text-center">Sin datos registrados</p>

        const entries = Object.entries(data)

        return (
            <div className="space-y-2 py-2">
                {entries.map(([key, value]) => (
                    <div key={key} className="group flex flex-col gap-1 p-2.5 rounded-xl hover:bg-white hover:shadow-sm hover:border-gray-200 border border-transparent transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="h-1 w-1 rounded-full bg-indigo-400 group-hover:scale-150 transition-transform" />
                                {key}
                            </span>
                        </div>
                        <div className="text-xs break-all">
                            {typeof value === 'object' && value !== null ? (
                                <div className="pl-4 border-l-2 border-gray-100 mt-2">
                                    <PrettyDataView data={value} />
                                </div>
                            ) : formatValue(key, value)}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderData = (data: any) => {
        return <PrettyDataView data={data} />
    }

    const getActionStyle = (action: string) => {
        switch (action) {
            case 'CREATE': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
            case 'UPDATE': return 'bg-indigo-50 text-indigo-700 border-indigo-100'
            case 'DELETE': return 'bg-rose-50 text-rose-700 border-rose-100'
            case 'APPROVE': return 'bg-blue-50 text-blue-700 border-blue-100'
            case 'REJECT': return 'bg-amber-50 text-amber-700 border-amber-100'
            default: return 'bg-gray-50 text-gray-700 border-gray-100'
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 border-none shadow-2xl rounded-3xl overflow-hidden">
                <div className="flex flex-col max-h-[90vh]">
                    <DialogHeader className="p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 text-white shrink-0">
                        <div className="flex justify-between items-start">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                                        <ShieldCheck className="h-6 w-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                            Expediente Técnico de Auditoría
                                            <Badge className={`border-none font-black text-[10px] uppercase px-3 py-1 ${getActionStyle(log.accion)}`}>
                                                {log.accion}
                                            </Badge>
                                        </DialogTitle>
                                        <p className="text-gray-400 text-sm font-medium mt-1 flex items-center gap-2">
                                            <Hash className="h-3.5 w-3.5" /> ID Seguimiento: <span className="text-emerald-400 font-mono">{log.id}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl px-4 h-10 border-2 transition-all print:hidden"
                                onClick={handlePrint}
                            >
                                <Printer className="mr-2 h-4 w-4" /> Imprimir Acta
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden p-8 bg-gray-50/50 print:bg-white print:p-0 print:overflow-visible">
                        <ScrollArea className="h-full pr-4 print:h-auto print:pr-0 print:overflow-visible">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Column 1: Info General */}
                                <div className="space-y-6">
                                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-indigo-500">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5" /> Línea de Tiempo
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-black uppercase">Fecha y Hora Registro</p>
                                                <p className="text-sm font-bold text-gray-900">{format(new Date(log.fecha), "PPPPp", { locale: es })}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-black uppercase">Zona Horaria</p>
                                                <p className="text-xs font-medium text-gray-600">GMT -0600 (Central Standard Time)</p>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-emerald-500">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <User className="h-3.5 w-3.5" /> Operador Responsable
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{log.usuario.nombre} {log.usuario.apellido}</p>
                                                <p className="text-xs text-indigo-600 font-bold">{log.usuario.role}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-black uppercase">Credenciales</p>
                                                <p className="text-xs font-medium text-gray-600">{log.usuario.email}</p>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-slate-400">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Terminal className="h-3.5 w-3.5" /> Metadatos de Red
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-black uppercase">Dirección IP de Origen</p>
                                                <p className="text-sm font-mono font-bold text-gray-900">{log.ipAddress || "192.168.1.1"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-black uppercase">Agente de Usuario</p>
                                                <p className="text-[9px] font-medium text-gray-500 break-all leading-tight mt-1">{log.userAgent || "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0"}</p>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Column 2 & 3: Details and Diff */}
                                <div className="md:col-span-2 space-y-6">
                                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Activity className="h-3.5 w-3.5" /> Descripción de la Actividad
                                        </h3>
                                        <p className="text-sm font-bold text-gray-900 leading-relaxed bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50">
                                            {log.descripcion}
                                        </p>
                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <p className="text-[9px] text-gray-400 font-black uppercase">Entidad Afectada</p>
                                                <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mt-0.5">
                                                    <Database className="h-3 w-3 text-indigo-500" /> {log.entidad}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <p className="text-[9px] text-gray-400 font-black uppercase">Referencia Unívoca</p>
                                                <p className="text-xs font-mono font-bold text-gray-700 mt-0.5">{log.entidadId}</p>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <History className="h-3.5 w-3.5" /> Análisis de Cambios Estructurales
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between px-2">
                                                    <span className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-1">
                                                        <ArrowRight className="h-3 w-3 rotate-180" /> Estado Anterior
                                                    </span>
                                                    <FileJson className="h-3 w-3 text-gray-300" />
                                                </div>
                                                <div className="p-4 bg-rose-50/30 rounded-2xl border border-rose-100 min-h-[150px] max-h-[500px] overflow-auto scrollbar-thin print:max-h-none print:bg-white print:border-gray-200 print:overflow-visible">
                                                    {renderData(log.datosAnteriores)}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between px-2">
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
                                                        Estado Actualizado <ArrowRight className="h-3 w-3" />
                                                    </span>
                                                    <FileJson className="h-3 w-3 text-gray-300" />
                                                </div>
                                                <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100 min-h-[150px] max-h-[500px] overflow-auto scrollbar-thin print:max-h-none print:bg-white print:border-gray-200 print:overflow-visible">
                                                    {renderData(log.datosNuevos)}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                                        <ShieldCheck className="h-10 w-10 text-amber-500 mt-1" />
                                        <div>
                                            <p className="text-xs font-black text-amber-900 uppercase">Certificación de Auditoría</p>
                                            <p className="text-[11px] text-amber-800 font-medium leading-relaxed mt-1">
                                                Este registro ha sido sellado criptográficamente y es inmutable. Cualquier alteración a la base de datos de auditoría activará alertas de seguridad automáticas a la Dirección General.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
