"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploader } from "@/components/ui/file-uploader"
import { Button } from "@/components/ui/button"
import { FileText, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface BankAccountDocumentsProps {
    accountId: string
    initialUrls?: string[]
}

export function BankAccountDocuments({ accountId, initialUrls = [] }: BankAccountDocumentsProps) {
    const [evidenceUrls, setEvidenceUrls] = useState<string[]>(initialUrls)
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/accounting/bank-accounts/${accountId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ evidenceUrls })
            })

            if (!res.ok) {
                throw new Error("Error al guardar documentos")
            }

            toast.success("Documentos guardados correctamente")
        } catch (error) {
            console.error(error)
            toast.error("Error al guardar documentos")
        } finally {
            setSaving(false)
        }
    }

    const hasChanges = JSON.stringify(evidenceUrls) !== JSON.stringify(initialUrls)

    return (
        <Card className="border-none shadow-xl shadow-slate-100/50">
            <CardHeader className="border-b border-slate-50">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    Documentos de la Cuenta Bancaria
                </CardTitle>
                <p className="text-xs text-slate-500 font-medium mt-2">
                    Adjunte los 3 documentos requeridos: (1) Comprobante de Pago, (2) Recibo de Pago, (3) Solicitud de Emisión de Cheques
                </p>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    <FileUploader
                        value={evidenceUrls}
                        onChange={setEvidenceUrls}
                        maxFiles={3}
                    />

                    {hasChanges && (
                        <div className="flex justify-end animate-in slide-in-from-bottom-2">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Guardar Documentos
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
