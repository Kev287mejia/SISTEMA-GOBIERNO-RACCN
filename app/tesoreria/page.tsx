"use client"

export const dynamic = "force-dynamic";
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    Loader2, Search, Wallet, CheckCircle2, AlertTriangle,
    Landmark, ArrowRight, Printer, FileText
} from "lucide-react"
import { toast } from "sonner"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function TesoreriaPage() {
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCheck, setSelectedCheck] = useState<any>(null)
    const [openDialog, setOpenDialog] = useState(false)
    const [processing, setProcessing] = useState(false)

    // Form for Emission
    const [bankDetails, setBankDetails] = useState({
        banco: 'BANPRO',
        cuentaBancaria: '',
        numeroCheque: '' // Does this update Check Number? Usually Check Number is generated or manually set.
    })

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        setLoading(true)
        try {
            // Fetch REQUESTED + EMITIDO to show both
            const res = await fetch("/api/tesoreria/solicitudes")
            if (!res.ok) throw new Error("Error al cargar solicitudes")
            const data = await res.json()
            setRequests(data.data || [])
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar datos")
        } finally {
            setLoading(false)
        }
    }

    const handleEmitCheck = (check: any) => {
        setSelectedCheck(check)
        setBankDetails({ ...bankDetails, numeroCheque: check.numero }) // Pre-fill with request number or empty?
        setOpenDialog(true)
    }

    const submitEmission = async () => {
        if (!selectedCheck) return
        setProcessing(true)

        try {
            const res = await fetch(`/api/tesoreria/cheques/${selectedCheck.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    estado: 'EMITIDO',
                    banco: bankDetails.banco,
                    cuentaBancaria: bankDetails.cuentaBancaria,
                    // numero: bankDetails.numeroCheque ? // If we want to change number
                })
            })

            if (!res.ok) throw new Error("Error al emitir cheque")

            toast.success("Cheque emitido correctamente")
            setOpenDialog(false)
            fetchRequests()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message)
        } finally {
            setProcessing(false)
        }
    }

    const handleDeliverCheck = async (check: any) => {
        if (!confirm(`¿Confirmar entrega del cheque ${check.numero} al beneficiario?`)) return

        try {
            const res = await fetch(`/api/tesoreria/cheques/${check.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chequeEntregado: true,
                    observaciones: `Entregado el ${new Date().toLocaleDateString()}`
                })
            })
            if (!res.ok) throw new Error("Error al actualizar entrega")
            toast.success("Cheque marcado como ENTREGADO")
            fetchRequests()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    // Filter Logic
    const pendingRequests = requests.filter(r => r.estado === 'CHEQUE_REQUESTED')
    const emittedChecks = requests.filter(r => r.estado === 'EMITIDO' || r.estado === 'ENTREGADO')

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tesoreria</h1>
                        <p className="text-gray-500">Gestión de emisión y entrega de cheques</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={fetchRequests} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualizar"}
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="solicitudes" className="w-full">
                    <TabsList className="bg-white border p-1 rounded-xl h-auto shadow-sm">
                        <TabsTrigger value="solicitudes" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 py-2.5 px-6">
                            Solicitudes de Pago
                            {pendingRequests.length > 0 && (
                                <Badge variant="secondary" className="ml-2 bg-rose-100 text-rose-700 hover:bg-rose-100">{pendingRequests.length}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="emitidos" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 py-2.5 px-6">
                            Cheques Emitidos
                        </TabsTrigger>
                    </TabsList>

                    {/* PENDING REQUESTS TAB */}
                    <TabsContent value="solicitudes" className="mt-6">
                        <Card className="border-none shadow-md overflow-hidden">
                            <CardHeader className="bg-indigo-600 text-white py-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-indigo-200" /> Solicitudes Pendientes
                                </CardTitle>
                                <CardDescription className="text-indigo-100">
                                    Órdenes de compra completadas que requieren emisión de cheque
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {pendingRequests.length === 0 ? (
                                    <div className="p-12 text-center text-gray-400">
                                        <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p>No hay solicitudes pendientes</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {pendingRequests.map(req => (
                                            <div key={req.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">{req.numero}</span>
                                                        <span className="text-xs text-gray-400 font-medium">{formatDate(req.fecha)}</span>
                                                    </div>
                                                    <h3 className="font-bold text-gray-900">{req.beneficiario}</h3>
                                                    <p className="text-sm text-gray-500 line-clamp-1">{req.referencia}</p>

                                                    {req.purchaseOrder && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge variant="outline" className="text-[10px] bg-slate-50">OC: {req.purchaseOrder.numero}</Badge>
                                                            <Badge variant="outline" className="text-[10px] bg-slate-50">{req.purchaseOrder.budgetItem?.codigo}</Badge>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col items-end gap-3 min-w-[150px]">
                                                    <span className="text-xl font-black text-gray-900">{formatCurrency(req.monto)}</span>
                                                    <Button onClick={() => handleEmitCheck(req)} className="bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto shadow-sm">
                                                        <Wallet className="h-4 w-4 mr-2" /> Emitir Cheque
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* EMITTED CHECKS TAB */}
                    <TabsContent value="emitidos" className="mt-6">
                        <Card className="border-none shadow-md overflow-hidden">
                            <CardHeader className="bg-emerald-600 text-white py-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-200" /> Cheques Emitidos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-100">
                                    {emittedChecks.length === 0 ? (
                                        <div className="p-12 text-center text-gray-400">No hay cheques emitidos</div>
                                    ) : (
                                        emittedChecks.map(check => (
                                            <div key={check.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between items-center gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${check.chequeEntregado ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                                            {check.numero}
                                                        </span>
                                                        <span className="text-xs text-gray-400">{formatDate(check.fecha)}</span>
                                                    </div>
                                                    <h3 className="font-bold text-gray-900">{check.beneficiario}</h3>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Landmark className="h-3 w-3" /> {check.banco} • {check.cuentaBancaria}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="text-lg font-black text-gray-900">{formatCurrency(check.monto)}</div>
                                                        <Badge variant={check.chequeEntregado ? "secondary" : "outline"} className={check.chequeEntregado ? "bg-emerald-100 text-emerald-700" : "text-orange-600 border-orange-200 bg-orange-50"}>
                                                            {check.chequeEntregado ? "ENTREGADO" : "PENDIENTE ENTREGA"}
                                                        </Badge>
                                                    </div>

                                                    {!check.chequeEntregado && (
                                                        <Button variant="secondary" onClick={() => handleDeliverCheck(check)} title="Marcar como Entregado">
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon">
                                                        <Printer className="h-4 w-4 text-gray-400" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* EMISSION DIALOG */}
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Emitir Cheque</DialogTitle>
                            <DialogDescription>
                                Complete los datos bancarios para emitir el pago a <strong>{selectedCheck?.beneficiario}</strong>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="banco" className="text-right">Banco</Label>
                                <Input
                                    id="banco"
                                    value={bankDetails.banco}
                                    onChange={(e) => setBankDetails({ ...bankDetails, banco: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="cuenta" className="text-right">No. Cuenta</Label>
                                <Input
                                    id="cuenta"
                                    value={bankDetails.cuentaBancaria}
                                    onChange={(e) => setBankDetails({ ...bankDetails, cuentaBancaria: e.target.value })}
                                    className="col-span-3"
                                    placeholder="000-000000-0"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Monto</Label>
                                <div className="col-span-3 font-bold text-lg">{selectedCheck && formatCurrency(selectedCheck.monto)}</div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setOpenDialog(false)}>Cancelar</Button>
                            <Button onClick={submitEmission} disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                Confirmar Emisión
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </DashboardLayout>
    )
}
