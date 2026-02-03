"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ReconciliationTool } from "@/components/accounting/reconciliation-tool"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Landmark, Calendar, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"

export default function BankReconciliationPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [account, setAccount] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`/api/accounting/bank-accounts/${params.id}`)
            .then(res => res.json())
            .then(data => setAccount(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [params.id])

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl border border-slate-200">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Conciliación Bancaria</h1>
                            {account && (
                                <div className="flex items-center gap-2 mt-1">
                                    <Landmark className="h-4 w-4 text-indigo-500" />
                                    <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">{account.bankName} - {account.accountNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100 text-[10px] font-black text-indigo-700 uppercase tracking-[0.1em]">
                        <Calendar className="h-4 w-4" />
                        Periodo Fiscal: {new Date().getFullYear()}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="h-10 w-10 animate-spin border-4 border-indigo-600 border-t-transparent rounded-full" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Iniciando Motor de Conciliación...</p>
                    </div>
                ) : (
                    <ReconciliationTool bankAccountId={params.id} />
                )}
            </div>
        </DashboardLayout>
    )
}
