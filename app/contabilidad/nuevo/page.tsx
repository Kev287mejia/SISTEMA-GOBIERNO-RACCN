"use client"

export const dynamic = "force-dynamic";
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, Save, Paperclip, Sparkles, Check } from "lucide-react"
import { toast } from "sonner"
import { EvidenceUploader } from "@/components/accounting/evidence-uploader"
import { requiresEvidence, canApproveEntry } from "@/lib/evidence-config"

export default function NuevoAsientoPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [budgetItems, setBudgetItems] = useState<any[]>([])
    const [formData, setFormData] = useState({
        tipo: "INGRESO",
        fecha: new Date().toISOString().split('T')[0],
        descripcion: "",
        monto: "",
        institucion: "GOBIERNO",
        cuentaContable: "",
        centroCosto: "",
        proyecto: "",
        documentoRef: "",
        observaciones: "",
        evidenciaUrls: [] as string[],
        budgetItemId: "",
        renglonGasto: ""
    })

    const [suggestion, setSuggestion] = useState<any>(null)
    const [isThinking, setIsThinking] = useState(false)

    useEffect(() => {
        fetch("/api/budget/items")
            .then(res => res.json())
            .then(json => setBudgetItems(json.data || []))
            .catch(err => console.error("Error fetching budget items:", err))
    }, [])

    // Intelligent Assistant logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (formData.descripcion.length > 3) { // Lowered to 3 for faster feedback
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
        }, 800)

        return () => clearTimeout(timer)
    }, [formData.descripcion])

    const applySuggestion = () => {
        if (suggestion) {
            setFormData(prev => ({ ...prev, cuentaContable: suggestion.code }))
            setSuggestion(null)
            toast.success("Cuenta contable sugerida aplicada", {
                icon: <Sparkles className="h-4 w-4 text-amber-500" />
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/accounting-entries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    monto: parseFloat(formData.monto),
                    fecha: new Date(formData.fecha) // API expects Date object or ISO string
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Error al crear el asiento")
            }

            toast.success("Asiento contable registrado exitosamente")
            router.push("/contabilidad")
            router.refresh()
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || "Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData({
            ...formData,
            [name]: value
        })
    }

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Nuevo Asiento</h1>
                        <p className="text-gray-500 font-medium text-sm">
                            Registro de movimiento en el Libro Diario
                        </p>
                    </div>
                </div>

                <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                    <div className="h-2 bg-indigo-500 w-full" />
                    <CardHeader className="bg-gray-50/50 pb-6 border-b border-gray-100">
                        <CardTitle className="text-lg font-bold text-gray-800">Detalles de la Operación</CardTitle>
                        <CardDescription className="font-medium text-xs uppercase tracking-wider text-gray-400">
                            La información será auditada automáticamente
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="tipo" className="text-xs font-bold uppercase text-gray-500">Tipo de Movimiento</Label>
                                    <Select
                                        value={formData.tipo}
                                        onValueChange={(val) => handleSelectChange("tipo", val)}
                                    >
                                        <SelectTrigger id="tipo" className="h-11 bg-gray-50/50 border-gray-200">
                                            <SelectValue placeholder="Seleccione tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INGRESO">INGRESO (Crédito)</SelectItem>
                                            <SelectItem value="EGRESO">EGRESO (Débito)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fecha" className="text-xs font-bold uppercase text-gray-500">Fecha Contable</Label>
                                    <Input
                                        id="fecha"
                                        type="date"
                                        name="fecha"
                                        required
                                        className="h-11 bg-gray-50/50 border-gray-200 block"
                                        value={formData.fecha}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="monto" className="text-xs font-bold uppercase text-gray-500">Monto (C$)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">C$</span>
                                        <Input
                                            id="monto"
                                            type="number"
                                            step="0.01"
                                            name="monto"
                                            placeholder="0.00"
                                            required
                                            className="h-11 pl-10 bg-gray-50/50 border-gray-200 font-mono font-bold text-lg"
                                            value={formData.monto}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="institucion" className="text-xs font-bold uppercase text-gray-500">Institución</Label>
                                    <Select
                                        value={formData.institucion}
                                        onValueChange={(val) => handleSelectChange("institucion", val)}
                                    >
                                        <SelectTrigger id="institucion" className="h-11 bg-gray-50/50 border-gray-200">
                                            <SelectValue placeholder="Seleccione entidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GOBIERNO">GOBIERNO REGIONAL</SelectItem>
                                            <SelectItem value="CONCEJO">CONSEJO REGIONAL</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="descripcion" className="text-xs font-bold uppercase text-gray-500 tracking-widest">Concepto de Pago / Operación *</Label>
                                <Textarea
                                    id="descripcion"
                                    name="descripcion"
                                    required
                                    className="min-h-[100px] bg-gray-50/50 border-transparent focus:bg-white focus:border-indigo-200 transition-all rounded-xl shadow-inner-sm text-sm"
                                    placeholder="Ej: Pago de energía eléctrica correspondiente al mes de..."
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                />

                                {/* Assistant UI */}
                                {suggestion && (
                                    <div
                                        onClick={applySuggestion}
                                        className="mt-2 bg-amber-50 border border-amber-100 p-2.5 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-all shadow-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="bg-amber-500 p-1.5 rounded-lg">
                                                <Sparkles className="h-3 w-3 text-white" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase text-amber-700 leading-none tracking-tighter">Asistente de Cuentas</span>
                                                <span className="text-xs font-bold text-slate-700 mt-0.5">{suggestion.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 uppercase">
                                            <span>Auto-Clasificar</span>
                                            <Check className="h-3 w-3" />
                                        </div>
                                    </div>
                                )}
                                {isThinking && (
                                    <div className="mt-2 flex items-center gap-2 opacity-50 px-2">
                                        <Loader2 className="h-3 w-3 text-indigo-500 animate-spin" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analizando concepto...</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 space-y-6">
                                <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                                    Clasificación Contable
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="cuentaContable" className="text-xs font-bold uppercase text-indigo-900/60">Cuenta Contable</Label>
                                        <Input
                                            id="cuentaContable"
                                            name="cuentaContable"
                                            required
                                            placeholder="Ej: 1-1-01-001"
                                            className="h-11 bg-white border-indigo-100 focus:border-indigo-300 font-mono text-sm"
                                            value={formData.cuentaContable}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="centroCosto" className="text-xs font-bold uppercase text-indigo-900/60">Centro de Costo</Label>
                                        <Input
                                            id="centroCosto"
                                            name="centroCosto"
                                            placeholder="Opcional"
                                            className="h-11 bg-white border-indigo-100 focus:border-indigo-300"
                                            value={formData.centroCosto}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="budgetItemId" className="text-xs font-bold uppercase text-indigo-900/60">Partida Presupuestaria</Label>
                                        <Select
                                            value={formData.budgetItemId}
                                            onValueChange={(val) => handleSelectChange("budgetItemId", val)}
                                        >
                                            <SelectTrigger id="budgetItemId" className="h-11 bg-white border-indigo-100">
                                                <SelectValue placeholder="Seleccione partida" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Ninguna (Uso de Fondo General)</SelectItem>
                                                {budgetItems.map(item => (
                                                    <SelectItem key={item.id} value={item.id}>
                                                        {item.codigo} - {item.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="renglonGasto" className="text-xs font-bold uppercase text-indigo-900/60">Renglón de Gasto</Label>
                                        <Input
                                            id="renglonGasto"
                                            name="renglonGasto"
                                            placeholder="Ej: 211"
                                            className="h-11 bg-white border-indigo-100 focus:border-indigo-300"
                                            value={formData.renglonGasto}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="proyecto" className="text-xs font-bold uppercase text-indigo-900/60">Proyecto / Actividad</Label>
                                        <Input
                                            id="proyecto"
                                            name="proyecto"
                                            placeholder="Opcional"
                                            className="h-11 bg-white border-indigo-100 focus:border-indigo-300"
                                            value={formData.proyecto}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="documentoRef" className="text-xs font-bold uppercase text-indigo-900/60">Doc. Referencia / Folio</Label>
                                        <Input
                                            id="documentoRef"
                                            name="documentoRef"
                                            placeholder="Ej: CH-4502"
                                            className="h-11 bg-white border-indigo-100 focus:border-indigo-300"
                                            value={formData.documentoRef}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Evidence Information */}
                            {parseFloat(formData.monto) >= 5000 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-amber-500 p-2 rounded-lg flex-shrink-0">
                                            <Paperclip className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase text-amber-900 tracking-widest mb-1">
                                                Evidencia Documental Requerida
                                            </p>
                                            <p className="text-xs text-amber-700 font-medium">
                                                Este asiento requiere documentos de respaldo (factura, resolución, etc.)
                                                antes de poder ser aprobado. Podrá adjuntarlos después de guardar el asiento
                                                haciendo clic en el número de asiento desde el Libro Mayor.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="observaciones" className="text-xs font-bold uppercase text-gray-400">Observaciones (Internas)</Label>
                                <Input
                                    id="observaciones"
                                    name="observaciones"
                                    className="h-11 bg-gray-50/30 border-gray-100 text-gray-500"
                                    placeholder="Notas adicionales..."
                                    value={formData.observaciones}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 mt-8">
                                <Button type="button" variant="ghost" onClick={() => router.back()} className="text-gray-500 hover:text-gray-900">
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 h-11 px-8 shadow-lg shadow-indigo-100">
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Guardar Asiento
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
