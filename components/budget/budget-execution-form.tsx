"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, DollarSign, Calendar, FileText, Receipt } from "lucide-react"

export function BudgetExecutionForm({
    budgetItemId,
    onSuccess
}: {
    budgetItemId: string,
    onSuccess: () => void
}) {
    const [accounts, setAccounts] = useState<any[]>([])
    const [accountsLoading, setAccountsLoading] = useState(true)
    const [accountsError, setAccountsError] = useState<string | null>(null)

    // Fetch accounts on mount
    useEffect(() => {
        console.log("[BUDGET_EXECUTION] Component mounted, fetching bank accounts...")
        setAccountsLoading(true)
        setAccountsError(null)

        fetch("/api/accounting/bank-accounts")
            .then(res => {
                console.log("[BUDGET_EXECUTION] Response status:", res.status)
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
                }
                return res.json()
            })
            .then(data => {
                console.log("[BUDGET_EXECUTION] Bank accounts data:", data)
                if (Array.isArray(data)) {
                    const activeAccounts = data.filter(a => a.isActive)
                    console.log("[BUDGET_EXECUTION] Active accounts:", activeAccounts.length)
                    setAccounts(activeAccounts)
                } else {
                    console.error("[BUDGET_EXECUTION] Data is not an array:", data)
                    setAccountsError("Formato de respuesta inválido")
                }
            })
            .catch(err => {
                console.error("[BUDGET_EXECUTION] Error fetching accounts:", err)
                setAccountsError(err.message || "Error al cargar cuentas")
            })
            .finally(() => {
                setAccountsLoading(false)
                console.log("[BUDGET_EXECUTION] Fetch complete")
            })
    }, [])

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        monto: "",
        bankAccountId: "",
        descripcion: "",
        referencia: "",
        mes: new Date().getMonth() + 1
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.monto || parseFloat(formData.monto) <= 0) {
            toast.error("El monto debe ser mayor a cero")
            return
        }
        if (!formData.bankAccountId) {
            toast.error("Debe seleccionar la cuenta bancaria de origen")
            return
        }

        // ... rest of submit logic
        setLoading(true)
        try {
            const res = await fetch("/api/budget/execution", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    budgetItemId,
                    monto: parseFloat(formData.monto),
                    bankAccountId: formData.bankAccountId, // New Field
                    descripcion: formData.descripcion,
                    referencia: formData.referencia,
                    mes: formData.mes
                })
            })
            // ... handling response
            if (res.ok) {
                toast.success("¡Ejecución registrada exitosamente!")
                onSuccess()
                setFormData({
                    monto: "",
                    bankAccountId: "",
                    descripcion: "",
                    referencia: "",
                    mes: new Date().getMonth() + 1
                })
            }
            // ... error handling
        } catch (error) {
            toast.error("Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <DollarSign className="h-3 w-3" />
                        Monto a Ejecutar (C$)
                    </Label>
                    <Input
                        required
                        type="number"
                        step="0.01"
                        value={formData.monto}
                        onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                        placeholder="0.00"
                        className="h-14 px-5 rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-blue-500 font-bold text-lg transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Periodo (Mes)
                    </Label>
                    <Select
                        value={formData.mes.toString()}
                        onValueChange={(val) => setFormData({ ...formData, mes: parseInt(val) })}
                    >
                        <SelectTrigger className="h-14 px-5 rounded-2xl border-slate-100 bg-slate-50 font-bold">
                            <SelectValue placeholder="Seleccione mes" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                            {/* ... months map ... */}
                            {meses.map((mes, idx) => (
                                <SelectItem key={idx + 1} value={(idx + 1).toString()}>
                                    {mes}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Bank Account Selector with Loading State */}
            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Receipt className="h-3 w-3" />
                    Fuente de Financiamiento (Cuenta Bancaria)
                </Label>
                <Select
                    value={formData.bankAccountId}
                    onValueChange={(val) => {
                        console.log("[BUDGET_EXECUTION] Selected account:", val)
                        setFormData({ ...formData, bankAccountId: val })
                    }}
                    disabled={accountsLoading}
                >
                    <SelectTrigger className="h-14 px-5 rounded-2xl border-slate-100 bg-slate-50 font-bold text-slate-700">
                        <SelectValue placeholder={
                            accountsLoading
                                ? "⏳ Cargando cuentas..."
                                : accountsError
                                    ? "❌ Error al cargar cuentas"
                                    : accounts.length === 0
                                        ? "⚠️ No hay cuentas disponibles"
                                        : "Seleccione la cuenta origen de los fondos"
                        } />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                        {accountsLoading ? (
                            <div className="p-4 text-center text-sm text-slate-500">
                                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                                Cargando cuentas bancarias...
                            </div>
                        ) : accountsError ? (
                            <div className="p-4 text-center text-sm text-red-500">
                                {accountsError}
                            </div>
                        ) : accounts.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">
                                No hay cuentas bancarias activas
                            </div>
                        ) : (
                            accounts.map((acc: any) => (
                                <SelectItem key={acc.id} value={acc.id}>
                                    <div className="flex flex-col">
                                        <span className="font-bold">{acc.bankName}</span>
                                        <span className="text-xs text-slate-500">{acc.accountNumber} - {acc.accountName}</span>
                                    </div>
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
                {!accountsLoading && !accountsError && accounts.length > 0 && (
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                        ✓ {accounts.length} cuenta{accounts.length !== 1 ? 's' : ''} disponible{accounts.length !== 1 ? 's' : ''}
                    </p>
                )}
                {accountsError && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                        Por favor, recargue la página o contacte al administrador
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    Descripción / Concepto del Gasto
                </Label>
                <Input
                    required
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Ej: Pago de planilla, Compra de equipos de oficina..."
                    className="h-14 px-5 rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-blue-500 font-medium transition-all"
                />
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Receipt className="h-3 w-3" />
                    Documento de Referencia (Opcional)
                </Label>
                <Input
                    value={formData.referencia}
                    onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                    placeholder="No. Factura, Orden de compra, Cheque, etc."
                    className="h-14 px-5 rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-blue-500 font-medium transition-all"
                />
            </div>

            <div className="pt-4 border-t border-slate-100">
                <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-200 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Procesando Ejecución...
                        </>
                    ) : (
                        <>
                            <DollarSign className="mr-2 h-5 w-5" />
                            Ejecutar Presupuesto
                        </>
                    )}
                </Button>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                    💡 Nota Importante
                </p>
                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    Esta acción registrará el gasto y actualizará automáticamente el saldo disponible de la partida presupuestaria.
                </p>
            </div>
        </form>
    )
}
