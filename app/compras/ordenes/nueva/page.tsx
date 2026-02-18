"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, Save, Plus, Trash2, Truck, Calculator, Coins } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

type OrderItem = {
    descripcion: string
    cantidad: number
    precioUnitario: number
    unidadMedida: string
    descuento: number
    impuesto: number
    total: number
}

export default function NuevaOrdenPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [providers, setProviders] = useState<any[]>([])
    const [budgetItems, setBudgetItems] = useState<any[]>([])

    const [formData, setFormData] = useState({
        proveedorId: "",
        budgetItemId: "",
        fechaEmision: new Date().toISOString().split('T')[0],
        fechaEntrega: "",
        moneda: "NIO",
        condicionesPago: "CREDITO_30_DIAS",
        lugarEntrega: "Bodega Central",
        observaciones: "",
    })

    const [items, setItems] = useState<OrderItem[]>([
        { descripcion: "", cantidad: 1, unidadMedida: "UNIDAD", precioUnitario: 0, descuento: 0, impuesto: 0, total: 0 }
    ])

    useEffect(() => {
        // Fetch Providers
        fetch("/api/entities?type=PROVEEDOR")
            .then(res => res.json())
            .then(data => setProviders(data.data || []))
            .catch(err => console.error(err))

        // Fetch Budget Items (Active only)
        fetch("/api/budget/items")
            .then(res => res.json())
            .then(res => {
                const activeItems = (res.data || []).filter((i: any) => i.estado === 'APROBADO' || i.estado === 'EJECUCION' || i.estado === 'PLANIFICADO')
                setBudgetItems(activeItems)
            })
            .catch(err => console.error(err))
    }, [])

    const calculateItemTotal = (item: OrderItem) => {
        const sub = item.cantidad * item.precioUnitario
        const desc = sub * (item.descuento / 100)
        const taxable = sub - desc
        const tax = taxable * (item.impuesto / 100)
        return sub - desc + tax
    }

    const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
        const newItems = [...items]
        const item = { ...newItems[index], [field]: value }
        item.total = calculateItemTotal(item)
        newItems[index] = item
        setItems(newItems)
    }

    const addItem = () => {
        setItems([...items, { descripcion: "", cantidad: 1, unidadMedida: "UNIDAD", precioUnitario: 0, descuento: 0, impuesto: 15, total: 0 }])
    }

    const removeItem = (index: number) => {
        if (items.length === 1) return
        const newItems = items.filter((_, i) => i !== index)
        setItems(newItems)
    }

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0)
        const taxTotal = items.reduce((sum, item) => {
            const sub = item.cantidad * item.precioUnitario
            const desc = sub * (item.descuento / 100)
            return sum + ((sub - desc) * (item.impuesto / 100))
        }, 0)
        const discountTotal = items.reduce((sum, item) => sum + ((item.cantidad * item.precioUnitario) * (item.descuento / 100)), 0)

        return {
            subtotal,
            tax: taxTotal,
            discount: discountTotal,
            total: subtotal - discountTotal + taxTotal
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.proveedorId) {
            toast.error("Seleccione un proveedor")
            return
        }

        if (!formData.budgetItemId) {
            toast.error("Debe seleccionar una partida presupuestaria para certificar fondos")
            return
        }

        setLoading(true)

        try {
            const totals = calculateTotals()

            const res = await fetch("/api/compras/ordenes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    ...totals,
                    items
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Error al crear la orden")
            }

            toast.success("Orden de compra generada exitosamente")
            router.push("/compras")
            router.refresh()
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || "Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    const totals = calculateTotals()

    // Find selected budget item to show available balance
    const selectedBudget = budgetItems.find(b => b.id === formData.budgetItemId)
    const isBudgetExceeded = selectedBudget && totals.total > selectedBudget.montoDisponible

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Nueva Orden de Compra</h1>
                        <p className="text-gray-500 font-medium text-sm">
                            Documento formal de adquisición a proveedor externo
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-8">
                        {/* Header */}
                        <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                            <div className="h-2 bg-indigo-600 w-full" />
                            <CardHeader className="bg-gray-50/50 pb-6 border-b border-gray-100">
                                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-indigo-600" />
                                    Datos del Proveedor y Entrega
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-gray-500">Proveedor</Label>
                                        <Select
                                            value={formData.proveedorId}
                                            onValueChange={(val) => setFormData({ ...formData, proveedorId: val })}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Seleccione proveedor..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {providers.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.nombre} - {p.ruc}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-gray-500">Condiciones de Pago</Label>
                                        <Select
                                            value={formData.condicionesPago}
                                            onValueChange={(val) => setFormData({ ...formData, condicionesPago: val })}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CONTADO">De Contado</SelectItem>
                                                <SelectItem value="CREDITO_15_DIAS">Crédito 15 Días</SelectItem>
                                                <SelectItem value="CREDITO_30_DIAS">Crédito 30 Días</SelectItem>
                                                <SelectItem value="CONTRA_ENTREGA">Contra Entrega</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-gray-500">Fecha Emisión</Label>
                                        <Input
                                            type="date"
                                            className="h-11"
                                            value={formData.fechaEmision}
                                            onChange={(e) => setFormData({ ...formData, fechaEmision: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-gray-500">Fecha Entrega (Estimada)</Label>
                                        <Input
                                            type="date"
                                            className="h-11"
                                            value={formData.fechaEntrega}
                                            onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-gray-500">Moneda</Label>
                                        <Select
                                            value={formData.moneda}
                                            onValueChange={(val) => setFormData({ ...formData, moneda: val })}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NIO">Córdoba (C$)</SelectItem>
                                                <SelectItem value="USD">Dólar ($)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-6">
                                    <Label className="text-xs font-bold uppercase text-gray-500">Lugar de Entrega</Label>
                                    <Input
                                        value={formData.lugarEntrega}
                                        onChange={(e) => setFormData({ ...formData, lugarEntrega: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Items */}
                        <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                            <CardHeader className="bg-gray-50/50 pb-6 border-b border-gray-100 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-bold text-gray-800">Líneas de la Orden</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-100/50 text-xs uppercase font-bold text-gray-400">
                                            <tr>
                                                <th className="px-6 py-4 text-left w-[35%]">Descripción</th>
                                                <th className="px-2 py-4 text-center w-[10%]">Cant.</th>
                                                <th className="px-2 py-4 text-center w-[10%]">Unidad</th>
                                                <th className="px-2 py-4 text-right w-[15%]">Precio Unit.</th>
                                                <th className="px-2 py-4 text-right w-[10%]">Imp %</th>
                                                <th className="px-4 py-4 text-right w-[15%]">Total</th>
                                                <th className="px-2 py-4 w-[5%]"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {items.map((item, index) => (
                                                <tr key={index} className="group hover:bg-slate-50/50">
                                                    <td className="px-6 py-3">
                                                        <Input
                                                            value={item.descripcion}
                                                            onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                                                            className="border-transparent bg-transparent hover:bg-white focus:bg-white transition-all font-medium"
                                                            placeholder="Descripción del item"
                                                        />
                                                    </td>
                                                    <td className="px-2 py-3">
                                                        <Input
                                                            type="number"
                                                            value={item.cantidad}
                                                            onChange={(e) => handleItemChange(index, 'cantidad', parseFloat(e.target.value))}
                                                            className="border-transparent bg-transparent hover:bg-white focus:bg-white transition-all text-center"
                                                        />
                                                    </td>
                                                    <td className="px-2 py-3">
                                                        <Select
                                                            value={item.unidadMedida}
                                                            onValueChange={(val) => handleItemChange(index, 'unidadMedida', val)}
                                                        >
                                                            <SelectTrigger className="border-transparent bg-transparent hover:bg-white h-9 px-1">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="UNIDAD">Unidad</SelectItem>
                                                                <SelectItem value="CAJA">Caja</SelectItem>
                                                                <SelectItem value="SERVICIO">Servicio</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="px-2 py-3">
                                                        <Input
                                                            type="number"
                                                            value={item.precioUnitario}
                                                            onChange={(e) => handleItemChange(index, 'precioUnitario', parseFloat(e.target.value))}
                                                            className="border-transparent bg-transparent hover:bg-white focus:bg-white transition-all text-right font-mono"
                                                        />
                                                    </td>
                                                    <td className="px-2 py-3">
                                                        <Input
                                                            type="number"
                                                            value={item.impuesto}
                                                            onChange={(e) => handleItemChange(index, 'impuesto', parseFloat(e.target.value))}
                                                            className="border-transparent bg-transparent hover:bg-white focus:bg-white transition-all text-right text-xs"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-black text-gray-700">
                                                        {formatCurrency(item.total)}
                                                    </td>
                                                    <td className="px-2 py-3 text-center">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-rose-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100"
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
                                        Agregar Línea
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Totals & Actions */}
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex-1 space-y-6 w-full">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-gray-500">Observaciones</Label>
                                    <Textarea
                                        className="bg-white"
                                        value={formData.observaciones}
                                        onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Card className="w-full md:w-96 shadow-lg border-indigo-100 bg-white">
                                <CardHeader className="py-4 border-b border-gray-50">
                                    <CardTitle className="text-sm font-black uppercase text-gray-500 flex items-center gap-2">
                                        <Calculator className="h-4 w-4" /> Resumen Económico
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">

                                    {/* Budget Selection */}
                                    <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                                            <Coins className="h-3 w-3" /> Certificación Presupuestaria
                                        </Label>
                                        <Select
                                            value={formData.budgetItemId}
                                            onValueChange={(val) => setFormData({ ...formData, budgetItemId: val })}
                                        >
                                            <SelectTrigger className="h-9 bg-white text-xs">
                                                <SelectValue placeholder="Seleccione Partida..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {budgetItems.map(b => (
                                                    <SelectItem key={b.id} value={b.id} className="text-xs">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold">{b.codigo} - {b.nombre}</span>
                                                            <span className="text-[10px] text-slate-400">Disponible: {formatCurrency(b.montoDisponible)}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {selectedBudget && (
                                            <div className={`text-[10px] font-bold text-right ${isBudgetExceeded ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                {isBudgetExceeded ? '⚠️ Fondos Insuficientes' : '✅ Fondos Disponibles'}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Subtotal</span>
                                            <span className="font-bold">{formatCurrency(totals.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Descuento</span>
                                            <span className="text-emerald-600 font-bold">-{formatCurrency(totals.discount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">IVA (Impuesto)</span>
                                            <span className="text-rose-500 font-bold">+{formatCurrency(totals.tax)}</span>
                                        </div>
                                        <div className="h-px bg-gray-100 my-2" />
                                        <div className="flex justify-between text-lg font-black text-indigo-900">
                                            <span>TOTAL</span>
                                            <span>{formatCurrency(totals.total)}</span>
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={loading || isBudgetExceeded} className={`w-full ${isBudgetExceeded ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700'} mt-4 rounded-xl h-12 shadow-lg shadow-indigo-200 transition-all`}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Generando Orden...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Emitir Orden
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    )
}
