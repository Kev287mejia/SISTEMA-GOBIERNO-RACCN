"use client"

export const dynamic = "force-dynamic";
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, Printer, Box, CheckCircle2, AlertTriangle, Truck, User, Wallet } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ReceptionActPrint } from "@/components/purchasing/reception-act-print"

export default function OrderDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [receiving, setReceiving] = useState(false)
    const [requestingPayment, setRequestingPayment] = useState(false)
    const [showPrint, setShowPrint] = useState(false)

    useEffect(() => {
        fetchOrder()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/compras/ordenes/${params.id}`)
            if (!res.ok) throw new Error("Error al cargar la orden")
            const data = await res.json()
            setOrder(data.data)
        } catch (error) {
            console.error(error)
            toast.error("No se pudo cargar la orden")
        } finally {
            setLoading(false)
        }
    }

    const handleReceiveOrder = async () => {
        if (!confirm("¿Está seguro de recibir esta orden en almacén? Esto afectará el inventario.")) return

        setReceiving(true)
        try {
            const res = await fetch("/api/compras/recepcion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.id }),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || "Error al recibir la orden")

            toast.success("Orden recibida correctamente en almacén")
            fetchOrder() // Refresh data
        } catch (error: any) {
            console.error(error)
            toast.error(error.message)
        } finally {
            setReceiving(false)
        }
    }

    const handleRequestPayment = async () => {
        if (!confirm("¿Solicitar emisión de cheque a Tesorería?")) return

        setRequestingPayment(true)
        try {
            const res = await fetch("/api/compras/solicitar-pago", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.id }),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || "Error al solicitar pago")

            toast.success("Solicitud enviada a Tesorería")
            fetchOrder()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message)
        } finally {
            setRequestingPayment(false)
        }
    }

    if (loading) return (
        <DashboardLayout>
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        </DashboardLayout>
    )

    if (!order) return (
        <DashboardLayout>
            <div className="p-8 text-center">Orden no encontrada</div>
        </DashboardLayout>
    )

    const isReceivable = order.estado === 'AUTORIZADO' || order.estado === 'ENVIADO_PROVEEDOR'
    const isCompleted = order.estado === 'COMPLETADO' || order.estado === 'PARCIALMENTE_RECIBIDO'

    // Check if payment already requested
    const paymentCheck = order.checks && order.checks.length > 0 ? order.checks[0] : null
    const isPaymentRequested = !!paymentCheck

    // Status Badge Logic
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'BORRADOR': return 'bg-gray-100 text-gray-600'
            case 'AUTORIZADO': return 'bg-emerald-100 text-emerald-700'
            case 'ENVIADO_PROVEEDOR': return 'bg-blue-100 text-blue-700'
            case 'COMPLETADO': return 'bg-purple-100 text-purple-700'
            case 'ANULADO': return 'bg-rose-100 text-rose-700'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    return (
        <DashboardLayout>
            {showPrint && <ReceptionActPrint order={order} onClose={() => setShowPrint(false)} />}

            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{order.numero}</h1>
                                <Badge className={`${getStatusColor(order.estado)} border-none`}>{order.estado}</Badge>
                                {isPaymentRequested && (
                                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 flex items-center gap-1">
                                        <Wallet className="h-3 w-3" /> Pago Solicitado
                                    </Badge>
                                )}
                            </div>
                            <p className="text-gray-500 font-medium text-sm flex items-center gap-2 mt-1">
                                <User className="h-3 w-3" /> Elaborado por: {order.elaboradoPor?.nombre} {order.elaboradoPor?.apellido}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {(isCompleted || isReceivable) && (
                            <Button variant="outline" className="gap-2" onClick={() => setShowPrint(true)}>
                                <Printer className="h-4 w-4" /> Imprimir Acta
                            </Button>
                        )}

                        {isReceivable && (
                            <Button
                                onClick={handleReceiveOrder}
                                disabled={receiving}
                                className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-lg shadow-indigo-200"
                            >
                                {receiving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Box className="h-4 w-4" />}
                                Recibir en Almacén
                            </Button>
                        )}

                        {isCompleted && !isPaymentRequested && (
                            <Button
                                onClick={handleRequestPayment}
                                disabled={requestingPayment}
                                className="bg-emerald-600 hover:bg-emerald-700 gap-2 shadow-lg shadow-emerald-200"
                            >
                                {requestingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                                Solicitar Pago
                            </Button>
                        )}

                        {isCompleted && isPaymentRequested && (
                            <Button variant="secondary" className="bg-slate-100 text-slate-500 gap-2 cursor-default border border-slate-200/50">
                                <CheckCircle2 className="h-4 w-4" /> En Tesorería
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content (Provider, Items) */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Provider Info */}
                        <Card className="border-none shadow-md overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b border-gray-100 py-4">
                                <CardTitle className="text-sm font-bold uppercase text-slate-500 flex items-center gap-2">
                                    <Truck className="h-4 w-4" /> Proveedor
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-[10px] uppercase font-bold text-gray-400">Razón Social</Label>
                                        <p className="font-bold text-gray-800">{order.proveedor?.nombre}</p>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] uppercase font-bold text-gray-400">RUC</Label>
                                        <p className="font-mono text-gray-600">{order.proveedor?.ruc}</p>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] uppercase font-bold text-gray-400">Dirección</Label>
                                        <p className="text-sm text-gray-600">{order.proveedor?.direccion || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] uppercase font-bold text-gray-400">Condiciones de Pago</Label>
                                        <p className="text-sm font-bold text-indigo-600">{order.condicionesPago?.replace(/_/g, ' ')}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Items Table */}
                        <Card className="border-none shadow-md overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b border-gray-100 py-4">
                                <CardTitle className="text-sm font-bold uppercase text-slate-500 flex items-center gap-2">
                                    <Box className="h-4 w-4" /> Detalles de la Compra
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50/50 text-xs uppercase font-bold text-gray-400 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Item</th>
                                            <th className="px-4 py-3 text-center">Cant.</th>
                                            <th className="px-4 py-3 text-right">Unitario</th>
                                            <th className="px-6 py-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {order.items?.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 font-medium text-gray-700">{item.descripcion}</td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">{item.cantidad} {item.unidadMedida}</span>
                                                </td>
                                                <td className="px-4 py-4 text-right font-mono text-gray-500">
                                                    {formatCurrency(item.precioUnitario)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-900">
                                                    {formatCurrency(item.total)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>

                        {/* Observations */}
                        {order.observaciones && (
                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800 flex gap-3">
                                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                                <div>
                                    <p className="font-bold mb-1">Observaciones</p>
                                    <p>{order.observaciones}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Financial Summary */}
                        <Card className="border-none shadow-lg bg-white">
                            <CardHeader className="py-4 border-b border-gray-50">
                                <CardTitle className="text-sm font-black uppercase text-gray-500">Resumen Económico</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-bold">{formatCurrency(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">IVA (Impuestos)</span>
                                    <span className="font-bold text-rose-500">+{formatCurrency(order.impuestos)}</span>
                                </div>
                                <div className="h-px bg-gray-100 my-2" />
                                <div className="flex justify-between text-xl font-black text-indigo-900">
                                    <span>Total</span>
                                    <span>{formatCurrency(order.total)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Budget Info */}
                        {order.budgetItem && (
                            <Card className="border-none shadow-sm bg-slate-50 border border-slate-100">
                                <CardContent className="p-4">
                                    <Label className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Financiamiento (Partida)</Label>
                                    <p className="text-xs font-bold text-slate-700">{order.budgetItem.codigo}</p>
                                    <p className="text-xs text-slate-500 line-clamp-2">{order.budgetItem.nombre}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Dates */}
                        <Card className="border-none shadow-sm bg-white border border-gray-100">
                            <CardContent className="p-4 space-y-3">
                                <div>
                                    <Label className="text-[10px] uppercase font-bold text-gray-400 block">Fecha Emisión</Label>
                                    <p className="text-sm font-medium">{new Date(order.fechaEmision).toLocaleDateString()}</p>
                                </div>
                                {order.fechaEntrega && (
                                    <div>
                                        <Label className="text-[10px] uppercase font-bold text-gray-400 block">Fecha Entrega / Recepción</Label>
                                        <p className="text-sm font-medium">{new Date(order.fechaEntrega).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
