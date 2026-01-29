"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Users,
    FileText,
    TrendingUp,
    Clock,
    Search,
    UserPlus,
    CreditCard,
    Briefcase,
    Printer,
    FileBarChart,
    PlusCircle,
    History,
    FileCheck,
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

type HRStats = {
    totalEmployees: number
    activeContracts: number
    pendingReviews: number
    lastPayrollAmount: number
}

type RecentActivity = {
    id: string
    empleadoNombre: string
    tipo: string
    fecha: string
    estado: string
}

export function RRHHDashboard() {
    const { data: session } = useSession()
    const [stats, setStats] = useState<HRStats>({
        totalEmployees: 0,
        activeContracts: 0,
        pendingReviews: 0,
        lastPayrollAmount: 0
    })
    const [activities, setActivities] = useState<RecentActivity[]>([])
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState(() => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    })
    const [isPeriodDialogOpen, setIsPeriodDialogOpen] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    const fetchStats = async (targetPeriod?: string) => {
        const activePeriod = targetPeriod || period
        setLoading(true)
        try {
            const [recordsRes, statsRes] = await Promise.all([
                fetch("/api/hr/records?limit=8"),
                fetch("/api/hr/statistics")
            ])

            if (recordsRes.ok) {
                const data = await recordsRes.json()
                const mapped = (data.data || []).map((r: any) => ({
                    id: r.id,
                    empleadoNombre: r.empleadoNombre || "N/A",
                    tipo: r.tipo,
                    fecha: r.fecha,
                    estado: r.estado
                }))
                setActivities(mapped)
            }

            if (statsRes.ok) {
                const data = await statsRes.json()
                setStats({
                    totalEmployees: data.totalEmployees || 0,
                    activeContracts: data.activeContracts || 0,
                    pendingReviews: data.pendingReviews || 0,
                    lastPayrollAmount: data.lastPayrollAmount || 0
                })
            }
        } catch (error) {
            console.error("Error fetching RRHH data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
        const interval = setInterval(() => fetchStats(), 60000)
        return () => clearInterval(interval)
    }, [period])

    const handleExport = async () => {
        setIsExporting(true)
        try {
            await fetch("/api/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accion: "EXPORT",
                    entidad: "Employee",
                    entidadId: "ALL",
                    descripcion: `${session?.user?.name} exportó reporte de RRHH del período ${period}`
                })
            })

            const exportData = activities.map(act => ({
                Empleado: act.empleadoNombre,
                Evento: act.tipo,
                Fecha: new Date(act.fecha).toLocaleDateString(),
                Estado: act.estado
            }))

            exportToCSV(exportData, `Reporte_RRHH_${period}.csv`)
        } catch (error) {
            console.error("Error exporting RRHH data:", error)
        } finally {
            setIsExporting(false)
        }
    }

    const handlePrintPayroll = () => {
        window.print()
    }

    if (loading && activities.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Cargando gestión de personal...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Talento Humano</h1>
                    <p className="text-gray-600 mt-1">
                        Control de personal, contratos y recursos de capital humano
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
                                <DialogTitle>Seleccionar Período Laboral</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <label className="text-sm font-medium mb-2 block text-gray-700">Mes de nómina/gestión</label>
                                <Input
                                    type="month"
                                    value={period}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPeriod(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <DialogFooter>
                                <Button onClick={() => {
                                    fetchStats()
                                    setIsPeriodDialogOpen(false)
                                }}>Aplicar Período</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button
                        variant="ghost"
                        onClick={handlePrintPayroll}
                        className="gap-2 border"
                    >
                        <Printer className="h-4 w-4" /> Imprimir
                    </Button>

                    <Button
                        className="gap-2 shadow-sm"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? <Clock className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                        Exportar Reporte
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Colaboradores Totales</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalEmployees}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                            <span className="text-green-600 font-bold">●</span> Personal activo en nómina
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Contratos Vigentes</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                            <Briefcase className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.activeContracts}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Garantía laboral vigente</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-amber-400">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Pendientes de Acción</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-amber-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">{stats.pendingReviews}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Revisiones y firmas requeridas</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Última Dispersión</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.lastPayrollAmount)}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Cierre del período anterior</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Recent HR Activity */}
                <Card className="md:col-span-8 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Bitácora de Eventos de Personal</CardTitle>
                            <CardDescription>
                                Actividad reportada en {period}
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/rrhh/employees" className="text-xs gap-1">
                                <History className="h-3.5 w-3.5" /> Bitácora Completa
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {activities.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg bg-gray-50/50">
                                    <History className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    No se registran eventos de personal para {period}
                                </div>
                            ) : (
                                activities.map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                                {activity.empleadoNombre.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{activity.empleadoNombre}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                                    <Badge variant="outline" className="text-[9px] py-0 h-4 border-primary/20 bg-primary/5 text-primary">
                                                        {activity.tipo}
                                                    </Badge>
                                                    • {new Date(activity.fecha).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-600">
                                                <FileCheck className="h-3 w-3" />
                                                {activity.estado}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Payroll Management Section */}
                <Card className="md:col-span-4 shadow-sm border-none bg-indigo-900 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <CreditCard className="h-32 w-32 rotate-12" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-white">Motor de Nómina</CardTitle>
                        <CardDescription className="text-indigo-200">Ciclo de pago actual</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-indigo-100 text-xs font-medium">Próximo Cierre</span>
                                <span className="text-white font-bold text-sm bg-white/20 px-2 py-0.5 rounded">30 ENE 2026</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-indigo-300 uppercase font-bold tracking-wider">
                                    <span>Progreso de Cómputo</span>
                                    <span>85%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 rounded-full w-[85%] shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                </div>
                            </div>
                            <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                                <span className="text-indigo-200 text-xs">Monto Proyectado</span>
                                <span className="text-xl font-black text-white">{formatCurrency(1280000.00)}</span>
                            </div>
                        </div>

                        <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-bold shadow-lg shadow-black/20" asChild>
                            <Link href="/rrhh/payroll" className="flex items-center justify-center">Procesar Cierre de Mes</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
