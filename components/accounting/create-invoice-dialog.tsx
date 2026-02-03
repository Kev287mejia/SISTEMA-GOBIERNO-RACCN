"use client"

import { useState, useRef, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    FileText,
    Upload,
    X,
    Loader2,
    Plus,
    Image as ImageIcon,
    File as FileIcon,
    AlertCircle,
    CheckCircle2,
    Briefcase,
    Building2,
    Calendar as CalendarIcon,
    CreditCard,
    Sparkles,
    Check
} from "lucide-react"
import { toast } from "sonner"
import { Institution, EntryType } from "@prisma/client"

interface CreateInvoiceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function CreateInvoiceDialog({ open, onOpenChange, onSuccess }: CreateInvoiceDialogProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [evidenciaUrls, setEvidenciaUrls] = useState<string[]>([])
    const [bankAccounts, setBankAccounts] = useState<any[]>([])
    const [loadingAccounts, setLoadingAccounts] = useState(false)
    const [suggestion, setSuggestion] = useState<any>(null)
    const [isThinking, setIsThinking] = useState(false)

    const [formData, setFormData] = useState({
        fecha: new Date().toISOString().split('T')[0],
        descripcion: "",
        monto: "",
        institucion: "GOBIERNO" as Institution,
        cuentaContable: "",
        documentoRef: "",
        observaciones: "",
    })

    useEffect(() => {
        if (open) {
            fetchBankAccounts()
        }
    }, [open])

    // Intelligent Assistant logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (formData.descripcion.length > 5) {
                setIsThinking(true)
                try {
                    const res = await fetch(`/api/accounting/assistant/suggest?q=${encodeURIComponent(formData.descripcion)}`)
                    const data = await res.json()
                    setSuggestion(data.suggestion)
                } catch (error) {
                    console.error("Error fetching suggestion:", error)
                } finally {
                    setIsThinking(false)
                }
            } else {
                setSuggestion(null)
            }
        }, 1000)

        return () => clearTimeout(timer)
    }, [formData.descripcion])

    const applySuggestion = () => {
        if (suggestion) {
            setFormData(prev => ({ ...prev, cuentaContable: suggestion.code }))
            setSuggestion(null)
            toast.success("Cuenta contable aplicada automáticamente", {
                description: `Se seleccionó: ${suggestion.name}`,
                icon: <Sparkles className="h-4 w-4 text-amber-500" />
            })
        }
    }

    const fetchBankAccounts = async () => {
        setLoadingAccounts(true)
        try {
            const res = await fetch("/api/accounting/bank-accounts")
            if (res.ok) {
                const data = await res.json()
                setBankAccounts(data || [])
            }
        } catch (error) {
            console.error("Error fetching bank accounts:", error)
        } finally {
            setLoadingAccounts(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        const newUrls = [...evidenciaUrls]

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const uploadData = new FormData()
            uploadData.append("file", file)

            try {
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadData,
                })

                if (res.ok) {
                    const data = await res.json()
                    newUrls.push(data.url)
                    toast.success(`Archivo ${file.name} subido correctamente`)
                } else {
                    const error = await res.json()
                    toast.error(`Error al subir ${file.name}: ${error.error}`)
                }
            } catch (error) {
                toast.error(`Error de conexión al subir ${file.name}`)
            }
        }

        setEvidenciaUrls(newUrls)
        setUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const removeFile = (index: number) => {
        setEvidenciaUrls(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.descripcion || !formData.monto || !formData.cuentaContable) {
            toast.error("Por favor complete los campos obligatorios")
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/accounting-entries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    tipo: EntryType.EGRESO,
                    monto: parseFloat(formData.monto),
                    fecha: new Date(formData.fecha),
                    evidenciaUrls,
                }),
            })

            if (res.ok) {
                toast.success("Factura registrada correctamente")
                onSuccess?.()
                onOpenChange(false)
                resetForm()
            } else {
                const error = await res.json()
                toast.error(error.error || "Error al registrar la factura")
            }
        } catch (error) {
            toast.error("Error de conexión al registrar la factura")
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            fecha: new Date().toISOString().split('T')[0],
            descripcion: "",
            monto: "",
            institucion: "GOBIERNO" as Institution,
            cuentaContable: "",
            documentoRef: "",
            observaciones: "",
        })
        setEvidenciaUrls([])
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
                <DialogHeader className="bg-slate-900 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <FileText className="h-32 w-32 rotate-12" />
                    </div>
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                                <Plus className="h-6 w-6 text-white" />
                            </div>
                            <DialogTitle className="text-3xl font-black uppercase tracking-tight">Registro de Factura</DialogTitle>
                        </div>
                        <DialogDescription className="text-slate-400 font-medium">
                            Ingrese los detalles del comprobante fiscal y adjunte las evidencias correspondientes.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="bg-white p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Datos de la Factura */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-indigo-500" /> Detalle del Documento
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-600 uppercase">Fecha de Emisión *</Label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            required
                                            className="bg-slate-50 border-slate-200 h-11 pl-10"
                                            value={formData.fecha}
                                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                        />
                                        <CalendarIcon className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-600 uppercase italic">No. Referencia / Factura</Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Ej: FAC-1234"
                                            className="bg-slate-50 border-slate-200 h-11 pl-10 font-mono"
                                            value={formData.documentoRef}
                                            onChange={(e) => setFormData({ ...formData, documentoRef: e.target.value })}
                                        />
                                        <FileText className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-600 uppercase">Concepto de Pago *</Label>
                                <Input
                                    required
                                    placeholder="Descripción clara del gasto..."
                                    className="bg-slate-50 border-slate-200 h-11"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                />

                                {/* Intelligent Suggestion UI */}
                                {suggestion && (
                                    <div
                                        onClick={applySuggestion}
                                        className="mt-2 bg-amber-50 border border-amber-100 p-2 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-all animate-in fade-in slide-in-from-top-1"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="bg-amber-500 p-1.5 rounded-lg">
                                                <Sparkles className="h-3 w-3 text-white" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase text-amber-700 leading-none">Sugerencia Inteligente</span>
                                                <span className="text-[11px] font-bold text-slate-700">{suggestion.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 uppercase">
                                            <span>Aplicar</span>
                                            <Check className="h-3 w-3" />
                                        </div>
                                    </div>
                                )}
                                {isThinking && (
                                    <div className="mt-2 flex items-center gap-2 opacity-50 px-2 animate-pulse">
                                        <Sparkles className="h-3 w-3 text-indigo-500 animate-spin" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asistente analizando...</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-600 uppercase">Monto Total (C$) *</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            required
                                            placeholder="0.00"
                                            className="bg-indigo-50 border-indigo-200 h-11 pl-10 font-black text-indigo-700 text-lg"
                                            value={formData.monto}
                                            onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                                        />
                                        <span className="absolute left-3 top-2.5 font-bold text-indigo-400 text-sm">C$</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-600 uppercase">Institución *</Label>
                                    <Select
                                        value={formData.institucion}
                                        onValueChange={(v) => setFormData({ ...formData, institucion: v as Institution })}
                                    >
                                        <SelectTrigger className="bg-slate-50 border-slate-200 h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GOBIERNO">Gobierno Regional</SelectItem>
                                            <SelectItem value="CONCEJO">Concejo Regional</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-600 uppercase">Cuenta Contable / Banco *</Label>
                                <Select
                                    value={formData.cuentaContable}
                                    onValueChange={(v) => setFormData({ ...formData, cuentaContable: v })}
                                >
                                    <SelectTrigger className="bg-slate-50 border-slate-200 h-11 pl-10">
                                        <Building2 className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                                        <SelectValue placeholder={loadingAccounts ? "Cargando cuentas..." : "Seleccione una cuenta"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bankAccounts.map((acc) => (
                                            <SelectItem key={acc.id} value={acc.accountNumber}>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-xs">{acc.accountName}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono">{acc.accountNumber} ({acc.bankName})</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Evidencias y Adjuntos */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Upload className="h-4 w-4 text-indigo-500" /> Evidencia Digital (SCAN)
                            </h3>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer group"
                            >
                                <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    {uploading ? <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" /> : <Upload className="h-8 w-8 text-slate-400" />}
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-slate-600 uppercase text-xs tracking-widest">Subir Imagen / PDF</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1">Suelte archivos o haga clic aquí (Max 10MB)</p>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*,application/pdf"
                                    multiple
                                    onChange={handleFileUpload}
                                />
                            </div>

                            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                {evidenciaUrls.map((url, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group animate-in fade-in slide-in-from-right-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                {url.toLowerCase().endsWith('.pdf') ? <FileIcon className="h-4 w-4 text-rose-500" /> : <ImageIcon className="h-4 w-4 text-indigo-500" />}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">
                                                Evidencia {index + 1}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                                            onClick={() => removeFile(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {evidenciaUrls.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-8 opacity-40">
                                        <AlertCircle className="h-8 w-8 text-slate-300 mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sin archivos adjuntos</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-emerald-600">
                            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 italic font-bold text-[10px]">
                                <CheckCircle2 className="h-3 w-3" /> Estado: Borrador (Pendiente Validación)
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl border-slate-200 font-bold px-6"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest px-8 shadow-lg"
                            >
                                {loading ? "Procesando..." : "Registrar Factura"}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
