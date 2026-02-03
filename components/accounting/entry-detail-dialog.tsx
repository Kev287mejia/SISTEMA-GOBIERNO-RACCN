"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    FileText,
    Calendar,
    DollarSign,
    User,
    Building2,
    Hash,
    Loader2,
    X
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { EvidenceUploader } from "./evidence-uploader"
import { requiresEvidence } from "@/lib/evidence-config"

interface EntryDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    entryId: string | null
    onUpdate?: () => void
}

export function EntryDetailDialog({
    open,
    onOpenChange,
    entryId,
    onUpdate,
}: EntryDetailDialogProps) {
    const [entry, setEntry] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (entryId && open) {
            fetchEntry()
        }
    }, [entryId, open])

    const fetchEntry = async () => {
        if (!entryId) return

        setLoading(true)
        try {
            const response = await fetch(`/api/accounting-entries/${entryId}`)
            const data = await response.json()
            setEntry(data.data)
        } catch (error) {
            console.error("Error fetching entry:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleEvidenceUpdate = (newEvidences: string[]) => {
        if (entry) {
            setEntry({ ...entry, evidenciaUrls: newEvidences })
            onUpdate?.()
        }
    }

    if (!entry && loading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    if (!entry) return null

    const entryAmount = Number(entry.monto)
    const needsEvidence = requiresEvidence(entryAmount)
    const canEdit = entry.estado === "BORRADOR" || entry.estado === "PENDIENTE"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-black">
                                Asiento Contable
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium mt-1">
                                Detalles completos y expediente digital
                            </DialogDescription>
                        </div>
                        <Badge
                            variant={
                                entry.estado === "APROBADO" ? "default" :
                                    entry.estado === "RECHAZADO" ? "destructive" :
                                        "secondary"
                            }
                            className="text-xs font-black"
                        >
                            {entry.estado}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 tracking-widest">
                                <Hash className="h-3 w-3" />
                                Número
                            </div>
                            <p className="text-lg font-black text-slate-900">{entry.numero}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 tracking-widest">
                                <Calendar className="h-3 w-3" />
                                Fecha
                            </div>
                            <p className="text-lg font-bold text-slate-700">
                                {new Date(entry.fecha).toLocaleDateString('es-NI', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 tracking-widest">
                                <DollarSign className="h-3 w-3" />
                                Monto
                            </div>
                            <p className="text-2xl font-black text-indigo-600">
                                {formatCurrency(entryAmount)}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 tracking-widest">
                                <FileText className="h-3 w-3" />
                                Tipo
                            </div>
                            <Badge variant={entry.tipo === "INGRESO" ? "default" : "destructive"}>
                                {entry.tipo}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div className="space-y-2">
                        <p className="text-xs font-black uppercase text-slate-500 tracking-widest">
                            Descripción / Concepto
                        </p>
                        <p className="text-sm font-medium text-slate-700 bg-slate-50 p-4 rounded-xl">
                            {entry.descripcion}
                        </p>
                    </div>

                    {/* Accounting Details */}
                    <div className="bg-indigo-50/50 p-4 rounded-xl space-y-3">
                        <h4 className="text-xs font-black uppercase text-indigo-900 tracking-widest">
                            Clasificación Contable
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold text-indigo-700 mb-1">Cuenta Contable</p>
                                <p className="text-sm font-mono font-black text-slate-900">
                                    {entry.cuentaContable}
                                </p>
                            </div>

                            {entry.centroCosto && (
                                <div>
                                    <p className="text-xs font-bold text-indigo-700 mb-1">Centro de Costo</p>
                                    <p className="text-sm font-bold text-slate-700">{entry.centroCosto}</p>
                                </div>
                            )}

                            {entry.proyecto && (
                                <div>
                                    <p className="text-xs font-bold text-indigo-700 mb-1">Proyecto</p>
                                    <p className="text-sm font-bold text-slate-700">{entry.proyecto}</p>
                                </div>
                            )}

                            {entry.documentoRef && (
                                <div>
                                    <p className="text-xs font-bold text-indigo-700 mb-1">Doc. Referencia</p>
                                    <p className="text-sm font-bold text-slate-700">{entry.documentoRef}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Information */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 tracking-widest">
                                <User className="h-3 w-3" />
                                Creado Por
                            </div>
                            <p className="text-sm font-bold text-slate-700">
                                {entry.creadoPor?.nombre} {entry.creadoPor?.apellido}
                            </p>
                            <p className="text-xs text-slate-500">
                                {new Date(entry.createdAt).toLocaleString('es-NI')}
                            </p>
                        </div>

                        {entry.aprobadoPor && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 tracking-widest">
                                    <User className="h-3 w-3" />
                                    Aprobado Por
                                </div>
                                <p className="text-sm font-bold text-slate-700">
                                    {entry.aprobadoPor?.nombre} {entry.aprobadoPor?.apellido}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {new Date(entry.updatedAt).toLocaleString('es-NI')}
                                </p>
                            </div>
                        )}

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 tracking-widest">
                                <Building2 className="h-3 w-3" />
                                Institución
                            </div>
                            <p className="text-sm font-bold text-slate-700">
                                {entry.institucion === "GOBIERNO" ? "Gobierno Regional" : "Consejo Regional"}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Evidence Uploader */}
                    <EvidenceUploader
                        entryId={entry.id}
                        entryNumber={entry.numero}
                        entryAmount={entryAmount}
                        currentEvidences={entry.evidenciaUrls || []}
                        onEvidenceUpdate={handleEvidenceUpdate}
                        requiresEvidence={needsEvidence}
                        isReadOnly={!canEdit}
                    />

                    {entry.observaciones && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <p className="text-xs font-black uppercase text-slate-500 tracking-widest">
                                    Observaciones
                                </p>
                                <p className="text-sm font-medium text-slate-600 italic">
                                    {entry.observaciones}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cerrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
