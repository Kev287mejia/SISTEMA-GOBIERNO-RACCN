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
    DollarSign,
    Users,
    TrendingDown,
    TrendingUp,
    Printer,
    Building2,
    Briefcase,
    ArrowDownToLine,
    CreditCard
} from "lucide-react"

interface PayrollDetailDialogProps {
    payroll: any | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export function PayrollDetailDialog({ payroll, open, onOpenChange }: PayrollDetailDialogProps) {
    if (!payroll) return null

    const statusConfig: Record<string, any> = {
        "PAGADO": { color: "bg-emerald-500", icon: CheckCircle2, text: "text-emerald-700", bg: "bg-emerald-50" },
        "PROCESADO": { color: "bg-indigo-500", icon: Clock, text: "text-indigo-700", bg: "bg-indigo-50" },
        "BORRADOR": { color: "bg-gray-500", icon: FileText, text: "text-gray-700", bg: "bg-gray-50" },
        "RECHAZADO": { color: "bg-red-500", icon: XCircle, text: "text-red-700", bg: "bg-red-50" }
    }

    const config = statusConfig[payroll.estado] || statusConfig["BORRADOR"]
    const StatusIcon = config.icon

    const totalDeducciones = payroll.items?.reduce((sum: number, item: any) => sum + Number(item.deducciones), 0) || 0
    const totalBonificaciones = payroll.items?.reduce((sum: number, item: any) => sum + Number(item.bonificaciones), 0) || 0
    const totalBruto = Number(payroll.totalMonto) + totalDeducciones - totalBonificaciones

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl overflow-hidden p-0 gap-0 border-none rounded-3xl shadow-2xl max-h-[90vh] flex flex-col">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-indigo-700 to-blue-800 p-8 text-white relative flex-shrink-0">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <DollarSign className="h-48 w-48 rotate-12" />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Control de Nómina Presupuestaria</p>
                                <h2 className="text-3xl font-black uppercase tracking-tight leading-none">
                                    {payroll.descripcion}
                                </h2>
                                <p className="text-indigo-100/70 text-sm font-medium">
                                    Periodo Fiscal: {MONTHS[payroll.mes - 1]} / Anio {payroll.anio}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2`}>
                                    <StatusIcon className="h-4 w-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">{payroll.estado}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-6 pt-4">
                            <div className="bg-black/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                                <p className="text-white/60 text-[9px] font-black uppercase tracking-widest">Monto Neto Pagado</p>
                                <p className="text-2xl font-black">{formatCurrency(payroll.totalMonto)}</p>
                            </div>
                            <div className="bg-black/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                                <p className="text-white/60 text-[9px] font-black uppercase tracking-widest">Beneficiarios</p>
                                <p className="text-2xl font-black">{payroll.items?.length || 0} <span className="text-xs opacity-60">Personal</span></p>
                            </div>
                            <div className="bg-black/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                                <p className="text-white/60 text-[9px] font-black uppercase tracking-widest">Total Deducciones</p>
                                <p className="text-2xl font-black text-red-300">-{formatCurrency(totalDeducciones)}</p>
                            </div>
                            <div className="bg-black/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                                <p className="text-white/60 text-[9px] font-black uppercase tracking-widest">Fecha Proceso</p>
                                <p className="text-2xl font-black text-sm">{new Date(payroll.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-8 bg-white">
                    <div className="space-y-8">
                        {/* Summary Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <section className="col-span-1 space-y-4">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <User className="h-3.5 w-3.5" /> Responsable de Nómina
                                </h3>
                                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                                        {payroll.creadoPor?.nombre?.[0]}{payroll.creadoPor?.apellido?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-800">{payroll.creadoPor?.nombre} {payroll.creadoPor?.apellido}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{payroll.creadoPor?.email}</p>
                                    </div>
                                </div>
                            </section>

                            <section className="col-span-2 space-y-4">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText className="h-3.5 w-3.5" /> Detalles de Ejecución
                                </h3>
                                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 grid grid-cols-2 gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-600">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase">Institución</p>
                                            <p className="text-xs font-bold text-gray-700">GOBIERNO INSTITUCIONAL</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-600">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase">Fecha Pago</p>
                                            <p className="text-xs font-bold text-gray-700">
                                                {payroll.fechaPago ? new Date(payroll.fechaPago).toLocaleDateString() : 'Pendiente de Pago'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Employee Items Table */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Users className="h-3.5 w-3.5" /> Desglose Individual de Pagos
                                </h3>
                                <Badge variant="outline" className="text-[9px] font-black text-indigo-600">
                                    {payroll.items?.length || 0} Registros Auditados
                                </Badge>
                            </div>

                            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50/80 border-b border-gray-100">
                                        <tr className="text-[10px] font-black uppercase text-gray-400">
                                            <th className="px-6 py-4 text-left">Funcionario</th>
                                            <th className="px-6 py-4 text-center">Salario Base</th>
                                            <th className="px-6 py-4 text-center">Bonos (+)</th>
                                            <th className="px-6 py-4 text-center text-red-500">Deducciones (-)</th>
                                            <th className="px-6 py-4 text-right">Monto Neto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {payroll.items?.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-indigo-50/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-gray-800 uppercase text-xs">
                                                            {item.empleado?.nombre} {item.empleado?.apellido}
                                                        </span>
                                                        <span className="text-[9px] text-gray-400 font-bold">
                                                            {item.empleado?.contratos?.[0]?.cargo?.titulo || 'General'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-gray-600">
                                                    {formatCurrency(Number(item.salarioBase))}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-emerald-600 font-black text-xs">
                                                        +{formatCurrency(Number(item.bonificaciones))}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-red-500 font-black text-xs">
                                                        -{formatCurrency(Number(item.deducciones))}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-black text-indigo-700">
                                                        {formatCurrency(Number(item.totalNeto))}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-2 italic text-[10px] text-gray-400 font-black uppercase">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        Validación Contable Activa
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
                        >
                            <Printer className="h-3.5 w-3.5" /> Imprimir Planilla
                        </button>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
                        >
                            Cerrar Expediente
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
