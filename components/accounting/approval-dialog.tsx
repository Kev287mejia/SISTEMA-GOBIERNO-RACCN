"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    FileText,
    Eye,
    Loader2,
    Shield
} from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { requiresEvidence } from "@/lib/evidence-config"

interface ApprovalDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    entry: any
    onSuccess: () => void
}

export function ApprovalDialog({
    open,
    onOpenChange,
    entry,
    onSuccess,
}: ApprovalDialogProps) {
    const [approving, setApproving] = useState(false)
    const [rejecting, setRejecting] = useState(false)

    if (!entry) return null

    const entryAmount = Number(entry.monto)
    const needsEvidence = requiresEvidence(entryAmount)
    const hasEvidence = entry.evidenciaUrls && entry.evidenciaUrls.length > 0
    const canApprove = !needsEvidence || hasEvidence

    const handleApprove = async () => {
        setApproving(true)

        try {
            const response = await fetch(`/api/accounting-entries/${entry.id}/approve`, {
                method: "POST",
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error al aprobar asiento")
            }

            toast.success("Asiento aprobado exitosamente")
            onSuccess()
            onOpenChange(false)
        } catch (error: any) {
            toast.error(error.message || "Error al aprobar asiento")
        } finally {
            setApproving(false)
        }
    }

    const handleReject = async () => {
        const reason = prompt("Ingrese la razón del rechazo:")

        if (!reason || reason.trim() === "") {
            toast.error("Debe proporcionar una razón para el rechazo")
            return
        }

        setRejecting(true)

        try {
            const response = await fetch(`/api/accounting-entries/${entry.id}/approve`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error al rechazar asiento")
            }

            toast.success("Asiento rechazado exitosamente")
            onSuccess()
            onOpenChange(false)
        } catch (error: any) {
            toast.error(error.message || "Error al rechazar asiento")
        } finally {
            setRejecting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Shield className="h-5 w-5 text-indigo-600" />
                        Revisión de Asiento Contable
                    </DialogTitle>
                    <DialogDescription>
                        Verifique la información y evidencias antes de aprobar
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Entry Summary */}
                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-black uppercase text-slate-500 tracking-widest">
                                    Número de Asiento
                                </p>
                                <p className="text-lg font-black text-slate-900">{entry.numero}</p>
                            </div>
                            <Badge variant={entry.tipo === "INGRESO" ? "default" : "destructive"}>
                                {entry.tipo}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-black uppercase text-slate-500 tracking-widest">
                                    Monto
                                </p>
                                <p className="text-2xl font-black text-indigo-600">
                                    {formatCurrency(entryAmount)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase text-slate-500 tracking-widest">
                                    Fecha
                                </p>
                                <p className="text-sm font-bold text-slate-700">
                                    {new Date(entry.fecha).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-black uppercase text-slate-500 tracking-widest mb-1">
                                Descripción
                            </p>
                            <p className="text-sm font-medium text-slate-700">
                                {entry.descripcion}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-black uppercase text-slate-500 tracking-widest">
                                    Cuenta Contable
                                </p>
                                <p className="text-sm font-mono font-bold text-slate-700">
                                    {entry.cuentaContable}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase text-slate-500 tracking-widest">
                                    Creado Por
                                </p>
                                <p className="text-sm font-bold text-slate-700">
                                    {entry.creadoPor?.nombre} {entry.creadoPor?.apellido}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Evidence Status */}
                    <div className="border-2 border-dashed rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-black uppercase text-slate-700 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Expediente Digital
                            </h4>
                            {needsEvidence && (
                                <Badge variant={hasEvidence ? "default" : "destructive"} className="text-[9px]">
                                    {hasEvidence ? "COMPLETO" : "REQUERIDO"}
                                </Badge>
                            )}
                        </div>

                        {needsEvidence && !hasEvidence && (
                            <Alert variant="destructive" className="mb-3">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-xs font-bold">
                                    Este asiento requiere evidencia documental (monto ≥ C$ 5,000.00).
                                    No se puede aprobar sin documentos de respaldo.
                                </AlertDescription>
                            </Alert>
                        )}

                        {hasEvidence ? (
                            <div className="space-y-2">
                                <p className="text-xs text-slate-600 font-medium">
                                    {entry.evidenciaUrls.length} documento(s) adjunto(s):
                                </p>
                                {entry.evidenciaUrls.map((url: string, index: number) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between bg-white border rounded-lg p-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            <span className="text-xs font-medium text-slate-700">
                                                Documento #{index + 1}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(url, "_blank")}
                                            className="h-7 text-xs"
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            Ver
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs text-slate-400 font-medium">
                                    {needsEvidence
                                        ? "Sin evidencias - Requerido para aprobación"
                                        : "Sin evidencias adjuntas"
                                    }
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Approval Warning */}
                    {canApprove && (
                        <Alert>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription className="text-xs font-medium">
                                Este asiento cumple con todos los requisitos y puede ser aprobado.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReject}
                        disabled={approving || rejecting}
                        className="border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                        {rejecting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Rechazando...
                            </>
                        ) : (
                            <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Rechazar
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleApprove}
                        disabled={!canApprove || approving || rejecting}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {approving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Aprobando...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Aprobar Asiento
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
