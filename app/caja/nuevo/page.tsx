"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Landmark, DollarSign, User, Calendar, FileText, Calculator, Building } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

function NuevoChequeForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const entryId = searchParams.get("entryId")

    const [entry, setEntry] = useState<any>(null)
    const [bankAccounts, setBankAccounts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        numero: "",
        banco: "BANPRO",
        cuentaBancaria: "",
        beneficiario: "",
        monto: 0,
        fecha: new Date().toISOString().split('T')[0],
        referencia: ""
    })

    useEffect(() => {
        // Fetch bank accounts first
        fetch("/api/accounting/bank-accounts")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setBankAccounts(data)
                    // If there's at least one account, pre-select it
                    if (data.length > 0) {
                        setFormData(prev => ({
                            ...prev,
                            cuentaBancaria: data[0].accountNumber,
                            banco: data[0].bankName
                        }))
                    }
                }
            })
            .catch(console.error)

        if (entryId) {
            fetch(`/api/accounting-entries/${entryId}`)
                .then(res => res.json())
                .then(json => {
                    const data = json.data || json
                    if (data.error) {
                        toast.error(data.error)
                        return
                    }
                    setEntry(data)
                    setFormData(prev => ({
                        ...prev,
                        monto: data.monto ? Number(data.monto) : 0,
                        beneficiario: data.descripcion ? data.descripcion.split('-')[0].trim() : "",
                        referencia: data.numero || ""
                    }))
                })
                .catch(console.error)
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [entryId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const res = await fetch("/api/accounting/checks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, accountingEntryId: entryId })
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Error al generar cheque")
            }

            toast.success("Cheque generado exitosamente")
            router.push("/caja")
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-20 text-center animate-pulse font-black text-slate-400 italic">CARGANDO DATOS...</div>

    return (
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white max-w-4xl mx-auto">
            <div className="bg-slate-900 p-8 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Landmark className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">Emisión de Orden de Pago</h2>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Vínculo Contable: {entry?.numero || 'Registro Manual'}</p>
                </div>
            </div>

            <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Entry Info summary */}
                    <div className="bg-slate-50 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center border border-slate-100 mb-8">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Concepto Contable</p>
                            <p className="font-bold text-slate-700">{entry?.descripcion || 'Sin descripción'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-slate-400">Importe Autorizado</p>
                            <p className="text-2xl font-black text-indigo-600">{formatCurrency(entry?.monto || 0)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Section Left: Check Details */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                    <Calculator className="h-3 w-3" /> Número de Cheque
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: 000123"
                                    className="w-full bg-slate-50 border border-slate-100 h-12 rounded-xl px-4 font-black uppercase text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    value={formData.numero}
                                    onChange={e => setFormData({ ...formData, numero: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                    <Landmark className="h-3 w-3" /> Entidad Bancaria
                                </label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-100 h-12 rounded-xl px-4 font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    value={formData.banco}
                                    onChange={e => setFormData({ ...formData, banco: e.target.value })}
                                >
                                    <option value="BANPRO">BANPRO (Banco de la Producción)</option>
                                    <option value="BDF">BDF (Banco de Finanzas)</option>
                                    <option value="BAC">BAC CREDOMATIC</option>
                                    <option value="LA_FISE">LA FISE BANCENTRO</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                    <Building className="h-3 w-3" /> Seleccionar Cuenta Bancaria
                                </label>
                                <select
                                    required
                                    className="w-full bg-slate-50 border border-slate-100 h-12 rounded-xl px-4 font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    value={formData.cuentaBancaria}
                                    onChange={e => {
                                        const selectedAcc = bankAccounts.find(acc => acc.accountNumber === e.target.value)
                                        setFormData({
                                            ...formData,
                                            cuentaBancaria: e.target.value,
                                            banco: selectedAcc?.bankName || formData.banco
                                        })
                                    }}
                                >
                                    <option value="" disabled>Seleccione una cuenta...</option>
                                    {bankAccounts.map(acc => (
                                        <option key={acc.id} value={acc.accountNumber}>
                                            {acc.bankName} - {acc.accountNumber} ({acc.accountType})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Section Right: Beneficiary & Amount */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                    <User className="h-3 w-3" /> Beneficiario / Páguese a
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    required
                                    placeholder="Nombre completo o Razón Social"
                                    className="w-full bg-slate-100 border border-slate-200 h-12 rounded-xl px-4 font-bold text-slate-600 uppercase cursor-not-allowed"
                                    value={formData.beneficiario}
                                    title="Este campo proviene del asiento contable y no puede modificarse por seguridad"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                    <DollarSign className="h-3 w-3" /> Monto a Pagar
                                </label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    className="w-full bg-indigo-50 border border-indigo-100 h-12 rounded-xl px-4 font-black text-indigo-700 text-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    value={formData.monto}
                                    onChange={e => setFormData({ ...formData, monto: Number(e.target.value) })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                    <Calendar className="h-3 w-3" /> Fecha de Emisión
                                </label>
                                <input
                                    type="date"
                                    readOnly
                                    required
                                    className="w-full bg-slate-100 border border-slate-200 h-12 rounded-xl px-4 font-bold text-slate-600 cursor-not-allowed"
                                    value={formData.fecha}
                                    title="La fecha se asigna automáticamente al momento de generar el cheque"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                            className="h-12 px-8 rounded-2xl font-bold uppercase text-[10px] border border-slate-100"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="h-12 px-12 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-100 transition-all"
                        >
                            {submitting ? 'Generando Cheque...' : 'Confirmar & Generar Orden de Pago'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export default function NuevoChequePage() {
    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="rounded-full bg-white border">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Emisión de Pago</h1>
                </div>
                <Suspense fallback={<div>Cargando...</div>}>
                    <NuevoChequeForm />
                </Suspense>
            </div>
        </DashboardLayout>
    )
}
