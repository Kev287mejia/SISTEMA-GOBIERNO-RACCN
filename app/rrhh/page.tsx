"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Briefcase,
  DollarSign,
  FileText,
  TrendingUp,
  UserPlus,
  Calendar,
  Award,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { HRCharts } from "@/components/rrhh/hr-charts"

export default function RRHHDashboard() {
  const [stats, setStats] = useState({
    totalEmpleados: 0,
    empleadosActivos: 0,
    cargosDefinidos: 0,
    nominaPendiente: 0
  })

  useEffect(() => {
    // TODO: Fetch real stats from API
    setStats({
      totalEmpleados: 47,
      empleadosActivos: 45,
      cargosDefinidos: 12,
      nominaPendiente: 2
    })
    fetchAnalytics()
  }, [])

  const [analyticsData, setAnalyticsData] = useState({ distributionData: [], payrollTrend: [] })
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true)
      const res = await fetch("/api/rrhh/analytics")
      if (res.ok) {
        const data = await res.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error("Error fetching HR analytics:", error)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const modules = [
    {
      title: "Gestión de Empleados",
      description: "Registro completo del personal institucional",
      icon: Users,
      href: "/rrhh/employees",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      stats: [
        { label: "Total Empleados", value: stats.totalEmpleados, icon: Users },
        { label: "Activos", value: stats.empleadosActivos, icon: CheckCircle2 }
      ],
      actions: [
        { label: "Nuevo Empleado", icon: UserPlus },
        { label: "Ver Listado", icon: Users }
      ]
    },
    {
      title: "Cargos y Estructura",
      description: "Definición de puestos y bandas salariales",
      icon: Briefcase,
      href: "/rrhh/positions",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      stats: [
        { label: "Cargos Definidos", value: stats.cargosDefinidos, icon: Briefcase },
        { label: "Niveles Salariales", value: 5, icon: TrendingUp }
      ],
      actions: [
        { label: "Nuevo Cargo", icon: Award },
        { label: "Ver Estructura", icon: Briefcase }
      ]
    },
    {
      title: "Procesamiento de Nómina",
      description: "Cálculo de salarios, deducciones y prestaciones",
      icon: DollarSign,
      href: "/rrhh/payroll",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      stats: [
        { label: "Nóminas Pendientes", value: stats.nominaPendiente, icon: AlertCircle },
        { label: "Último Proceso", value: "Ene 2026", icon: Calendar }
      ],
      actions: [
        { label: "Procesar Nómina", icon: DollarSign },
        { label: "Historial", icon: Clock }
      ]
    },
    {
      title: "Reportes y Análisis",
      description: "Informes de personal, asistencia y costos",
      icon: FileText,
      href: "/rrhh/reports",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      stats: [
        { label: "Reportes Disponibles", value: 8, icon: FileText },
        { label: "Exportaciones", value: 24, icon: ArrowUpRight }
      ],
      actions: [
        { label: "Generar Reporte", icon: FileText },
        { label: "Ver Histórico", icon: Calendar }
      ]
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-full px-6 pb-20">

        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-10 rounded-[2.5rem] shadow-2xl shadow-purple-900/20 border border-purple-500/10">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <Users className="h-64 w-64 text-white rotate-12" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm mb-4">
              <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Capital Humano</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white leading-tight mb-2">
              Recursos <span className="text-purple-400">Humanos</span>
            </h1>
            <p className="text-purple-100/60 font-medium text-lg">
              Gestión integral del talento institucional
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-none shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-blue-100">Personal Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{stats.totalEmpleados}</div>
              <p className="text-xs text-blue-100 mt-1">Empleados registrados</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-emerald-100">Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{stats.empleadosActivos}</div>
              <p className="text-xs text-emerald-100 mt-1">En nómina activa</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-purple-100">Cargos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{stats.cargosDefinidos}</div>
              <p className="text-xs text-purple-100 mt-1">Puestos definidos</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-orange-100">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{stats.nominaPendiente}</div>
              <p className="text-xs text-orange-100 mt-1">Nóminas por procesar</p>
            </CardContent>
          </Card>
        </div>



        {/* Analytics Charts */}
        <HRCharts
          distributionData={analyticsData.distributionData}
          payrollTrend={analyticsData.payrollTrend}
          loading={loadingAnalytics}
        />

        {/* Module Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {modules.map((module, idx) => (
            <Card
              key={idx}
              className="border-none shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden group hover:-translate-y-1"
            >
              <div className={`h-2 bg-gradient-to-r ${module.color}`} />

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-16 w-16 rounded-2xl ${module.bgColor} flex items-center justify-center shadow-lg`}>
                      <module.icon className={`h-8 w-8 ${module.iconColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black text-slate-900 mb-1">
                        {module.title}
                      </CardTitle>
                      <CardDescription className="text-sm font-medium">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {module.stats.map((stat, statIdx) => (
                    <div key={statIdx} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <stat.icon className="h-4 w-4 text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {stat.label}
                        </span>
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <Link href={module.href} className="flex-1">
                    <Button
                      className={`w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest bg-gradient-to-r ${module.color} text-white shadow-lg hover:shadow-xl transition-all`}
                    >
                      <module.icon className="h-4 w-4 mr-2" />
                      Acceder al Módulo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alert Banner */}
        {stats.nominaPendiente > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-orange-900">Nóminas Pendientes de Procesamiento</h3>
                <p className="text-sm text-orange-700">
                  Tienes {stats.nominaPendiente} nómina(s) pendiente(s) de procesar. Accede al módulo de Nómina para completar el proceso.
                </p>
              </div>
              <Link href="/rrhh/payroll">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  Procesar Ahora
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

      </div>
    </DashboardLayout >
  )
}
