"use client"

export const dynamic = "force-dynamic";
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  AreaChart,
  LineChart,
  Line,
  PieChart,
  Pie,
  Area,
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
  Home
} from "lucide-react"
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

const COLORS = ['#005C9E', '#FDB913', '#4D8C2B', '#002D56', '#D4AF37']

import { ModuleHero } from "@/components/layout/module-hero"

export default function DashboardPage() {
  const session = { user: { name: "Administrador GRACCN", role: "ADMIN" } };
  const status = "authenticated";
  
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#002D56]">
        <div className="text-center">
           <Loader2 className="h-12 w-12 animate-spin text-white mb-4 mx-auto" />
           <p className="text-white font-bold animate-pulse">CARGANDO PLATAFORMA GRACCN...</p>
        </div>
      </div>
    )
  }

  const kpis = stats?.kpis

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#fcfcfc] pb-20">
        <ModuleHero 
          title="PLATAFORMA INTEGRAL DE GESTIÓN" 
          subtitle="GOBIERNO REGIONAL AUTÓNOMO DE LA COSTA CARIBE NORTE"
        />

        <div className="max-w-7xl mx-auto px-8 -mt-20 relative z-30 space-y-8">
          {/* Welcome Banner */}
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <Home className="h-40 w-40 text-white" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
                <span className="h-2 w-2 rounded-full bg-[#FDB913] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Sesión Administrativa Activa</span>
              </div>
              <h2 className="text-5xl font-black tracking-tighter text-white leading-tight mb-2">Bienvenido, <span className="text-[#FDB913] italic font-serif capitalize">Administrador</span></h2>
              <p className="text-white/60 font-medium text-lg uppercase tracking-[0.2em] flex items-center gap-3">
                CENTRO DE CONTROL E INTELIGENCIA FINANCIERA
              </p>
            </div>
          </div>


        {/* KPIs con diseño Premium */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden hover:scale-105 transition-transform duration-300">
            <div className="h-1.5 bg-[#4D8C2B]" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase text-slate-400">Presupuesto Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900">{formatCurrency(kpis?.totalPresupuesto || 254890000)}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden hover:scale-105 transition-transform duration-300">
            <div className="h-1.5 bg-[#005C9E]" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase text-slate-400">Ejecución Real</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900">{formatCurrency(kpis?.totalEjecutado || 124500000)}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden hover:scale-105 transition-transform duration-300">
            <div className="h-1.5 bg-[#FDB913]" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase text-slate-400">Disponible</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900">{formatCurrency(kpis?.totalDisponible || 130390000)}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden hover:scale-105 transition-transform duration-300">
            <div className="h-1.5 bg-[#002D56]" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase text-slate-400">Cuentas Regionales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900">{kpis?.numeroCuentas || 12} Activas</div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid gap-8 md:grid-cols-3">
           <Card className="md:col-span-2 border-none shadow-2xl rounded-[2.5rem] p-8">
              <h3 className="text-xl font-black mb-6 uppercase tracking-tight">Ejecución Mensual vs Proyección</h3>
              <div className="h-[350px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.charts.tendenciaMensual || [
                      {mes: 'Ene', ejecutado: 4000, proyectado: 4500},
                      {mes: 'Feb', ejecutado: 3000, proyectado: 3800},
                      {mes: 'Mar', ejecutado: 2000, proyectado: 2800},
                      {mes: 'Abr', ejecutado: 2780, proyectado: 3000},
                    ]}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} />
                       <XAxis dataKey="mes" />
                       <YAxis />
                       <Tooltip />
                       <Area type="monotone" dataKey="ejecutado" stroke="#005C9E" fill="#005C9E" fillOpacity={0.1} strokeWidth={4} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </Card>
           
           <Card className="border-none shadow-2xl rounded-[2.5rem] p-8 bg-slate-900 text-white">
              <h3 className="text-xl font-black mb-6 uppercase tracking-tight">Distribución</h3>
              <div className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={[{n: 'Ejecutado', v: 45}, {n: 'Disponible', v: 55}]} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="v">
                          <Cell fill="#FDB913" />
                          <Cell fill="#005C9E" />
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4 text-xs font-bold text-white/60">
                 <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                    <span>EJECUTADO</span>
                    <span className="text-[#FDB913]">45%</span>
                 </div>
                 <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                    <span>DISPONIBLE</span>
                    <span className="text-[#005C9E]">55%</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>
      </div>
    </DashboardLayout>
  )
}
