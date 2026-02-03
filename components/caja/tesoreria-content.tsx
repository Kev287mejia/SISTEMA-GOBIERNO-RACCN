"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Printer,
    Landmark,
    ArrowLeft,
    Plus,
    CheckCircle2,
    Clock,
    Search,
    CreditCard,
    FileText,
    History,
    AlertCircle,
    Building,
    Check,
    Calendar
} from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BankAccountDocuments } from "@/components/bank/bank-account-documents" // Import the document manager
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog" // Import Dialog

export function TesoreriaContent() {
    const router = useRouter()
    const [pendingEntries, setPendingEntries] = useState<any[]>([])
    const [checks, setChecks] = useState<any[]>([])
    const [bankAccounts, setBankAccounts] = useState<any[]>([]) // State for bank accounts
    const [loading, setLoading] = useState(true)
    const [selectedTab, setSelectedTab] = useState("pending")
    const [selectedAccount, setSelectedAccount] = useState<any>(null) // For the dialog

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const entriesRes = await fetch("/api/accounting-entries?tipo=EGRESO&estado=APROBADO&hasCheck=false&limit=100")
            const entriesData = await entriesRes.json()
            const activeEntries = Array.isArray(entriesData?.data) ? entriesData.data : []
            setPendingEntries(activeEntries)

            const checksRes = await fetch("/api/accounting/checks")
            const checksData = await checksRes.json()
            setChecks(Array.isArray(checksData) ? checksData : [])

            const banksRes = await fetch("/api/accounting/bank-accounts")
            if (!banksRes.ok) {
                const errText = await banksRes.text()
                console.error("Bank fetch error:", banksRes.status, errText)
                if (banksRes.status === 403) {
                    toast.error("No tienes permisos (403).")
                } else {
                    toast.error(`Error ${banksRes.status}: ${errText.slice(0, 100)}`)
                }
                setBankAccounts([])
            } else {
                const banksData = await banksRes.json()
                setBankAccounts(Array.isArray(banksData) ? banksData : [])
            }
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar datos de tesorería")
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateCheck = async (entry: any) => {
        if (!entry?.id) {
            toast.error("ID de asiento contable no válido")
            return
        }
        router.push(`/caja/nuevo?entryId=${entry.id}`)
    }

    if (loading && pendingEntries.length === 0 && checks.length === 0) {
        return <div className="p-20 text-center animate-pulse font-black text-slate-400 uppercase tracking-widest">Cargando Tesorería...</div>
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Control de Tesorería</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                        <CreditCard className="h-3 w-3 text-indigo-500" />
                        Emisión de pagos y control de cheques fiscales
                    </p>
                </div>
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-12 gap-2 border border-slate-100">
                    <TabsTrigger value="pending" className="rounded-xl px-6 font-black uppercase text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Clock className="h-3.5 w-3.5 mr-2 text-rose-500" />
                        Egresos por Pagar ({pendingEntries.length})
                    </TabsTrigger>
                    <TabsTrigger value="checks" className="rounded-xl px-6 font-black uppercase text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <History className="h-3.5 w-3.5 mr-2 text-indigo-500" />
                        Historial de Emisiones ({checks.length})
                    </TabsTrigger>
                    <TabsTrigger value="docs" className="rounded-xl px-6 font-black uppercase text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Building className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                        Expedientes Bancarios
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6 space-y-4">
                    {/* ... (existing pending content) ... */}
                    {pendingEntries.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[2rem] py-16 text-center">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4 opacity-20" />
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No hay pagos pendientes de aprobación</h3>
                        </Card>
                    ) : (
                        <div className="grid gap-3">
                            {pendingEntries.map((entry) => (
                                <Card key={entry.id} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all border border-slate-50">
                                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-black text-slate-900 uppercase text-xs tracking-tight">{entry.numero}</span>
                                                    <Badge className="bg-rose-500 text-[8px] font-black uppercase h-4 px-1.5 border-none">Pendiente</Badge>
                                                </div>
                                                <p className="text-xs font-bold text-slate-600 line-clamp-1 uppercase">{entry.descripcion}</p>
                                                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">Solicitado por: {entry.creadoPor?.nombre || 'SISTEMA'} | {entry.fecha ? new Date(entry.fecha).toLocaleDateString() : 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-lg font-black text-slate-900 tracking-tighter">{formatCurrency(entry.monto)}</p>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Importe Neto</p>
                                            </div>
                                            <Button
                                                onClick={() => handleGenerateCheck(entry)}
                                                className="bg-slate-900 text-white hover:bg-rose-600 rounded-xl h-10 px-5 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-slate-200"
                                            >
                                                Emitir Pago
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="checks" className="mt-6 space-y-4">
                    {/* ... (existing checks content) ... */}
                    {checks.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[2rem] py-16 text-center">
                            <History className="h-12 w-12 text-slate-300 mx-auto mb-4 opacity-20" />
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Sin historial de cheques</h3>
                        </Card>
                    ) : (
                        <div className="grid gap-3">
                            {checks.map((check) => (
                                <Card key={check.id} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden hover:bg-slate-50/50 transition-colors border border-slate-50">
                                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Landmark className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-black text-slate-900 uppercase text-xs tracking-tight">CHEQUE #{check.numero}</span>
                                                    <Badge className="bg-emerald-500 text-[8px] font-black uppercase h-4 px-1.5 border-none">{check.estado}</Badge>
                                                </div>
                                                <p className="text-xs font-bold text-slate-600 line-clamp-1 uppercase">Páguese a: {check.beneficiario}</p>
                                                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">{check.banco} | {new Date(check.fecha).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-lg font-black text-slate-900 tracking-tighter">{formatCurrency(check.monto)}</p>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Liquidado</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.push(`/caja/comprobante/${check.id}`)}
                                                    className="h-10 w-10 rounded-xl border border-slate-100 hover:bg-white text-slate-400 hover:text-indigo-600"
                                                    title="Ver Comprobante"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.push(`/caja/cheques/${check.id}/print`)}
                                                    className="h-10 w-10 rounded-xl border border-slate-100 hover:bg-white text-slate-400 hover:text-emerald-600"
                                                    title="Re-imprimir Cheque"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="docs" className="mt-6 space-y-4">
                    {bankAccounts.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[2rem] py-16 text-center">
                            <Landmark className="h-12 w-12 text-slate-300 mx-auto mb-4 opacity-20" />
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No se encontraron cuentas bancarias activas</h3>
                            <p className="text-xs text-slate-400 mt-2">Contacte al administrador si cree que esto es un error.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bankAccounts.map(account => (
                                <Card key={account.id} className="border-none shadow-sm bg-white hover:shadow-xl transition-all group cursor-pointer" onClick={() => setSelectedAccount(account)}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                            <Landmark className="h-5 w-5" />
                                        </div>
                                        {account.evidenceUrls && account.evidenceUrls.length > 0 ? (
                                            <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200">
                                                📎 {account.evidenceUrls.length} Docs
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-slate-400 border-slate-200">
                                                Sin Docs
                                            </Badge>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                                            {account.bankName}
                                        </div>
                                        <p className="text-xs text-slate-500 font-mono mt-1">
                                            {account.accountNumber}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                                            <span>Click para gestionar</span>
                                            <ArrowLeft className="h-3 w-3 rotate-180" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Dialog for Managing Bank Documents */}
            <Dialog open={!!selectedAccount} onOpenChange={(open) => !open && setSelectedAccount(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase text-slate-800">
                            <Landmark className="h-6 w-6 text-emerald-600" />
                            {selectedAccount?.bankName} - Documentación
                        </DialogTitle>
                    </DialogHeader>
                    {selectedAccount && (
                        <div className="mt-2">
                            <BankAccountDocuments
                                accountId={selectedAccount.id}
                                initialUrls={selectedAccount.evidenceUrls || []}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
