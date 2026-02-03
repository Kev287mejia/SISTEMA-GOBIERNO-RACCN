"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Search,
    Plus,
    Filter,
    CheckCircle2,
    DollarSign,
    FileCheck,
    XCircle,
    AlertCircle,
    ClipboardCheck,
    ArrowRightCircle,
    Banknote
} from "lucide-react"
import { CheckForm } from "./check-form"
import { toast } from "sonner"
import { Role } from "@prisma/client"
import { SignatureTraceability } from "./signature-traceability"
import { ShieldCheck } from "lucide-react"

export function ChecksTable() {
    const { data: session } = useSession()
    const [checks, setChecks] = useState([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [contabilizarData, setContabilizarData] = useState<any>(null)
    const [traceabilityCheck, setTraceabilityCheck] = useState<any>(null)

    const userRole = session?.user?.role as Role

    const fetchChecks = async () => {
        try {
            const res = await fetch("/api/caja/checks")
            if (res.ok) {
                const data = await res.json()
                setChecks(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const updateCheckStatus = async (id: string, estado: string, extraData: any = {}) => {
        setUpdatingId(id)
        try {
            const res = await fetch(`/api/caja/checks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado, ...extraData })
            })
            if (res.ok) {
                toast.success(`Estado del cheque actualizado a ${estado}`)
                fetchChecks()
                setContabilizarData(null)
            } else {
                const err = await res.text()
                toast.error(err || "Error al actualizar estado")
            }
        } catch (error) {
            toast.error("Error de conexión")
        } finally {
            setUpdatingId(null)
        }
    }

    useEffect(() => {
        fetchChecks()
    }, [])

    const getStatusBadge = (estado: string) => {
        switch (estado) {
            case "CHEQUE_REQUESTED":
            case "PENDIENTE_VALIDACION": return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Solicitud</Badge>
            case "BUDGET_APPROVED":
            case "APROBADO_PRESUPUESTO": return <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Presupuesto OK</Badge>
            case "BUDGET_REJECTED": return <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">Presup. Rechazado</Badge>
            case "CHEQUE_ISSUED":
            case "EMITIDO": return <Badge variant="default" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200">Emitido</Badge>
            case "ACCOUNTING_PRECHECK_APPROVED": return <Badge variant="default" className="bg-violet-100 text-violet-700 border-violet-200">Auditoría OK</Badge>
            case "ACCOUNTING_PRECHECK_REJECTED": return <Badge variant="destructive" className="bg-rose-100 text-rose-700 border-rose-200">Audit. Rechazada</Badge>
            case "CHEQUE_PAID":
            case "PAGADO": return <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Pagado</Badge>
            case "ACCOUNTED":
            case "CONTABILIZADO": return <Badge variant="default" className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200">Contabilizado</Badge>
            case "ANULADO": return <Badge variant="destructive">Anulado</Badge>
            default: return <Badge variant="outline">{estado}</Badge>
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900">Control de Cheques y Pagos</h3>
                    <p className="text-sm text-slate-500 font-medium">Flujo Bancario e Integración Presupuesto-Contabilidad</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95">
                            <Plus className="h-4 w-4" />
                            Nueva Solicitud / Cheque
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                                Registrar Movimiento Bancario
                            </DialogTitle>
                        </DialogHeader>
                        <CheckForm onSuccess={() => {
                            setIsOpen(false)
                            fetchChecks()
                        }} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50 backdrop-blur-sm border-b">
                        <TableRow>
                            <TableHead className="font-bold text-slate-600 px-6 py-4">Número / Ref</TableHead>
                            <TableHead className="font-bold text-slate-600 px-6 py-4">Banco / Cuenta</TableHead>
                            <TableHead className="font-bold text-slate-600 px-6 py-4">Beneficiario</TableHead>
                            <TableHead className="font-bold text-slate-600 px-6 py-4 text-right">Monto</TableHead>
                            <TableHead className="font-bold text-slate-600 px-6 py-4 text-center">Docs</TableHead>
                            <TableHead className="font-bold text-slate-600 px-6 py-4">Estado</TableHead>
                            <TableHead className="font-bold text-slate-600 px-6 py-4 text-center">Firma Digital</TableHead>
                            <TableHead className="font-bold text-slate-600 px-6 py-4 text-right">Gestión de Flujo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-20 bg-slate-50/20">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                        <span className="text-slate-500 font-medium italic">Sincronizando registros bancarios...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : checks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-20 text-slate-400">
                                    No se encontraron registros de cheques.
                                </TableCell>
                            </TableRow>
                        ) : (
                            checks.map((c: any) => (
                                <TableRow key={c.id} className="hover:bg-indigo-50/30 transition-colors group">
                                    <TableCell className="px-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-indigo-900 text-base">#{c.numero}</span>
                                            <span className="text-xs font-medium text-slate-400">{format(new Date(c.fecha), "dd MMM yyyy", { locale: es })}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-700">{c.banco}</span>
                                            <span className="text-xs text-slate-500 font-mono tracking-tighter">{c.cuentaBancaria}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-800">{c.provider?.nombre || c.beneficiario}</span>
                                            {c.budgetItem && (
                                                <Badge variant="outline" className="w-fit text-[10px] h-4 px-1 border-indigo-200 text-indigo-500 bg-indigo-50/50">
                                                    Partida: {c.budgetItem.codigo}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 text-right font-bold text-slate-900">
                                        {Number(c.monto).toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })}
                                    </TableCell>
                                    <TableCell className="px-6 text-center">
                                        {c.evidenceUrls && c.evidenceUrls.length > 0 ? (
                                            <div className="flex justify-center gap-1">
                                                {c.evidenceUrls.map((url: string, idx: number) => (
                                                    <a
                                                        key={idx}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="h-6 w-6 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-colors"
                                                        title={`Documento ${idx + 1}`}
                                                    >
                                                        <span className="text-[10px] font-bold text-emerald-700">{idx + 1}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex justify-center gap-1">
                                                <div className={`h-2 w-2 rounded-full ${c.hasCartaSolicitud ? 'bg-emerald-500' : 'bg-slate-200'}`} title="Carta Solicitud" />
                                                <div className={`h-2 w-2 rounded-full ${c.hasDocumentosCompletos ? 'bg-emerald-500' : 'bg-slate-200'}`} title="Documentación Completa" />
                                                <div className={`h-2 w-2 rounded-full ${c.hasFirmaSolicitante ? 'bg-emerald-500' : 'bg-slate-200'}`} title="Firma Solicitante" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="px-6">
                                        {getStatusBadge(c.estado)}
                                    </TableCell>
                                    <TableCell className="px-6 text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 rounded-full hover:bg-emerald-50 text-emerald-600"
                                            onClick={() => setTraceabilityCheck(c)}
                                            title="Ver Trazabilidad de Firmas"
                                        >
                                            <ShieldCheck className="h-5 w-5" />
                                        </Button>
                                    </TableCell>
                                    <TableCell className="px-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                                            {/* 1. BUDGET APPROVAL (Presupuesto) */}
                                            {(c.estado === "CHEQUE_REQUESTED" || c.estado === "PENDIENTE_VALIDACION") && (userRole === Role.Presupuesto || userRole === Role.ResponsablePresupuesto || userRole === Role.Admin) && (
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 border-blue-200 text-blue-600 hover:bg-blue-50"
                                                        disabled={updatingId === c.id}
                                                        onClick={() => updateCheckStatus(c.id, "BUDGET_APPROVED")}
                                                    >
                                                        <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" />
                                                        Aprobar Presup.
                                                    </Button>
                                                </div>
                                            )}

                                            {/* 2. CAJA EMISSION (Caja) */}
                                            {(c.estado === "BUDGET_APPROVED" || c.estado === "APROBADO_PRESUPUESTO") && (userRole === Role.ResponsableCaja || userRole === Role.Admin) && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                                    disabled={updatingId === c.id}
                                                    onClick={() => updateCheckStatus(c.id, "CHEQUE_ISSUED")}
                                                >
                                                    <ArrowRightCircle className="mr-1.5 h-3.5 w-3.5" />
                                                    Emitir Cheque
                                                </Button>
                                            )}

                                            {/* 3. ACCOUNTING PRE-CHECK (Accounting Review) */}
                                            {(c.estado === "CHEQUE_ISSUED" || c.estado === "EMITIDO") && (userRole === Role.ResponsableContabilidad || userRole === Role.ContadorGeneral || userRole === Role.Admin) && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 border-violet-200 text-violet-600 hover:bg-violet-50"
                                                    disabled={updatingId === c.id}
                                                    onClick={() => setContabilizarData({ ...c, isPreCheck: true })}
                                                >
                                                    <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" />
                                                    Auditoría Pre-Pago
                                                </Button>
                                            )}

                                            {/* 4. CAJA PAYMENT (Caja) */}
                                            {(c.estado === "ACCOUNTING_PRECHECK_APPROVED") && (userRole === Role.ResponsableCaja || userRole === Role.Admin) && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                                    disabled={updatingId === c.id}
                                                    onClick={() => updateCheckStatus(c.id, "CHEQUE_PAID")}
                                                >
                                                    <DollarSign className="mr-1.5 h-3.5 w-3.5" />
                                                    Ejecutar Pago
                                                </Button>
                                            )}

                                            {/* 5. ACCOUNTING FINAL REGISTRATION (Accounting Codification) */}
                                            {(c.estado === "CHEQUE_PAID" || c.estado === "PAGADO") && (userRole === Role.ResponsableContabilidad || userRole === Role.ContadorGeneral || userRole === Role.Admin) && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 border-slate-300 text-slate-700 hover:bg-slate-100"
                                                    disabled={updatingId === c.id}
                                                    onClick={() => setContabilizarData({ ...c, isPreCheck: false })}
                                                >
                                                    <FileCheck className="mr-1.5 h-3.5 w-3.5" />
                                                    Codificar Libro
                                                </Button>
                                            )}

                                            {(c.estado === "ACCOUNTED" || c.estado === "CONTABILIZADO") && (
                                                <Badge variant="outline" className="text-emerald-500 border-emerald-100 bg-emerald-50">
                                                    ✓ Certificado y Contabilizado
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Modal de Auditoría / Codificación Contable */}
            <Dialog open={!!contabilizarData} onOpenChange={(open) => !open && setContabilizarData(null)}>
                <DialogContent className="max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {contabilizarData?.isPreCheck ? <ClipboardCheck className="text-violet-600" /> : <FileCheck className="text-indigo-600" />}
                            {contabilizarData?.isPreCheck ? "Auditoría Pre-Pago de Cheque" : "Codificación y Registro Contable"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">Checklist de Control Interno</p>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <Checkbox id="carta" checked={contabilizarData?.hasCartaSolicitud} onCheckedChange={(val) => setContabilizarData({ ...contabilizarData, hasCartaSolicitud: !!val })} />
                                    <Label htmlFor="carta" className="text-sm font-bold text-slate-700">Carta de solicitud firmada</Label>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Checkbox id="docs" checked={contabilizarData?.hasDocumentosCompletos} onCheckedChange={(val) => setContabilizarData({ ...contabilizarData, hasDocumentosCompletos: !!val })} />
                                    <Label htmlFor="docs" className="text-sm font-bold text-slate-700">Documentación de respaldo (Legal/ID)</Label>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Checkbox id="firma" checked={contabilizarData?.hasFirmaSolicitante} onCheckedChange={(val) => setContabilizarData({ ...contabilizarData, hasFirmaSolicitante: !!val })} />
                                    <Label htmlFor="firma" className="text-sm font-bold text-slate-700">Firma de beneficiario/solicitante</Label>
                                </div>
                            </div>
                        </div>

                        {!contabilizarData?.isPreCheck && (
                            <div className="space-y-4 animate-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Cuenta Contable (Codificación)</Label>
                                    <Input
                                        className="h-12 bg-slate-50 font-bold"
                                        placeholder="Ej: 11020101"
                                        value={contabilizarData?.cuentaContable || ""}
                                        onChange={(e) => setContabilizarData({ ...contabilizarData, cuentaContable: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Centro Costo</Label>
                                        <Input
                                            className="h-12 bg-slate-50 font-bold"
                                            placeholder="Ej: ADMIN"
                                            value={contabilizarData?.centroCosto || ""}
                                            onChange={(e) => setContabilizarData({ ...contabilizarData, centroCosto: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Renglón</Label>
                                        <Input
                                            className="h-12 bg-slate-50 font-bold"
                                            placeholder="Ej: 211"
                                            value={contabilizarData?.renglonGasto || ""}
                                            onChange={(e) => setContabilizarData({ ...contabilizarData, renglonGasto: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        {contabilizarData?.isPreCheck ? (
                            <div className="flex w-full gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                                    onClick={() => updateCheckStatus(contabilizarData.id, "ACCOUNTING_PRECHECK_REJECTED")}
                                >
                                    Rechazar
                                </Button>
                                <Button
                                    className="flex-1 bg-violet-600 hover:bg-violet-700"
                                    disabled={!contabilizarData?.hasCartaSolicitud || !contabilizarData?.hasDocumentosCompletos || !contabilizarData?.hasFirmaSolicitante}
                                    onClick={() => updateCheckStatus(contabilizarData.id, "ACCOUNTING_PRECHECK_APPROVED", {
                                        hasCartaSolicitud: true,
                                        hasDocumentosCompletos: true,
                                        hasFirmaSolicitante: true
                                    })}
                                >
                                    Aprobar Auditoría
                                </Button>
                            </div>
                        ) : (
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 font-bold uppercase tracking-widest text-xs"
                                disabled={updatingId === contabilizarData?.id || !contabilizarData?.cuentaContable}
                                onClick={() => updateCheckStatus(contabilizarData.id, "ACCOUNTED", {
                                    cuentaContable: contabilizarData.cuentaContable,
                                    centroCosto: contabilizarData.centroCosto,
                                    renglonGasto: contabilizarData.renglonGasto,
                                })}
                            >
                                {updatingId ? "Registrando..." : "Confirmar y Contabilizar"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SignatureTraceability
                check={traceabilityCheck}
                isOpen={!!traceabilityCheck}
                onClose={() => setTraceabilityCheck(null)}
            />
        </div>
    )
}
