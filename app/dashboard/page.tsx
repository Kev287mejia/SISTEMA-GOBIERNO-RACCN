"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
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
  ResponsiveContainer
} from 'recharts'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  Activity,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Building2
} from "lucide-react"
import { useSession } from "next-auth/react"
import { formatCurrency } from "@/lib/utils"

interface DashboardStats {
  kpis: {
    totalPresupuesto: number
    totalEjecutado: number
    totalDisponible: number
    porcentajeEjecucion: number
    totalBanco: number
    numeroCuentas: number
    numeroPartidas: number
  }
  charts: {
    presupuestoPorTipo: Array<{ tipo: string, asignado: number, ejecutado: number }>
    presupuestoPorRegion: Array<{ region: string, asignado: number, ejecutado: number }>
    tendenciaMensual: Array<{ mes: string, ejecutado: number, proyectado: number }>
    top5Partidas: Array<{ nombre: string, codigo: string, ejecutado: number, asignado: number, porcentaje: number }>
  }
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      fetchStats()
    } else if (status === "unauthenticated") {
      // Redirigir al login si no está autenticado
      window.location.href = "/auth/login"
    }
  }, [status])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error("Error fetching stats:", response.status)
        throw new Error("API Error")
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // En local, si falla, veremos el error en consola y dashboard vacío o loading
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!session) return null

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        </div>
      </DashboardLayout>
    )
  }

  const kpis = stats?.kpis

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-full px-6 pb-20">

        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 border border-blue-500/10">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <Activity className="h-64 w-64 text-white rotate-12" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm mb-4">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Dashboard en Tiempo Real</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white leading-tight mb-2">
              Bienvenido, <span className="text-blue-400">{session.user.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-blue-100/60 font-medium text-lg">
              Sistema de Gestión Gubernamental GRACCNN • {session.user.role}
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 truncate">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 truncate">
                Presupuesto Total
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900 truncate" title={formatCurrency(kpis?.totalPresupuesto || 0)}>
                {formatCurrency(kpis?.totalPresupuesto || 0)}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-medium truncate">
                {kpis?.numeroPartidas || 0} partidas activas
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 truncate">
                Ejecutado
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900 truncate" title={formatCurrency(kpis?.totalEjecutado || 0)}>
                {formatCurrency(kpis?.totalEjecutado || 0)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${(kpis?.porcentajeEjecucion || 0) > 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                  {(kpis?.porcentajeEjecucion || 0) > 50 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  <span className="text-[10px] font-black">{(kpis?.porcentajeEjecucion || 0).toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 truncate">
                Disponible
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                <Wallet className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900 truncate" title={formatCurrency(kpis?.totalDisponible || 0)}>
                {formatCurrency(kpis?.totalDisponible || 0)}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-medium truncate">
                Saldo sin comprometer
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 truncate">
                Cuentas Bancarias
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900 truncate" title={formatCurrency(kpis?.totalBanco || 0)}>
                {formatCurrency(kpis?.totalBanco || 0)}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-medium truncate">
                {kpis?.numeroCuentas || 0} cuentas activas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Budget by Type */}
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-black uppercase tracking-tight">Presupuesto por Tipo</CardTitle>
              <CardDescription>Distribución por tipo de gasto</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.charts.presupuestoPorTipo || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="tipo" tick={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 12, fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                  <Bar dataKey="asignado" fill="#10b981" name="Asignado" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="ejecutado" fill="#3b82f6" name="Ejecutado" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Budget by Region */}
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-black uppercase tracking-tight">Presupuesto por Región</CardTitle>
              <CardDescription>Distribución por centro regional</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats?.charts.presupuestoPorRegion || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ region, percent }) => `${region}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="asignado"
                  >
                    {stats?.charts.presupuestoPorRegion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Monthly Trend */}
          <Card className="border-none shadow-xl md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-black uppercase tracking-tight">Tendencia Mensual</CardTitle>
              <CardDescription>Ejecución vs Proyección {new Date().getFullYear()}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats?.charts.tendenciaMensual || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 12, fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                  <Line type="monotone" dataKey="ejecutado" stroke="#10b981" strokeWidth={3} name="Ejecutado" />
                  <Line type="monotone" dataKey="proyectado" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="Proyectado" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top 5 Partidas */}
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-black uppercase tracking-tight">Top 5 Partidas</CardTitle>
              <CardDescription>Mayor ejecución</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.charts.top5Partidas.map((partida, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-black text-slate-900 truncate">{partida.nombre}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{partida.codigo}</p>
                      </div>
                      <span className="text-xs font-black text-blue-600">{partida.porcentaje.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                        style={{ width: `${Math.min(partida.porcentaje, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  )
}
