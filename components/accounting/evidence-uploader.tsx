"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, X, Eye, AlertCircle, CheckCircle2, Paperclip } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface EvidenceUploaderProps {
    entryId: string
    entryNumber: string
    entryAmount: number
    currentEvidences: string[]
    onEvidenceUpdate: (newEvidences: string[]) => void
    requiresEvidence: boolean
    isReadOnly?: boolean
}

export function EvidenceUploader({
    entryId,
    entryNumber,
    entryAmount,
    currentEvidences,
    onEvidenceUpdate,
    requiresEvidence,
    isReadOnly = false,
}: EvidenceUploaderProps) {
    const [uploading, setUploading] = useState(false)
    const [evidences, setEvidences] = useState<string[]>(currentEvidences)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
        if (!allowedTypes.includes(file.type)) {
            toast.error("Tipo de archivo no permitido. Solo se aceptan PDF, JPG y PNG")
            return
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("El archivo excede el tamaño máximo permitido (10MB)")
            return
        }

        setUploading(true)

        try {
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch(`/api/accounting-entries/${entryId}/evidencias`, {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Error al subir archivo")
            }

            const data = await response.json()
            const newEvidences = [...evidences, data.fileUrl]
            setEvidences(newEvidences)
            onEvidenceUpdate(newEvidences)
            toast.success("Evidencia subida exitosamente")

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        } catch (error: any) {
            toast.error(error.message || "Error al subir evidencia")
        } finally {
            setUploading(false)
        }
    }

    const handleRemoveEvidence = async (fileUrl: string) => {
        if (isReadOnly) return

        try {
            const response = await fetch(`/api/accounting-entries/${entryId}/evidencias`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileUrl }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Error al eliminar archivo")
            }

            const newEvidences = evidences.filter((url) => url !== fileUrl)
            setEvidences(newEvidences)
            onEvidenceUpdate(newEvidences)
            toast.success("Evidencia eliminada exitosamente")
        } catch (error: any) {
            toast.error(error.message || "Error al eliminar evidencia")
        }
    }

    const getFileIcon = (url: string) => {
        if (url.endsWith(".pdf")) return <FileText className="h-4 w-4 text-red-500" />
        return <FileText className="h-4 w-4 text-blue-500" />
    }

    const getFileName = (url: string) => {
        return url.split("/").pop() || "archivo"
    }

    const hasRequiredEvidence = evidences.length > 0

    return (
        <Card className="p-6 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Paperclip className="h-4 w-4 text-slate-600" />
                            <h3 className="font-black text-sm uppercase tracking-tight text-slate-900">
                                Expediente Digital de Evidencias
                            </h3>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            Asiento: {entryNumber} • Monto: {formatCurrency(entryAmount)}
                        </p>
                    </div>

                    {requiresEvidence && (
                        <Badge
                            variant={hasRequiredEvidence ? "default" : "destructive"}
                            className="text-[9px] font-black uppercase"
                        >
                            {hasRequiredEvidence ? (
                                <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Completo
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Requerido
                                </>
                            )}
                        </Badge>
                    )}
                </div>

                {/* Alert for required evidence */}
                {requiresEvidence && !hasRequiredEvidence && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-rose-900 uppercase">Evidencia Obligatoria</p>
                            <p className="text-xs text-rose-700 mt-0.5">
                                Este asiento requiere al menos un documento de respaldo (factura, resolución, etc.)
                                antes de poder ser aprobado.
                            </p>
                        </div>
                    </div>
                )}

                {/* Upload Button */}
                {!isReadOnly && (
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="w-full h-12 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading ? "Subiendo..." : "Adjuntar Documento (PDF, JPG, PNG)"}
                        </Button>
                        <p className="text-[10px] text-slate-400 mt-2 text-center font-medium">
                            Tamaño máximo: 10MB • Formatos: PDF, JPG, PNG
                        </p>
                    </div>
                )}

                {/* Evidence List */}
                {evidences.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                            Documentos Adjuntos ({evidences.length})
                        </p>
                        <div className="space-y-2">
                            {evidences.map((url, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {getFileIcon(url)}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-900 truncate">
                                                {getFileName(url)}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium">
                                                Documento #{index + 1}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(url, "_blank")}
                                            className="h-8 w-8 p-0 hover:bg-indigo-50"
                                            title="Ver documento"
                                        >
                                            <Eye className="h-3.5 w-3.5 text-indigo-600" />
                                        </Button>
                                        {!isReadOnly && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveEvidence(url)}
                                                className="h-8 w-8 p-0 hover:bg-rose-50"
                                                title="Eliminar documento"
                                            >
                                                <X className="h-3.5 w-3.5 text-rose-600" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {evidences.length === 0 && (
                    <div className="text-center py-8">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                            <FileText className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Sin documentos adjuntos
                        </p>
                    </div>
                )}
            </div>
        </Card>
    )
}
