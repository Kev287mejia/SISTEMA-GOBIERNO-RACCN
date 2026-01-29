"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, Save, Paperclip } from "lucide-react"
import { toast } from "sonner"
import { FileUploader } from "@/components/ui/file-uploader"

export default function NuevoAsientoPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
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
        evidenciaUrls: [] as string[]
    })

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
                                <Label htmlFor="descripcion" className="text-xs font-bold uppercase text-gray-500">Descripción de la Operación</Label>
                                <Textarea
                                    id="descripcion"
                                    name="descripcion"
                                    required
                                    className="min-h-[100px] bg-gray-50/50 border-gray-200 resize-none"
                                    placeholder="Detalle el motivo del asiento..."
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                />
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
                                        <Label htmlFor="proyecto" className="text-xs font-bold uppercase text-indigo-900/60">Proyecto</Label>
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
                                        <Label htmlFor="documentoRef" className="text-xs font-bold uppercase text-indigo-900/60">Doc. Referencia</Label>
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

                            <div className="space-y-2">
                                <Label htmlFor="evidencia" className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
                                    <Paperclip className="h-3.5 w-3.5" /> Soporte Digital (Evidencia)
                                </Label>
                                <div className="bg-white p-1 border border-gray-100 rounded-xl">
                                    <FileUploader
                                        value={formData.evidenciaUrls}
                                        onChange={(urls) => setFormData({ ...formData, evidenciaUrls: urls })}
                                    />
                                </div>
                            </div>

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
