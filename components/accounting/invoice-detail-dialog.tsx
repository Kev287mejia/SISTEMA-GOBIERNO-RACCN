"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import {
    FileText,
    User,
    Calendar,
    CreditCard,
    Building2,
    Activity,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle
} from "lucide-react"

interface InvoiceDetailDialogProps {
    invoice: any | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function InvoiceDetailDialog({ invoice, open, onOpenChange }: InvoiceDetailDialogProps) {
    if (!invoice) return null

    const getStatusConfig = (estado: string) => {
        switch (estado) {
            case "APROBADO":
                return { label: "PAGADA", icon: CheckCircle2, color: "bg-green-100 text-green-700 border-green-200" }
            case "PENDIENTE":
                return { label: "PENDIENTE", icon: Clock, color: "bg-yellow-100 text-yellow-700 border-yellow-200" }
            case "RECHAZADO":
                return { label: "RECHAZADA", icon: XCircle, color: "bg-red-100 text-red-700 border-red-200" }
            default:
                return { label: estado, icon: AlertCircle, color: "bg-gray-100 text-gray-700 border-gray-200" }
        }
    }

    const status = getStatusConfig(invoice.estado)
    const StatusIcon = status.icon

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl overflow-hidden p-0 gap-0 border-none rounded-2xl shadow-2xl">
                <div className="bg-indigo-600 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <FileText className="h-40 w-40 rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Detalle de Factura / Registro</p>
                                <h2 className="text-3xl font-black">{invoice.documentoRef || invoice.numero}</h2>
                            </div>
                            <Badge className={`${status.color} border-none font-bold px-3 py-1 flex items-center gap-1.5 shadow-lg`}>
                                <StatusIcon className="h-3.5 w-3.5" />
                                {status.label}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-6 mt-4">
                            <div>
                                <p className="text-indigo-200 text-[10px] font-bold uppercase">Monto Total</p>
                                <p className="text-3xl font-black tracking-tight">{formatCurrency(invoice.monto)}</p>
                            </div>
                            <div className="h-10 w-[1px] bg-white/20" />
                            <div>
                                <p className="text-indigo-200 text-[10px] font-bold uppercase">Fecha de Operación</p>
                                <p className="text-lg font-bold">{new Date(invoice.fecha).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-white grid grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <section className="space-y-4">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Activity className="h-3 w-3" /> Información de Origen
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-4">
                                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Generado Por</p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {invoice.creadoPor ? `${invoice.creadoPor.nombre} ${invoice.creadoPor.apellido || ""}` : "Sistema"}
                                        </p>
                                        {invoice.creadoPor?.email && (
                                            <p className="text-[11px] text-gray-400">{invoice.creadoPor.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <Building2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Institución</p>
                                        <p className="text-sm font-semibold text-gray-800">{invoice.institucion}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <CreditCard className="h-3 w-3" /> Información Financiera
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-4">
                                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <CreditCard className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Cuenta de Cargo</p>
                                        <p className="text-sm font-mono font-bold text-gray-800">{invoice.cuentaContable}</p>
                                        <p className="text-[11px] text-gray-400">Débito procesado según catálogo</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Periodo Fiscal</p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {new Date(invoice.fecha).toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                        <section className="space-y-3">
                            <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-wider">Descripción del Concepto</h3>
                            <p className="text-sm text-gray-700 leading-relaxed italic">
                                &quot;{invoice.descripcion}&quot;
                            </p>
                        </section>

                        {invoice.observaciones && (
                            <section className="space-y-3">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Observaciones Adicionales</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    {invoice.observaciones}
                                </p>
                            </section>
                        )}

                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Número de Asiento</span>
                                <span className="text-[10px] font-mono font-bold text-gray-600">{invoice.numero}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 font-medium">Ubicación</span>
                                <span className="text-gray-800 font-bold">Registro Central</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex justify-end gap-2 border-t">
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border flex items-center gap-2"
                    >
                        Imprimir Comprobante
                    </button>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-6 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors shadow-md"
                    >
                        Cerrar Detalle
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
