"use client"

export const dynamic = "force-dynamic";
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Landmark, AlertTriangle, ShieldCheck, EyeOff, TrendingUp, ArrowDownRight, Wallet, Activity } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

import { toast } from "sonner"

export default function CuentasBancariasPage() {
    const router = useRouter()
    const [accounts, setAccounts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/accounting/bank-accounts")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setAccounts(data)
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const handleAction = async (id: string, action: "ACTIVATE" | "DEACTIVATE") => {
        const isActivate = action === "ACTIVATE"
        const promise = fetch(`/api/accounting/bank-accounts/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action })
        }).then(async (res) => {
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.error || "Error en la operación")
            }
            const data = await res.json()
            return data
        })

        toast.promise(promise, {
            loading: isActivate ? 'Activando cuenta...' : 'Desactivando cuenta...',
            success: (data) => {
                setAccounts(prev => prev.map(acc =>
                    acc.id === id ? {
                        ...acc,
                        status: isActivate ? "ACTIVE" : "INACTIVE",
                        isActive: isActivate
                    } : acc
                ))
                return isActivate ? '¡Cuenta activada!' : 'Cuenta desactivada correctamente.'
            },
            error: (err) => `Error: ${err.message}`,
        })
    }

    const totals = accounts.reduce((acc, curr) => ({
        bankTotal: acc.bankTotal + (curr.bankBalance || 0),
        floatingTotal: acc.floatingTotal + (curr.floatingWithdrawals || 0),
        projectedTotal: acc.projectedTotal + (curr.projectedBalance || 0),
    }), { bankTotal: 0, floatingTotal: 0, projectedTotal: 0 })

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Tesorería Institucional</h1>
                        <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-indigo-500" />
                            Control de liquidez real y conciliación bancaria
                        </p>
                    </div>
                </div>

                {/* Dashboard de Saldos Proyectados */}
                {!loading && accounts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-none shadow-xl bg-white overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200" />
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                    <Landmark className="h-3 w-3" /> Saldo Total en Bancos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-slate-900">{formatCurrency(totals.bankTotal)}</div>
                                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase italic">Cifra según extractos conciliados</p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl bg-white overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-black uppercase text-amber-600 tracking-widest flex items-center gap-2">
                                    <TrendingUp className="h-3 w-3" /> Cheques Flotantes (Por Cobrar)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-amber-600">-{formatCurrency(totals.floatingTotal)}</div>
                                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase italic">Pagos emitidos pendientes de cobro</p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl bg-indigo-950 text-white overflow-hidden relative group">
                            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 transition-transform group-hover:scale-110">
                                <Wallet className="h-32 w-32" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-black uppercase text-indigo-300 tracking-widest flex items-center gap-2">
                                    <ShieldCheck className="h-3 w-3" /> Disponibilidad Real Proyectada
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl lg:text-3xl font-black text-white tracking-tighter truncate" title={formatCurrency(totals.projectedTotal)}>
                                    {formatCurrency(totals.projectedTotal)}
                                </div>
                                <p className="text-[10px] text-indigo-400 mt-2 font-black uppercase tracking-widest">Saldo neto utilizable</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid gap-6">
                    {loading ? (
                        <p className="text-center py-10 text-slate-400 font-bold uppercase text-xs tracking-widest animate-pulse">Cargando información bancaria...</p>
                    ) : accounts.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                            <div className="h-20 w-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Landmark className="h-10 w-10" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Sin Cuentas Registradas</h3>
                            <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto mt-2">
                                No se encontraron cuentas bancarias visibles para su nivel de acceso.
                            </p>
                        </div>
                    ) : (
                        accounts.map((acc) => (
                            <div key={acc.id} onClick={() => router.push(`/contabilidad/bancos/${acc.id}`)}>
                                <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden relative group cursor-pointer hover:scale-[1.01] transition-all">
                                    <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors duration-300 ${acc.isActive ? 'bg-emerald-500' : 'bg-slate-300 group-hover:bg-amber-400'}`} />
                                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                        <div className="flex items-start gap-5">
                                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ${acc.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                                <Landmark className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-xl font-black text-slate-900">{acc.bankName}</h3>
                                                    <Badge variant="outline" className={`font-bold text-[10px] uppercase tracking-widest ${acc.isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                                                        {acc.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-2xl font-mono font-bold text-slate-700 tracking-wider">
                                                    {acc.accountNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1 $2 $3 $4")}
                                                </p>
                                                {acc.evidenceUrls && acc.evidenceUrls.length > 0 && (
                                                    <div className="flex items-center gap-1.5 mt-2">
                                                        <Badge variant="outline" className="text-[10px] border-indigo-200 bg-indigo-50 text-indigo-700">
                                                            📎 {acc.evidenceUrls.length} documento{acc.evidenceUrls.length !== 1 ? 's' : ''}
                                                        </Badge>
                                                    </div>
                                                )}
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-1.5 group-hover:text-indigo-500 transition-colors">
                                                    <EyeOff className="h-3 w-3" /> Ver Detalle de Movimientos
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 min-w-[200px]">
                                            {!acc.isActive ? (
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
                                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                                        <span className="text-[10px] font-bold text-amber-700 uppercase">Requiere Validación</span>
                                                    </div>
                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            size="sm"
                                                            className="bg-slate-900 text-white hover:bg-emerald-600 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleAction(acc.id, "ACTIVATE")
                                                            }}
                                                        >
                                                            Activar Cuenta
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Saldo Proyectado (Real)</p>
                                                        <p className={`text-xl font-black ${acc.isActive ? 'text-indigo-600' : 'text-slate-300'}`}>
                                                            {formatCurrency(acc.projectedBalance || 0)}
                                                        </p>
                                                        <div className="flex flex-col items-end mt-1 text-[9px] font-bold uppercase tracking-tighter">
                                                            <div className="flex items-center gap-1 text-slate-400">
                                                                <span>Banco:</span>
                                                                <span className="text-slate-600">{formatCurrency(acc.bankBalance || 0)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-amber-500">
                                                                <span>Flotante:</span>
                                                                <span>-{formatCurrency(acc.floatingWithdrawals || 0)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-100 h-8 text-[10px] font-black uppercase tracking-wide px-3 rounded-lg"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                router.push(`/contabilidad/bancos/${acc.id}/reconciliation`)
                                                            }}
                                                        >
                                                            Auto-Conciliación
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 border-red-50 h-8 text-[10px] font-bold uppercase tracking-wide px-2 rounded-lg"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleAction(acc.id, "DEACTIVATE")
                                                            }}
                                                        >
                                                            Desactivar
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout >
    )
}
