"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    Search,
    CreditCard,
    Calendar,
    Eye,
    Filter,
    TrendingUp,
    ClipboardList,
    Building2,
    FileCheck,
    History,
    ArrowUpRight,
    TrendingDown,
    DollarSign,
    FileBarChart,
    ArrowRight,
    ShieldCheck
} from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { PayrollDetailDialog } from "@/components/hr/payroll-detail-dialog"
import { GeneratePayrollDialog } from "@/components/hr/generate-payroll-dialog"

type Payroll = {
    id: string
    mes: number
    anio: number
    descripcion: string
    totalMonto: number
    estado: string
    fechaPago: string | null
    createdAt: string
    _count?: {
        items: number
    }
}

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export default function PayrollPage() {
    const [payrolls, setPayrolls] = useState<Payroll[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPayroll, setSelectedPayroll] = useState<any | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [isGenerateOpen, setIsGenerateOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [stats, setStats] = useState({
        totalProcessed: 0,
        totalAmount: 0,
        pendingPay: 0,
        activeEmployees: 0
    })

    useEffect(() => {
        fetchPayrolls()
    }, [])

    const fetchPayrolls = async () => {
        try {
            const res = await fetch("/api/hr/payroll")
            if (res.ok) {
                const data = await res.json()
                const fetchedPayrolls = data.data || []
                setPayrolls(fetchedPayrolls)

                // Calculate stats
                const totalAmount = fetchedPayrolls.filter((p: any) => p.estado === "PAGADO").reduce((sum: number, p: any) => sum + Number(p.totalMonto), 0)
                const pendingPay = fetchedPayrolls.filter((p: any) => p.estado !== "PAGADO").length

                setStats({
                    totalProcessed: fetchedPayrolls.length,
                    totalAmount,
                    pendingPay,
                    activeEmployees: 0 // Would come from extra API call if needed
                })
            }
        } catch (error) {
            console.error("Failed to fetch payrolls", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchDetail = async (id: string) => {
        try {
            const res = await fetch(`/api/hr/payroll/${id}`)
            if (res.ok) {
                const data = await res.json()
                setSelectedPayroll(data.data)
                setIsDetailOpen(true)
            }
        } catch (error) {
            console.error("Failed to fetch payroll detail", error)
        }
    }

    const filteredPayrolls = payrolls.filter(p =>
        p.descripcion.toLowerCase().includes(search.toLowerCase()) ||
        MONTHS[p.mes - 1].toLowerCase().includes(search.toLowerCase())
    )

    const handleOpenDetail = (id: string) => {
        fetchDetail(id)
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-gray-900">Nómina Presupuestaria</h1>
                        <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-indigo-500" />
                            Control de haberes, deducciones y pagos institucionales
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2 shadow-sm border-gray-200">
                            <FileBarChart className="h-4 w-4" /> Reporte Anual
                        </Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-lg shadow-indigo-100"
                            onClick={() => setIsGenerateOpen(true)}
                        >
                            <Plus className="h-4 w-4" /> Generar Nómina
                        </Button>
                    </div>
                </div>

                {/* Dynamic Payroll Stats */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="border-none shadow-sm bg-white overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 text-indigo-50 group-hover:text-indigo-100 transition-colors">
                            <ClipboardList className="h-16 w-16" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nóminas Procesadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-gray-900">{stats.totalProcessed}</div>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase flex items-center gap-1">
                                <FileCheck className="h-3.5 w-3.5 text-indigo-500" /> Historial acumulado
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 transition-all group-hover:w-2" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Total Pagado (Anual)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-gray-900">{formatCurrency(stats.totalAmount)}</div>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase flex items-center gap-1">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Ejecución ejecutada
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 transition-all group-hover:w-2" />
                        <CardHeader className="pb-2 text-amber-600">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest">Pendientes de Pago</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-gray-900">{stats.pendingPay}</div>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-amber-500" /> Ciclos en proceso
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-indigo-900 overflow-hidden relative group">
                        <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:rotate-12 transition-transform">
                            <DollarSign className="h-24 w-24 text-white" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">Estatus Presupuestario</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-white">AL DÍA</div>
                            <p className="text-[10px] text-indigo-400 mt-2 font-bold uppercase">Sin deudas pendientes</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Payroll History List */}
                <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl">
                    <CardHeader className="border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between py-6 gap-4">
                        <div>
                            <CardTitle className="text-xl font-black text-gray-900 uppercase tracking-tight">Registro de Nóminas</CardTitle>
                            <CardDescription className="text-xs font-medium text-gray-400">Historial de dispersión de salarios y aportes</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar nómina, mes, año..."
                                    className="pl-10 w-[300px] border-none bg-gray-50 rounded-xl text-sm focus-visible:ring-indigo-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button variant="ghost" size="icon" className="bg-gray-50 rounded-xl">
                                <Filter className="h-4 w-4 text-gray-500" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="h-10 w-10 animate-spin border-4 border-indigo-600 border-t-transparent rounded-full" />
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Sincronizando Libro de Nómina...</p>
                            </div>
                        ) : filteredPayrolls.length === 0 ? (
                            <div className="text-center py-24 bg-gray-50/20">
                                <History className="h-16 w-16 mx-auto mb-4 text-gray-200" />
                                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Sin registros</h3>
                                <p className="text-sm text-gray-400 max-w-xs mx-auto mt-2">No se han generado nóminas para el periodo actual.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {filteredPayrolls.map((payroll) => (
                                    <div
                                        key={payroll.id}
                                        className="group p-6 hover:bg-indigo-50/30 transition-all border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                <div className="text-center">
                                                    <p className="text-[10px] uppercase leading-none">{MONTHS[payroll.mes - 1].slice(0, 3)}</p>
                                                    <p className="text-lg leading-none mt-1">{payroll.anio.toString().slice(-2)}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-base font-black text-gray-800 uppercase group-hover:text-indigo-600 transition-colors">
                                                    {payroll.descripcion}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`${payroll.estado === 'PAGADO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'} font-black text-[9px] px-2 py-0.5 tracking-widest`}>
                                                        {payroll.estado}
                                                    </Badge>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" /> {new Date(payroll.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 text-right">
                                            <div className="hidden md:flex flex-col px-6 border-x border-gray-100">
                                                <p className="text-[9px] font-black text-gray-400 uppercase">Total Desembolsado</p>
                                                <p className="text-xl font-black text-gray-900">{formatCurrency(payroll.totalMonto)}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-gray-50 hover:bg-white text-indigo-600 hover:text-indigo-700 font-black text-[10px] uppercase h-10 px-6 rounded-xl border border-gray-100 group-hover:shadow-sm"
                                                    onClick={() => handleOpenDetail(payroll.id)}
                                                >
                                                    Ver Expediente <ArrowRight className="h-3.5 w-3.5 ml-2" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <div className="bg-gray-50/80 p-6 border-t border-gray-100 flex items-center justify-between italic font-medium text-gray-400 text-[10px]">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                                <span>Nómina centralizada - Gobierno Regional</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Respaldo de auditoría presupuestaria</span>
                            </div>
                        </div>
                        <p>Ciclo Fiscal: {new Date().getFullYear()}</p>
                    </div>
                </Card>
            </div>

            <PayrollDetailDialog
                payroll={selectedPayroll}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />
            <GeneratePayrollDialog
                open={isGenerateOpen}
                onOpenChange={setIsGenerateOpen}
                onSuccess={fetchPayrolls}
            />
        </DashboardLayout>
    )
}
