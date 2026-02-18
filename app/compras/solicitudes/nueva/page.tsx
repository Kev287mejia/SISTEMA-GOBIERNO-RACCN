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
import { Loader2, ArrowLeft, Save, Plus, Trash2, ShoppingBag } from "lucide-react"
import { toast } from "sonner"

type RequestItem = {
    descripcion: string
    cantidad: number
    unidadMedida: string
    estimadoUnitario: number
}

export default function NuevaSolicitudPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        departamento: "",
        prioridad: "NORMAL",
        justificacion: "",
    })

    const [items, setItems] = useState<RequestItem[]>([
        { descripcion: "", cantidad: 1, unidadMedida: "UNIDAD", estimadoUnitario: 0 }
    ])

    const handleItemChange = (index: number, field: keyof RequestItem, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)
    }

    const addItem = () => {
        setItems([...items, { descripcion: "", cantidad: 1, unidadMedida: "UNIDAD", estimadoUnitario: 0 }])
    }

    const removeItem = (index: number) => {
        if (items.length === 1) return
        const newItems = items.filter((_, i) => i !== index)
        setItems(newItems)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validations
        if (!formData.justificacion.trim()) {
            toast.error("La justificación es obligatoria")
            return
        }
        if (items.some(i => !i.descripcion.trim() || i.cantidad <= 0)) {
            toast.error("Revise los ítems de la solicitud")
            return
        }

        setLoading(true)

        try {
            const res = await fetch("/api/compras/solicitudes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    items
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Error al crear la solicitud")
            }

            toast.success("Solicitud de compra generada exitosamente")
            router.push("/compras")
            router.refresh()
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || "Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    const calculateTotalEstimated = () => {
        return items.reduce((sum, item) => sum + (item.cantidad * item.estimadoUnitario), 0)
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Nueva Requisición</h1>
                        <p className="text-gray-500 font-medium text-sm">
                            Solicitud de bienes o servicios (Plan Anual de Compras)
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-8">
                        {/* General Info */}
                        <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                            <div className="h-2 bg-indigo-500 w-full" />
                            <CardHeader className="bg-gray-50/50 pb-6 border-b border-gray-100">
                                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5 text-indigo-500" />
                                    Información General
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-gray-500">Departamento Solicitante</Label>
                                        <Input
                                            placeholder="Ej: Dirección de Informática"
                                            value={formData.departamento}
                                            onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-gray-500">Prioridad</Label>
                                        <Select
                                            value={formData.prioridad}
                                            onValueChange={(val) => setFormData({ ...formData, prioridad: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="BAJA">Baja</SelectItem>
                                                <SelectItem value="NORMAL">Normal</SelectItem>
                                                <SelectItem value="ALTA">Alta</SelectItem>
                                                <SelectItem value="URGENTE">Urgente</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-gray-500">Justificación de la Compra</Label>
                                    <Textarea
                                        placeholder="Describa para qué se utilizarán estos bienes y por qué son necesarios..."
                                        className="min-h-[100px]"
                                        value={formData.justificacion}
                                        onChange={(e) => setFormData({ ...formData, justificacion: e.target.value })}
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Items */}
                        <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                            <CardHeader className="bg-gray-50/50 pb-6 border-b border-gray-100 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-bold text-gray-800">Detalle de Bienes / Servicios</CardTitle>
                                <div className="text-sm font-medium text-gray-500">
                                    Total Estimado: <span className="text-emerald-600 font-bold ml-2">{calculateTotalEstimated().toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-100/50 text-xs uppercase font-bold text-gray-400">
                                            <tr>
                                                <th className="px-6 py-4 text-left w-[40%]">Descripción</th>
                                                <th className="px-4 py-4 text-center w-[15%]">Cantidad</th>
                                                <th className="px-4 py-4 text-center w-[15%]">Unidad</th>
                                                <th className="px-4 py-4 text-right w-[20%]">Estimado (C$)</th>
                                                <th className="px-4 py-4 w-[10%]"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {items.map((item, index) => (
                                                <tr key={index} className="group hover:bg-slate-50/50">
                                                    <td className="px-6 py-3">
                                                        <Input
                                                            value={item.descripcion}
                                                            onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                                                            placeholder="Ej: Laptop Dell Latitude 5420"
                                                            className="border-transparent bg-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-indigo-300 transition-all font-medium"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Input
                                                            type="number"
                                                            value={item.cantidad}
                                                            onChange={(e) => handleItemChange(index, 'cantidad', parseFloat(e.target.value))}
                                                            className="border-transparent bg-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-indigo-300 transition-all text-center"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Select
                                                            value={item.unidadMedida}
                                                            onValueChange={(val) => handleItemChange(index, 'unidadMedida', val)}
                                                        >
                                                            <SelectTrigger className="border-transparent bg-transparent hover:bg-white hover:border-gray-200 h-9">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="UNIDAD">Unidad</SelectItem>
                                                                <SelectItem value="CAJA">Caja</SelectItem>
                                                                <SelectItem value="PAQUETE">Paquete</SelectItem>
                                                                <SelectItem value="GALON">Galón</SelectItem>
                                                                <SelectItem value="SERVICIO">Servicio</SelectItem>
                                                                <SelectItem value="LB">Libra</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Input
                                                            type="number"
                                                            value={item.estimadoUnitario}
                                                            onChange={(e) => handleItemChange(index, 'estimadoUnitario', parseFloat(e.target.value))}
                                                            className="border-transparent bg-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-indigo-300 transition-all text-right font-mono text-gray-600"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-rose-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-4 bg-gray-50/30 border-t border-gray-100 text-center">
                                    <Button type="button" variant="outline" size="sm" onClick={addItem} className="border-dashed border-gray-300 text-gray-500 hover:border-indigo-300 hover:text-indigo-600">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar Ítem
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4">
                            <Button type="button" variant="ghost" onClick={() => router.back()} className="text-gray-500 hover:text-gray-900">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 shadow-lg shadow-indigo-100 rounded-xl">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Generar Requisición
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    )
}
