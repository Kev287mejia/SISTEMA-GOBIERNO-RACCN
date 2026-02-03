"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
    CheckCircle2,
    XCircle,
    Clock,
    User as UserIcon,
    ShieldCheck,
    CreditCard,
    BookOpen,
    ClipboardList,
    Printer,
    Download
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface SignatureStepProps {
    title: string
    status: 'completed' | 'pending' | 'rejected'
    user?: { nombre: string; apellido?: string; cargo?: string }
    date?: Date | string
    description: string
}

function SignatureStep({ title, status, user, date, description }: SignatureStepProps) {
    const getIcon = () => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            case 'rejected': return <XCircle className="h-6 w-6 text-rose-500" />
            default: return <Clock className="h-6 w-6 text-slate-300" />
        }
    }

    return (
        <div className="flex gap-4 relative">
            <div className="flex flex-col items-center">
                <div className={`z-10 bg-white p-1 rounded-full border-2 ${status === 'completed' ? 'border-emerald-100' :
                        status === 'rejected' ? 'border-rose-100' : 'border-slate-100'
                    }`}>
                    {getIcon()}
                </div>
                <div className="w-0.5 h-full bg-slate-100 absolute top-8 -z-0 last:hidden"></div>
            </div>
            <div className="pb-8 flex-1">
                <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-bold ${status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>
                        {title}
                    </h4>
                    {status === 'completed' && date && (
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                            {format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es })}
                        </span>
                    )}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-3">{description}</p>

                {user ? (
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                            <UserIcon className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{user.nombre} {user.apellido}</span>
                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">{user.cargo || 'Funcionario'}</span>
                        </div>
                    </div>
                ) : status === 'pending' ? (
                    <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200 bg-slate-50/30">
                        Esperando Acción Institucional
                    </Badge>
                ) : null}
            </div>
        </div>
    )
}

export function SignatureTraceability({
    check,
    isOpen,
    onClose
}: {
    check: any,
    isOpen: boolean,
    onClose: () => void
}) {
    if (!check) return null

    const handlePrint = () => {
        window.print()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between pr-8">
                        <div>
                            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                                Certificado de Firmas y Trazabilidad
                            </DialogTitle>
                            <p className="text-slate-500 text-sm">Validación íntegra del proceso de gasto público</p>
                        </div>
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 px-4 py-1">
                            ID: {check.numero}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Monto Certificado</span>
                        <div className="text-xl font-bold text-slate-900">
                            {Number(check.monto).toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })}
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Partida Presup.</span>
                        <div className="text-sm font-bold text-slate-700 truncate">
                            {check.budgetItem?.codigo || '---'}
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Beneficiario</span>
                        <div className="text-sm font-bold text-slate-700 truncate">
                            {check.beneficiario}
                        </div>
                    </div>
                </div>

                <div className="space-y-2 mt-2 px-2">
                    <SignatureStep
                        title="1. Solicitud de Cheque"
                        description="Inicio del requerimiento institucional para pago o viático."
                        status="completed"
                        user={check.usuario}
                        date={check.createdAt}
                    />

                    <SignatureStep
                        title="2. Validación Presupuestaria"
                        description="Certificación de disponibilidad de fondos en la partida correspondiente y registro de compromiso fiscal."
                        status={check.budgetApprovedAt ? 'completed' : check.budgetRejectedAt ? 'rejected' : 'pending'}
                        user={check.budgetApprovedBy || check.budgetRejectedBy}
                        date={check.budgetApprovedAt || check.budgetRejectedAt}
                    />

                    <SignatureStep
                        title="3. Emisión de Cheque"
                        description="Impresión física y firma del documento bancario por parte de Tesorería."
                        status={check.issuedAt ? 'completed' : 'pending'}
                        user={check.issuedBy}
                        date={check.issuedAt}
                    />

                    <SignatureStep
                        title="4. Auditoría Pre-Pago (Contabilidad)"
                        description="Revisión exhaustiva de documentación soporte, facturas y cumplimiento de normativas."
                        status={check.preCheckApprovedAt ? 'completed' : check.preCheckRejectedAt ? 'rejected' : 'pending'}
                        user={check.preCheckApprovedBy || check.preCheckRejectedBy}
                        date={check.preCheckApprovedAt || check.preCheckRejectedAt}
                    />

                    <SignatureStep
                        title="5. Ejecución de Pago"
                        description="Entrega del cheque al beneficiario y afectación real del saldo bancario."
                        status={check.paidAt ? 'completed' : 'pending'}
                        user={check.paidBy}
                        date={check.paidAt}
                    />

                    <SignatureStep
                        title="6. Registro y Codificación Contable"
                        description="Asignación de cuentas contables finales y generación del asiento en el libro diario."
                        status={check.accountedAt ? 'completed' : 'pending'}
                        user={check.accountedBy}
                        date={check.accountedAt}
                    />
                </div>

                <DialogFooter className="border-t pt-6 bg-slate-50/50 -mx-6 px-6 rounded-b-[var(--radius)]">
                    <div className="flex w-full justify-between items-center">
                        <div className="flex gap-2">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            <span className="text-[10px] text-slate-500 font-medium">Este documento constituye una certificación digital de firmas institucionales íntegra y auditable.</span>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 bg-white">
                                <Printer className="h-4 w-4" />
                                Imprimir
                            </Button>
                            <Button size="sm" className="gap-2 bg-slate-900 hover:bg-slate-800 shadow-lg">
                                <Download className="h-4 w-4" />
                                Descargar PDF
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
