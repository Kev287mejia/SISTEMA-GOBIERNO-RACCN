"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useSocket } from "@/hooks/useSocket"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  FileDown,
  LayoutGrid,
  CalendarDays,
  BarChart3,
  Download
} from "lucide-react"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EntryType, Institution } from "@prisma/client"
import { exportToCSV } from "@/lib/export"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface Statistics {
  totals: {
    ingresos: number
    egresos: number
    balance: number
    countIngresos: number
    countEgresos: number
  }
  monthly: Array<{
    month: string
    ingresos: number
    egresos: number
    balance: number
  }>
  byInstitution: Array<{
    institucion: string
    total: number
    count: number
  }>
  byStatus: Array<{
    estado: string
    count: number
  }>
  recentEntries: Array<{
    id: string
    numero: string
    tipo: EntryType
    fecha: string
    monto: number
    descripcion: string
    institucion: Institution
    estado: string
    cuentaContable: string
    creadoPor: string | null
    aprobadoPor: string | null
  }>
}

const COLORS = {
  ingresos: "#10b981",
  egresos: "#ef4444",
  balance: "#3b82f6",
  gobierno: "#6366f1",
  concejo: "#f59e0b",
}

export function ContadorGeneralDashboard() {
  const { data: session } = useSession()
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [period, setPeriod] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [isPeriodDialogOpen, setIsPeriodDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const fetchStatistics = async (selectedPeriod?: string) => {
    const targetPeriod = selectedPeriod || period
    const [year, month] = targetPeriod.split('-')

    // Create date range for the month
    const fechaDesde = `${year}-${month}-01`
    const nextMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1
    const nextYear = parseInt(month) === 12 ? parseInt(year) + 1 : year
    const fechaHasta = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

    setLoading(true)
    try {
      const response = await fetch(`/api/accounting-entries/statistics?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`)
      if (response.ok) {
        const data = await response.json()
        setStatistics(data)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("Error fetching statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatistics()
    const interval = setInterval(() => fetchStatistics(), 60000)
    return () => clearInterval(interval)
  }, [period])

  const handleEntryCreated = () => fetchStatistics()
  const handleEntryUpdated = () => fetchStatistics()
  const handleEntryDeleted = () => fetchStatistics()
  const handleEntryApproved = () => fetchStatistics()

  const { isConnected } = useSocket({
    onEntryCreated: handleEntryCreated,
    onEntryUpdated: handleEntryUpdated,
    onEntryDeleted: handleEntryDeleted,
    onEntryApproved: handleEntryApproved,
    enabled: true,
  })

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-")
    const date = new Date(parseInt(year), parseInt(monthNum) - 1)
    return date.toLocaleDateString("es-ES", { month: "short", year: "2-digit" })
  }

  const getStatusBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      APROBADO: "default",
      PENDIENTE: "secondary",
      RECHAZADO: "outline",
      BORRADOR: "outline",
    }
    return <Badge variant={variants[estado] || "outline"}>{estado}</Badge>
  }

  const handleExport = async () => {
    if (!statistics) return
    setIsExporting(true)

    try {
      // 1. Audit the export
      await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "EXPORT",
          entidad: "AccountingEntry",
          entidadId: "MULTIPLE",
          descripcion: `${session?.user?.name} exportó reporte financiero del período ${period}`
        })
      })

      // 2. Prepare data for export
      const exportData = statistics.recentEntries.map(entry => ({
        Numero: entry.numero,
        Fecha: new Date(entry.fecha).toLocaleDateString(),
        Tipo: entry.tipo,
        Descripcion: entry.descripcion,
        Monto: entry.monto,
        Institucion: entry.institucion,
        Estado: entry.estado,
        Cuenta: entry.cuentaContable,
        CreadoPor: entry.creadoPor
      }))

      // 3. Trigger download
      exportToCSV(exportData, `Reporte_Financiero_${period}.csv`)
    } catch (error) {
      console.error("Error exporting:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handlePeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPeriod(e.target.value)
  }

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Cargando análisis financiero...</p>
        </div>
      </div>
    )
  }

  if (!statistics) {
    return <div className="text-center py-8 text-muted-foreground">No se pudieron cargar las estadísticas</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Panel de Control Financiero
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">
              Sincronizado: {lastUpdate.toLocaleTimeString()}
            </span>
            <div className="flex items-center gap-1.5 ml-4">
              <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              <span className="text-xs font-medium text-gray-600">
                {isConnected ? "Tiempo Real" : "Modo Manual"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isPeriodDialogOpen} onOpenChange={setIsPeriodDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarDays className="h-4 w-4" /> {period}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Seleccionar Período</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <label className="text-sm font-medium mb-2 block text-gray-700">Mes de análisis</label>
                <Input
                  type="month"
                  value={period}
                  onChange={handlePeriodChange}
                  className="w-full"
                />
              </div>
              <DialogFooter>
                <Button onClick={() => {
                  fetchStatistics()
                  setIsPeriodDialogOpen(false)
                }}>Aplicar Filtro</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            className="gap-2"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? <Activity className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(statistics.totals.ingresos)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Basado en {statistics.totals.countIngresos} transacciones
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egresos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(statistics.totals.egresos)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Basado en {statistics.totals.countEgresos} transacciones
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${statistics.totals.balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
              {formatCurrency(statistics.totals.balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estado: {statistics.totals.balance >= 0 ? "Excedente" : "Déficit"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {statistics.totals.countIngresos + statistics.totals.countEgresos}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Asientos validados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trend Chart */}
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/10">
            <CardTitle>Historial Mensual</CardTitle>
            <CardDescription>Comparativa de flujos de efectivo del año actual</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statistics.monthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(val) => `C$${val / 1000}k`} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), ""]}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="ingresos" stroke={COLORS.ingresos} strokeWidth={3} dot={{ r: 4, fill: COLORS.ingresos }} activeDot={{ r: 6 }} name="Ingresos" />
                <Line type="monotone" dataKey="egresos" stroke={COLORS.egresos} strokeWidth={3} dot={{ r: 4, fill: COLORS.egresos }} activeDot={{ r: 6 }} name="Egresos" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By Institution Chart */}
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/10">
            <CardTitle>Distribución Institucional</CardTitle>
            <CardDescription>Participación relativa por entidad pública</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statistics.byInstitution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="total"
                  nameKey="institucion"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statistics.byInstitution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.institucion === Institution.GOBIERNO ? COLORS.gobierno : COLORS.concejo}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Movements Table */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-muted/10">
          <div>
            <CardTitle>Libro de Movimientos - {period}</CardTitle>
            <CardDescription>Visualización de los últimos registros aprobados en el período</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleExport} className="text-primary gap-2">
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Link href="/contabilidad">
              <Button variant="ghost" size="sm" className="text-primary">
                Ver Todo
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="p-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Número</th>
                  <th className="p-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Fecha</th>
                  <th className="p-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Tipo</th>
                  <th className="p-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Descripción</th>
                  <th className="p-4 text-xs font-bold uppercase text-gray-500 tracking-wider text-right">Monto</th>
                  <th className="p-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {statistics.recentEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-12 text-muted-foreground bg-white">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      No se registran movimientos aprobados en el período {period}
                    </td>
                  </tr>
                ) : (
                  statistics.recentEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-blue-50/30 transition-colors bg-white">
                      <td className="p-4 text-sm font-mono font-bold text-gray-700">{entry.numero}</td>
                      <td className="p-4 text-sm text-gray-600">{new Date(entry.fecha).toLocaleDateString()}</td>
                      <td className="p-4">
                        <Badge variant="outline" className={entry.tipo === EntryType.INGRESO
                          ? "text-emerald-700 border-emerald-200 bg-emerald-50/50"
                          : "text-red-700 border-red-200 bg-red-50/50"}>
                          {entry.tipo}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{entry.descripcion}</td>
                      <td className={`p-4 text-sm text-right font-bold ${entry.tipo === EntryType.INGRESO ? "text-emerald-600" : "text-red-600"}`}>
                        {formatCurrency(entry.monto)}
                      </td>
                      <td className="p-4">{getStatusBadge(entry.estado)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
