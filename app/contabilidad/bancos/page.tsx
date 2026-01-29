"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Landmark, AlertTriangle, ShieldCheck, EyeOff } from "lucide-react"
import Link from "next/link"

import { toast } from "sonner"

export default function CuentasBancariasPage() {
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

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tesorería Institucional</h1>
                        <p className="text-slate-500 font-medium mt-1">Gestión y control de cuentas bancarias del GRACCNN</p>
                    </div>
                    <div className="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        Ambiente Seguro
                    </div>
                </div>

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
                            <div key={acc.id} onClick={() => window.location.href = `/contabilidad/bancos/${acc.id}`}>
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
                                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Saldo Disponible</p>
                                                        <p className={`text-lg font-bold ${acc.isActive ? 'text-slate-800' : 'text-slate-300'}`}>
                                                            {typeof acc.balance === 'number'
                                                                ? `C$ ${acc.balance.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                                : 'C$ 0.00'
                                                            }
                                                        </p>
                                                        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest flex items-center gap-1 justify-end mt-1">
                                                            <ShieldCheck className="h-3 w-3" /> Cuenta Operativa
                                                        </p>
                                                    </div>
                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 h-8 text-xs font-bold uppercase tracking-wide"
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
