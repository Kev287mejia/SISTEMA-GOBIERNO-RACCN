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
    FileText,
    Calendar,
    User,
    CheckCircle2,
    XCircle,
    Clock,
    Hash,
    Briefcase,
    Building2,
    CreditCard,
    MessageSquare,
    Printer,
    ArrowUpRight,
    ArrowDownLeft,
    Paperclip,
    Lock
} from "lucide-react"
import { FileUploader } from "@/components/ui/file-uploader"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface AccountingEntryDetailDialogProps {
    entry: any | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AccountingEntryDetailDialog({ entry, open, onOpenChange }: AccountingEntryDetailDialogProps) {
    if (!entry) return null

    const getStatusConfig = (estado: string) => {
        switch (estado) {
            case "APROBADO":
                return { icon: CheckCircle2, color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" }
            case "PENDIENTE":
                return { icon: Clock, color: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" }
            case "BORRADOR":
                return { icon: FileText, color: "bg-gray-500", text: "text-gray-700", bg: "bg-gray-50" }
            case "RECHAZADO":
                return { icon: XCircle, color: "bg-red-500", text: "text-red-700", bg: "bg-red-50" }
            default:
                return { icon: FileText, color: "bg-indigo-500", text: "text-indigo-700", bg: "bg-indigo-50" }
        }
    }

    const { icon: StatusIcon, color: statusColor, text: textColor, bg: bgColor } = getStatusConfig(entry.estado)

    // Attachments Logic
    const [attachments, setAttachments] = useState<string[]>([])
    const isLocked = !!entry.isLocked
    const isEditable = entry.estado !== "APROBADO" && entry.estado !== "ANULADO" && !isLocked

    useEffect(() => {
        if (entry) {
            setAttachments(entry.evidenciaUrls || [])
        }
    }, [entry])

    const handleAttachmentsChange = async (newUrls: string[]) => {
        setAttachments(newUrls) // Optimistic update

        if (!isEditable) return

        try {
            const res = await fetch(`/api/accounting-entries/${entry.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ evidenciaUrls: newUrls })
            })

            const responseData = await res.json()

            if (!res.ok) {
                console.error("Server Error:", responseData)
                throw new Error(responseData.error || "Error al guardar adjuntos")
            }

            toast.success("Evidencia actualizada correctamente")
        } catch (error: any) {
            console.error("Full Error:", error)
            toast.error(error.message || "No se pudieron guardar los cambios")
            setAttachments(entry.evidenciaUrls || []) // Revert
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl overflow-hidden p-0 gap-0 border-none rounded-2xl shadow-2xl">
                {/* Header Section */}
                <div className={`${entry.tipo === 'INGRESO' ? 'bg-emerald-600' : 'bg-indigo-600'} p-8 text-white relative`}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <FileText className="h-40 w-40 rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Asiento Contable / {entry.institucion}</p>
                                <h2 className="text-3xl font-black leading-tight flex items-center gap-3">
                                    {entry.numero}
                                    {isLocked && (
                                        <Badge className="bg-rose-500 text-white border-none font-black text-xs px-3 py-1 flex items-center gap-1.5 animate-pulse">
                                            <Lock className="h-3 w-3" /> PERIODO CERRADO
                                        </Badge>
                                    )}
                                    <Badge className="bg-white/20 text-white border-none font-black text-xs px-3 py-1 backdrop-blur-md">
                                        {entry.tipo}
                                    </Badge>
                                </h2>
                            </div>
                            <div className={`px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2`}>
                                <StatusIcon className="h-4 w-4" />
                                <span className="text-xs font-black uppercase tracking-widest">{entry.estado}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mt-6">
                            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                                <p className="text-white/60 text-[9px] font-black uppercase tracking-widest">Monto Total</p>
                                <p className="text-xl font-black">{formatCurrency(entry.monto)}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                                <p className="text-white/60 text-[9px] font-black uppercase tracking-widest">Fecha Registro</p>
                                <p className="text-xl font-black">{new Date(entry.fecha).toLocaleDateString()}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                                <p className="text-white/60 text-[9px] font-black uppercase tracking-widest">Cuenta Contable</p>
                                <p className="text-xl font-black">{entry.cuentaContable}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 bg-white grid grid-cols-1 md:grid-cols-5 gap-8">
                    <div className="md:col-span-3 space-y-8">
                        {/* Concept Section */}
                        <section className="space-y-4">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare className="h-3 w-3" /> Concepto y Descripción
                            </h3>
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 min-h-[120px]">
                                <p className="text-sm text-gray-700 leading-relaxed font-medium capitalize">
                                    {entry.descripcion}
                                </p>
                            </div>
                        </section>

                        {/* Attachments Section */}
                        <section className="space-y-4">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Paperclip className="h-3 w-3" /> Soporte Digital (Evidencia)
                            </h3>
                            <div className="bg-white p-1">
                                <FileUploader
                                    value={attachments}
                                    onChange={handleAttachmentsChange}
                                    disabled={!isEditable}
                                />
                            </div>
                        </section>

                        {/* Extra Details */}
                        <section className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                    <Hash className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Referencia / Folio</p>
                                    <p className="text-xs font-bold text-gray-700">{entry.documentoRef || "S/N"}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                    <ArrowUpRight className="h-5 w-5 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Renglón Gasto</p>
                                    <p className="text-xs font-bold text-indigo-700">{entry.renglonGasto || "NO ASIGNADO"}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Presupuesto</p>
                                    <p className="text-xs font-bold text-gray-700">{entry.budgetItem?.codigo || "INSTITUCIONAL"}</p>
                                </div>
                            </div>
                        </section>

                        {entry.observaciones && (
                            <section className="space-y-4">
                                <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3" /> Observaciones Administrativas
                                </h3>
                                <p className="text-xs font-medium text-gray-500 bg-amber-50/50 p-4 rounded-xl border border-amber-100 italic">
                                    &quot;{entry.observaciones}&quot;
                                </p>
                            </section>
                        )}
                    </div>

                    {/* Sidebar Section */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
                            <section className="space-y-4">
                                <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                    <User className="h-3 w-3" /> Auditoría de Registro
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-black text-indigo-600 text-xs shadow-sm">
                                            {entry.creadoPor?.nombre?.[0]}{entry.creadoPor?.apellido?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-gray-400 font-black uppercase">Generado Por</p>
                                            <p className="text-xs font-bold text-gray-800">{entry.creadoPor?.nombre} {entry.creadoPor?.apellido}</p>
                                            <p className="text-[9px] text-gray-500 font-medium">{entry.creadoPor?.email}</p>
                                        </div>
                                    </div>

                                    {entry.aprobadoPor && (
                                        <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                                            <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-black text-emerald-600 text-xs shadow-sm">
                                                {entry.aprobadoPor?.nombre?.[0]}{entry.aprobadoPor?.apellido?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-emerald-600 font-black uppercase">Validado Por</p>
                                                <p className="text-xs font-bold text-gray-800">{entry.aprobadoPor?.nombre} {entry.aprobadoPor?.apellido}</p>
                                                <p className="text-[9px] text-gray-500 font-medium">Aprobación Fiscal</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="space-y-4 pt-6 border-t border-gray-200">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Building2 className="h-3 w-3" /> Origen / Destino
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-gray-400 uppercase text-[9px]">Institución</span>
                                        <Badge variant="outline" className="text-[10px] font-black uppercase border-indigo-100 text-indigo-600">{entry.institucion}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-gray-400 uppercase text-[9px]">Tipo Operación</span>
                                        <span className={`font-black uppercase text-[10px] ${entry.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                            {entry.tipo === 'INGRESO' ? 'CRÉDITO FISCAL' : 'DÉBITO FISCAL'}
                                        </span>
                                    </div>
                                    {entry.proyecto && (
                                        <div className="flex justify-between items-center text-xs pt-2">
                                            <span className="font-bold text-gray-400 uppercase text-[9px]">Proyecto</span>
                                            <span className="font-bold text-gray-700 text-[10px] uppercase text-right">{entry.proyecto}</span>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="pt-6 border-t border-gray-200">
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-[9px] font-black text-indigo-700 uppercase leading-none">Última Actualización</p>
                                        <p className="text-[10px] font-medium text-indigo-600 mt-1">{new Date(entry.updatedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t print:hidden">
                    <button
                        onClick={() => {
                            const width = 1000;
                            const height = 800;
                            const left = (window.screen.width - width) / 2;
                            const top = (window.screen.height - height) / 2;
                            window.open(
                                `/contabilidad/print/${entry.id}`,
                                'PrintWindow',
                                `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=no,resizable=yes`
                            );
                        }}
                        className="px-6 py-2.5 text-[10px] font-black uppercase text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all border border-gray-200 flex items-center gap-2"
                    >
                        <Printer className="h-3.5 w-3.5" /> Generar Comprobante
                    </button>
                    <button
                        onClick={() => onOpenChange(false)}
                        className={`px-8 py-2.5 text-[10px] font-black uppercase ${entry.tipo === 'INGRESO' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'} text-white rounded-xl transition-all shadow-lg`}
                    >
                        Cerrar Registro
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function AlertCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
    )
}
