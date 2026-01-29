"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Landmark, TrendingUp, TrendingDown, DollarSign, Calendar, FileText, Plus, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export default function BankAccountDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [data, setData] = useState<any>(null)
    const [movements, setMovements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Manual Transaction State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [trxForm, setTrxForm] = useState({
        type: "DEPOSIT",
        amount: "",
        description: "",
        reference: "",
        date: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
        if (params.id) {
            fetch(`/api/accounting/bank-accounts/${params.id}/details`)
                .then(res => res.json())
                .then(serverData => {
                    setData(serverData)
                    if (serverData?.movements) setMovements(serverData.movements)
                })
                .catch(console.error)
                .finally(() => setLoading(false))
        }
    }, [params.id])

    const handleReconcile = async (checkId: string, checked: boolean) => {
        // Optimistic update
        setMovements(prev => prev.map(m =>
            m.id === checkId ? { ...m, isReconciled: checked } : m
        ))

        try {
            const res = await fetch("/api/accounting/reconcile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ checkId, isReconciled: checked })
            })
            if (!res.ok) throw new Error("Failed")
        } catch (e) {
            // Revert
            setMovements(prev => prev.map(m =>
                m.id === checkId ? { ...m, isReconciled: !checked } : m
            ))
        }
    }

    const handleCreateTransaction = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await fetch(`/api/accounting/bank-accounts/${params.id}/transactions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(trxForm)
            })
            if (!res.ok) throw new Error("Error creating transaction")

            // Success
            setIsDialogOpen(false)
            setTrxForm({ type: "DEPOSIT", amount: "", description: "", reference: "", date: new Date().toISOString().split('T')[0] })

            // Refresh Data
            window.location.reload()

        } catch (error) {
            console.error(error)
            alert("Error al registrar movimiento")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-96 items-center justify-center">
                    <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Cargando detalles...</p>
                </div>
            </DashboardLayout>
        )
    }

    if (!data || data.error) {
        return (
            <DashboardLayout>
                <div className="p-10 text-center">
                    <h2 className="text-xl font-bold text-red-500">Cuenta no encontrada</h2>
                    <Button onClick={() => router.back()} className="mt-4" variant="outline">Regresar</Button>
                </div>
            </DashboardLayout>
        )
    }

    const { account, stats } = data

    return (
        <DashboardLayout>
            {/* Modal Overlay */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 m-4 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-800">Registrar Movimiento Manual</h3>
                            <button onClick={() => setIsDialogOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTransaction} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Tipo Movimiento</label>
                                    <select
                                        className="w-full p-2 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-emerald-500"
                                        value={trxForm.type}
                                        onChange={e => setTrxForm({ ...trxForm, type: e.target.value })}
                                    >
                                        <option value="DEPOSIT">Depósito (Ingreso)</option>
                                        <option value="CREDIT_NOTE">Nota de Crédito (Ingreso)</option>
                                        <option value="TRANSFER_IN">Transferencia Recibida</option>
                                        <option value="DEBIT_NOTE">Nota de Débito (Cargo/Egreso)</option>
                                        <option value="WITHDRAWAL">Retiro / Extracción</option>
                                        <option value="TRANSFER_OUT">Transferencia Enviada</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Fecha</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full p-2 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-emerald-500"
                                        value={trxForm.date}
                                        onChange={e => setTrxForm({ ...trxForm, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Monto</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        placeholder="0.00"
                                        className="w-full pl-9 p-2 border border-slate-200 rounded-lg font-bold text-lg text-slate-900 focus:outline-emerald-500"
                                        value={trxForm.amount}
                                        onChange={e => setTrxForm({ ...trxForm, amount: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Descripción / Concepto</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Transferencia Ministerio Hacienda"
                                    className="w-full p-2 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-emerald-500"
                                    value={trxForm.description}
                                    onChange={e => setTrxForm({ ...trxForm, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Referencia (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Boleta #123456"
                                    className="w-full p-2 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-emerald-500"
                                    value={trxForm.reference}
                                    onChange={e => setTrxForm({ ...trxForm, reference: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-emerald-600 transition flex items-center justify-center gap-2"
                                >
                                    {submitting ? 'Guardando...' : 'Registrar Movimiento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in duration-500 pb-10">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10 bg-white border border-slate-200">
                            <ArrowLeft className="h-5 w-5 text-slate-500" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{account.bankName}</h1>
                                <Badge className={account.isActive ? 'bg-emerald-500' : 'bg-amber-500'}>
                                    {account.isActive ? 'ACTIVA' : 'INACTIVA'}
                                </Badge>
                            </div>
                            <p className="text-lg font-mono font-medium text-slate-500 mt-1">
                                {account.accountNumber}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => window.print()}
                            className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Certificación
                        </Button>
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Registrar Movimiento
                        </Button>
                    </div>
                </div>

                {/* Printable Certification Document (Hidden on Screen) */}
                <div className="hidden print:block absolute inset-0 bg-white z-[9999] p-20 text-black">
                    <div className="text-center mb-12">
                        <h1 className="text-2xl font-black uppercase mb-1">Alcaldía Municipal</h1>
                        <h2 className="text-xl font-bold text-slate-600 uppercase">Tesorería Municipal</h2>
                        <div className="w-32 h-1 bg-black mx-auto mt-4 mb-8"></div>
                    </div>

                    <div className="max-w-2xl mx-auto space-y-8 text-justify font-serif text-lg leading-relaxed">
                        <p className="text-right font-bold italic mb-12">
                            {new Date().toLocaleDateString('es-NI', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>

                        <h3 className="text-center font-bold text-xl uppercase underline mb-8">CERTIFICACIÓN DE DISPONIBILIDAD FINANCIERA</h3>

                        <p>
                            El Suscrito Responsable de Tesorería de la Alcaldía Municipal, por medio de la presente
                            <strong> CERTIFICA</strong> que la cuenta bancaria <strong>{account.bankName}</strong> número <strong>{account.accountNumber}</strong>
                            a nombre de esta municipalidad, presenta al día de hoy un saldo disponible de:
                        </p>

                        <p className="text-center text-3xl font-black py-8 border-y-2 border-slate-100 italic">
                            C$ {stats.balance.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                        </p>

                        <p>
                            Se extiende la presente para los fines que a la Alcaldesa Municipal estime conveniente.
                        </p>

                        <div className="mt-32 text-center">
                            <div className="w-64 border-t-2 border-black mx-auto mb-2"></div>
                            <p className="font-bold">Lic. Tesorero Municipal</p>
                            <p className="text-sm">Tesorería Municipal</p>
                        </div>
                    </div>
                </div>


                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-lg shadow-blue-100 bg-gradient-to-br from-blue-600 to-blue-700 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <Landmark className="h-32 w-32" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-100 uppercase tracking-widest">Saldo Disponible</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black tracking-tight">
                                C$ {stats.balance.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-blue-200 mt-2 font-medium">Calculado al instante</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg shadow-emerald-50 bg-white">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ingresos Totales</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                +{stats.totalIncome.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg shadow-red-50 bg-white">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Egresos Totales</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                                <TrendingDown className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                -{stats.totalExpense.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Movements Table */}
                <Card className="border-none shadow-xl shadow-slate-100/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-500" />
                            Movimientos y Conciliación
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {movements.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <p className="text-sm font-medium uppercase tracking-widest">No hay movimientos registrados</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[50px] text-center">✔</TableHead>
                                        <TableHead className="w-[150px]">Fecha</TableHead>
                                        <TableHead>Referencia</TableHead>
                                        <TableHead>Concepto / Beneficiario</TableHead>
                                        <TableHead className="text-right">Monto</TableHead>
                                        <TableHead className="text-right">Saldo Libros</TableHead>
                                        <TableHead className="w-[100px] text-center">Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {movements.map((move: any) => (
                                        <TableRow key={move.id} className={`group border-b border-slate-100 transition-colors ${move.isReconciled ? 'bg-emerald-50/60 hover:bg-emerald-100/50' : 'hover:bg-slate-50'}`}>
                                            <TableCell className="text-center">
                                                <Checkbox
                                                    checked={move.isReconciled}
                                                    onCheckedChange={(checked) => handleReconcile(move.id, checked as boolean)}
                                                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(move.date).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs font-bold text-slate-600">
                                                {move.reference}
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-800">
                                                {move.description}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className={`font-bold ${move.type === 'DEBIT' ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    {move.type === 'DEBIT' ? '-' : '+'}
                                                    {move.amount.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-xs font-bold text-slate-500 bg-white/50 rounded-sm px-2">
                                                C$ {move.balanceAfter.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="text-[10px]">
                                                    {/* Translate status mostly for Manual Transactions where we put 'REGISTRADO' */}
                                                    {move.category === 'TRANSACTION' ? 'MANUAL' : move.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
