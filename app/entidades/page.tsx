"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Building2,
  Search,
  Filter,
  Users,
  Truck,
  Globe,
  ArrowUpRight,
  Eye,
  Activity,
  CheckCircle2,
  ShieldCheck
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { CreateEntityDialog } from "@/components/entities/create-entity-dialog"
import Link from "next/link"

export default function EntidadesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [entidades, setEntidades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [mounted, setMounted] = useState(false)

  const fetchEntidades = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/entities")
      if (res.ok) {
        const data = await res.json()
        setEntidades(data || [])
      }
    } catch (error) {
      console.error("Error loading entities", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchEntidades()
  }, [])

  const filteredEntities = entidades.filter(e =>
    e.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (e.ruc && e.ruc.toLowerCase().includes(search.toLowerCase()))
  )

  const stats = {
    total: entidades.length,
    proveedores: entidades.filter(e => e.tipo === "PROVEEDOR").length,
    instituciones: entidades.filter(e => e.tipo === "INSTITUCION").length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Modern Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Catálogo de Entidades</h1>
            <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Registro central de proveedores, clientes e instituciones vinculadas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 shadow-sm border-slate-200 h-11 px-6 rounded-xl font-bold">
              Reporte General
            </Button>
            <Button
              className="bg-slate-900 hover:bg-slate-800 gap-2 shadow-lg shadow-slate-200 h-11 px-6 rounded-xl font-black uppercase tracking-widest"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4" /> Nueva Entidad
            </Button>
          </div>
        </div>

        {/* Premium Stats Section */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <Users className="h-16 w-16 text-slate-900" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Registros Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-slate-900">{stats.total}</div>
              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Entidades en padrón central</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Proveedores Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">{stats.proveedores}</div>
              <div className="flex items-center gap-1 mt-2">
                <Truck className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[10px] text-slate-400 font-bold uppercase">Suministros y Servicios</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Instituciones Gubernamentales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">{stats.instituciones}</div>
              <div className="flex items-center gap-1 mt-2">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-[10px] text-slate-400 font-bold uppercase">Entes del Sector Público</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-blue-600 text-white overflow-hidden relative group">
            <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:rotate-12 transition-transform">
              <Globe className="h-24 w-24 text-white" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-blue-100 tracking-widest">Cobertura Regional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black italic">Operativo</div>
              <p className="text-[10px] text-blue-100 mt-2 font-bold uppercase">RAAN - Sincronización Global</p>
            </CardContent>
          </Card>
        </div>

        {/* Master Table Section */}
        <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between py-8 gap-6 px-8">
            <div>
              <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Expedientes de Entidades</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400 mt-1">Gestión administrativa y fiscal de terceros</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre, RUC..."
                  className="pl-10 w-[300px] border-none bg-slate-50 rounded-2xl text-sm h-11 focus-visible:ring-blue-500 transition-all font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="ghost" size="icon" className="bg-slate-50 rounded-2xl h-11 w-11 hover:bg-slate-100">
                <Filter className="h-4 w-4 text-slate-500" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="h-12 w-12 animate-spin border-4 border-blue-600 border-t-transparent rounded-full shadow-lg" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Base de Datos...</p>
              </div>
            ) : filteredEntities.length === 0 ? (
              <div className="text-center py-32">
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-slate-200" />
                </div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Sin registros encontrados</h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2 font-medium">No se han detectado entidades que coincidan con los criterios de búsqueda actuales.</p>
              </div>
            ) : (
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="h-14 px-8 text-left align-middle font-black text-[10px] uppercase tracking-wider text-slate-400">Nombre / Razón Social</th>
                      <th className="h-14 px-8 text-left align-middle font-black text-[10px] uppercase tracking-wider text-slate-400">Clave Fiscal (RUC)</th>
                      <th className="h-14 px-8 text-left align-middle font-black text-[10px] uppercase tracking-wider text-slate-400">Categoría</th>
                      <th className="h-14 px-8 text-center align-middle font-black text-[10px] uppercase tracking-wider text-slate-400">Estado</th>
                      <th className="h-14 px-8 text-right align-middle font-black text-[10px] uppercase tracking-wider text-slate-400">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredEntities.map((entidad) => (
                      <tr key={entidad.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-blue-600 text-xs shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-105">
                              {entidad.nombre?.[0].toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 block max-w-[280px] truncate uppercase text-xs tracking-tight">
                                {entidad.nombre}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                                <Globe className="h-3 w-3" /> {entidad.email || 'Sin correo asociado'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="font-mono text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {entidad.ruc || 'N/A'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <Badge className={`${entidad.tipo === 'INSTITUCION' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-blue-50 text-blue-600 border-blue-100'} font-black text-[9px] px-3 py-1 shadow-sm uppercase tracking-wider`}>
                            {entidad.tipo}
                          </Badge>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <Badge className={`${entidad.activo ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'} font-black text-[9px] px-3 py-1 shadow-sm uppercase`}>
                            {entidad.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-white group-hover:shadow-sm" asChild>
                              <Link href={`/entidades/${entidad.id}`}>
                                <Eye className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                              </Link>
                            </Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-white group-hover:shadow-sm">
                              <ArrowUpRight className="h-4 w-4 text-slate-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          <div className="bg-slate-50/80 p-8 border-t border-slate-100 flex items-center justify-between italic font-bold text-slate-400 text-[10px] uppercase tracking-widest">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Padrón Fiscal Auditado</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-500" />
                <span>Validación de RUC Activa</span>
              </div>
            </div>
            <p>Última actualización: {mounted ? new Date().toLocaleDateString() : ""}</p>
          </div>
        </Card>
      </div>

      <CreateEntityDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={fetchEntidades}
      />
    </DashboardLayout>
  )
}

