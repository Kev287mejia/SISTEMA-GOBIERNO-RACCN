"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    FileText,
    MessageSquare,
    TrendingUp,
    Clock,
    Search,
    CheckCircle2,
    AlertTriangle,
    Printer,
    FileBarChart,
    Building2,
    ArrowUpRight,
    ArrowDownRight,
    SearchCode,
    CalendarDays,
    FileDown
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { exportToCSV } from "@/lib/export"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog"

type AccountingEntry = {
    id: string
    numero: string
    fecha: string
    descripcion: string
    monto: number
    estado: string
    institucion: string
    observationsCount: number
    tipo: string
}

type AccountBalance = {
    cuenta: string
    nombre: string
    balance: number
}

export function CoordinadorDashboard() {
    const { data: session } = useSession()
    const [entries, setEntries] = useState<AccountingEntry[]>([])
    const [balances, setBalances] = useState<AccountBalance[]>([])
    const [observationsSummary, setObservationsSummary] = useState({ resolved: 0, pending: 0, critical: 0 })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [period, setPeriod] = useState(() => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    })
    const [isPeriodDialogOpen, setIsPeriodDialogOpen] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    const isDAF = session?.user?.role === "DirectoraDAF"

    const fetchData = async (targetPeriod?: string) => {
        const activePeriod = targetPeriod || period
        const [year, month] = activePeriod.split('-')
        const fechaDesde = `${year}-${month}-01`
        const nextMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1
        const nextYear = parseInt(month) === 12 ? parseInt(year) + 1 : year
        const fechaHasta = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

        setLoading(true)
        try {
            const [entriesRes, balancesRes, summaryRes] = await Promise.all([
                fetch(`/api/accounting-entries?limit=50&fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`),
                fetch("/api/accounting/balances?institucion=GOBIERNO"),
                fetch("/api/accounting/observations/summary")
            ])

            if (entriesRes.ok) {
                const data = await entriesRes.json()
                setEntries(data.data || [])
            }

            if (balancesRes.ok) {
                const data = await balancesRes.json()
                setBalances(data.balances || [])
            }

            if (summaryRes.ok) {
                const data = await summaryRes.json()
                setObservationsSummary(data)
            }
        } catch (error) {
            console.error("Error fetching coordinator data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [period])

    const filteredEntries = entries.filter(e =>
        e.descripcion.toLowerCase().includes(search.toLowerCase()) ||
        e.numero.toLowerCase().includes(search.toLowerCase())
    )

    const handlePrint = () => {
        window.print()
    }

    const handleExport = async () => {
        setIsExporting(true)
        try {
            await fetch("/api/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accion: "EXPORT",
                    entidad: "AccountBalance",
                    entidadId: "ALL",
                    descripcion: `${session?.user?.name} exportó reporte de saldos y operaciones del período ${period}`
                })
            })

            const exportData = entries.map(entry => ({
                Numero: entry.numero,
                Fecha: new Date(entry.fecha).toLocaleDateString(),
                Tipo: entry.tipo,
                Descripcion: entry.descripcion,
                Monto: entry.monto,
                Estado: entry.estado
            }))

            exportToCSV(exportData, `Reporte_Coordinacion_${period}.csv`)
        } catch (error) {
            console.error("Error auditing export action:", error)
        } finally {
            setIsExporting(false)
        }
    }

    if (loading && entries.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Cargando datos institucionales...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        {isDAF ? "División Administrativa Financiera" : "Coordinación de Gobierno"}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isDAF
                            ? "Seguimiento de saldos y validación presupuestaria"
                            : "Monitor institucional de operaciones financieras"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={isPeriodDialogOpen} onOpenChange={setIsPeriodDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <CalendarDays className="h-4 w-4" /> {period}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Seleccionar Período de Revisión</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <label className="text-sm font-medium mb-2 block text-gray-700">Mes del reporte</label>
                                <Input
                                    type="month"
                                    value={period}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPeriod(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <DialogFooter>
                                <Button onClick={() => {
                                    fetchData()
                                    setIsPeriodDialogOpen(false)
                                }}>Consultar Período</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button
                        className="gap-2"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? <Clock className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                        Exportar Reporte
                    </Button>
                </div>
            </div>

            {/* Top Balances */}
            <div className="grid gap-4 md:grid-cols-3">
                {balances.slice(0, 3).map((balance, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow border-t-4 border-t-primary">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {balance.nombre}
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(balance.balance)}</div>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs font-mono text-muted-foreground">Cta: {balance.cuenta}</span>
                                <Badge variant="outline" className="text-[10px] ml-auto bg-green-50 text-green-700 border-green-200">En Orden</Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-5">
                {/* List of Operations */}
                <Card className="col-span-1 md:col-span-3 shadow-sm border-none bg-gray-50/50">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Operaciones Fiscales</CardTitle>
                                <CardDescription>Movimientos registrados en {period}</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/contabilidad" className="text-xs">Ver todas</Link>
                            </Button>
                        </div>
                        <div className="mt-4 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Filtrar por número o descripción..."
                                className="pl-10 bg-white border-gray-200"
                                value={search}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-3">
                            {filteredEntries.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground bg-white rounded-lg border border-dashed">
                                    <SearchCode className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    No hay operaciones registradas para el período {period}
                                </div>
                            ) : (
                                filteredEntries.map((entry) => (
                                    <div key={entry.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${entry.tipo === 'INGRESO' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                {entry.tipo === 'INGRESO' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-gray-500">{entry.numero}</span>
                                                    <Badge variant={entry.estado === "APROBADO" ? "default" : "secondary"} className="text-[9px] px-1.5 h-4">
                                                        {entry.estado}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{entry.descripcion}</p>
                                                <div className="flex items-center gap-3 text-[11px] text-gray-500">
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(entry.fecha).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`text-sm font-bold ${entry.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {formatCurrency(entry.monto)}
                                            </span>
                                            <Link href={`/contabilidad/${entry.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 px-2 hover:bg-muted">
                                                    <MessageSquare className="h-3 w-3" />
                                                    {entry.observationsCount || 0} obs
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Observations Summary */}
                <Card className="col-span-1 md:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle>Análisis de Cumplimiento</CardTitle>
                        <CardDescription>Estado de revisiones pendientes ({period})</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {observationsSummary.pending > 0 ? (
                            <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-100 rounded-xl relative overflow-hidden group">
                                <AlertTriangle className="h-10 w-10 text-amber-600 relative z-10" />
                                <div className="relative z-10">
                                    <p className="text-sm font-bold text-amber-900 uppercase tracking-tight">Acción Requerida</p>
                                    <p className="text-xs text-amber-700 font-medium">Hay {observationsSummary.pending} registros con inconsistencias detectadas.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                                <div>
                                    <p className="text-sm font-bold text-emerald-900 uppercase tracking-tight">Sin Pendientes</p>
                                    <p className="text-xs text-emerald-700 font-medium">Todos los registros validados.</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Resueltas</span>
                                </div>
                                <span className="text-lg font-bold text-emerald-600">{observationsSummary.resolved}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">En Proceso</span>
                                </div>
                                <span className="text-lg font-bold text-blue-600">{observationsSummary.pending}</span>
                            </div>
                        </div>

                        <Button className="w-full h-12 rounded-xl text-sm font-bold shadow-sm" variant="outline" asChild>
                            <Link href="/contabilidad" className="gap-2">
                                <FileText className="h-4 w-4" /> Centro de Auditoría
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
