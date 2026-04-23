"use client"

export const dynamic = "force-dynamic";
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  ArrowUpRight,
  ClipboardList,
  Building2,
  GraduationCap
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { HRCharts } from "@/components/rrhh/hr-charts"
import { ModuleHero } from "@/components/layout/module-hero"

export default function RRHHDashboard() {
  const [stats, setStats] = useState({
    totalEmpleados: 124,
    empleadosActivos: 118,
    cargosDefinidos: 45,
    nominaPendiente: 1
  })

  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [analyticsData, setAnalyticsData] = useState({
    distributionData: [
      { name: 'Administrativo', value: 30 },
      { name: 'Operativo', value: 65 },
      { name: 'Técnico', value: 29 }
    ],
    payrollTrend: [
      { name: 'Ene', total: 1200000 },
      { name: 'Feb', total: 1250000 },
      { name: 'Mar', total: 1220000 },
      { name: 'Abr', total: 1280000 },
    ]
  })

  // Module Configuration
  const modules = [
    {
      title: "Expediente Digital",
      description: "Gestión unificada de documentos, contratos y hoja de vida del personal.",
      icon: Users,
      color: "from-blue-600 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      href: "/rrhh/empleados",
      stats: [
        { label: "Nuevos ingresos", value: "+3", icon: UserPlus },
        { label: "Contratos x vencer", value: "8", icon: Clock }
      ]
    },
    {
      title: "Control de Nómina",
      description: "Procesamiento de pagos, deducciones de ley e impuestos patronales.",
      icon: DollarSign,
      color: "from-emerald-600 to-teal-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      href: "/rrhh/nomina",
      stats: [
        { label: "Presupuesto mes", value: "C$ 1.2M", icon: TrendingUp },
        { label: "Deducciones IR", value: "C$ 45K", icon: ClipboardList }
      ]
    },
    {
      title: "Estructura Org.",
      description: "Manual de funciones, organigrama y jerarquías regionales.",
      icon: Building2,
      color: "from-purple-600 to-fuchsia-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      href: "/rrhh/estructura",
      stats: [
        { label: "Cargos vacantes", value: "12", icon: Briefcase },
        { label: "Centros locales", value: "5", icon: Award }
      ]
    },
    {
      title: "Capacitaciones",
      description: "Plan de formación y desarrollo de competencias institucionales.",
      icon: GraduationCap,
      color: "from-orange-600 to-amber-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      href: "/rrhh/capacitacion",
      stats: [
        { label: "Progreso anual", value: "65%", icon: TrendingUp },
        { label: "Sesiones hoy", value: "2", icon: Calendar }
      ]
    }
  ]

  useEffect(() => {
    // In a real app these would be fetch calls
    // fetchStats()
    // fetchAnalytics()
  }, [])

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#fcfcfc] pb-20">
        <ModuleHero 
          title="GESTIÓN ORGANIZACIONAL" 
          subtitle="CONTROL INTEGRAL DE CAPITAL HUMANO, NÓMINA Y ESTRUCTURA INSTITUCIONAL"
        />

        <div className="max-w-7xl mx-auto px-8 -mt-20 relative z-30 space-y-10">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-slate-100 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Users className="h-6 w-6 text-indigo-600" />
               </div>
               <div>
                  <h3 className="text-slate-900 font-black uppercase text-xs tracking-widest">Portal de RRHH</h3>
                  <p className="text-slate-500 text-[10px] font-bold">Gestión Administrativa {new Date().getFullYear()}</p>
               </div>
            </div>
            
            <div className="flex items-center gap-2">
               <Link href="/rrhh/reports">
                  <Button variant="outline" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-200">
                    <FileText className="h-3.5 w-3.5 mr-2 text-indigo-500" /> Reportes Consolidados
                  </Button>
               </Link>
            </div>
          </div>

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

          <HRCharts
            distributionData={analyticsData.distributionData}
            payrollTrend={analyticsData.payrollTrend}
            loading={loadingAnalytics}
          />

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
      </div>
    </DashboardLayout>
  )
}
