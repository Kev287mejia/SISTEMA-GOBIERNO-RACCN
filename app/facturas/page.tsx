"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Download,
  AlertCircle,
  Eye,
  ArrowRight,
  Activity
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { InvoiceDetailDialog } from "@/components/accounting/invoice-detail-dialog"

export default function FacturasPage() {
  const [facturas, setFacturas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const fetchFacturas = async () => {
    setLoading(true)
    try {
      // Usamos el API de asientos contables filtrando por EGRESOS que suelen representar facturas/pagos
      // Opcionalmente podríamos filtrar por aquellos que tienen documentoRef
      const res = await fetch("/api/accounting-entries?tipo=EGRESO&limit=50")
      if (res.ok) {
        const result = await res.json()
        setFacturas(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching facturas:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFacturas()
  }, [])

  const filteredFacturas = facturas.filter(f =>
    f.descripcion.toLowerCase().includes(search.toLowerCase()) ||
    (f.documentoRef && f.documentoRef.toLowerCase().includes(search.toLowerCase())) ||
    f.numero.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (estado: string) => {
    const variants: Record<string, any> = {
      APROBADO: { variant: "default", icon: CheckCircle, color: "text-green-600", label: "PAGADA" },
      PENDIENTE: { variant: "secondary", icon: Clock, color: "text-yellow-600", label: "PENDIENTE" },
      RECHAZADO: { variant: "destructive", icon: XCircle, color: "text-red-600", label: "RECHAZADA" },
      BORRADOR: { variant: "outline", icon: FileText, color: "text-gray-600", label: "BORRADOR" }
    }

    const config = variants[estado] || { variant: "outline", icon: AlertCircle, color: "text-blue-600", label: estado }
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1.5 px-2 py-0.5">
        <Icon className={`h-3 w-3 ${config.color}`} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{config.label}</span>
      </Badge>
    )
  }

  const handleOpenDetail = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsDetailOpen(true)
  }

  const totalPagadas = facturas.filter(f => f.estado === "APROBADO").reduce((sum, f) => sum + Number(f.monto), 0)
  const totalPendientes = facturas.filter(f => f.estado === "PENDIENTE").reduce((sum, f) => sum + Number(f.monto), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900">Módulo de Facturación</h1>
            <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-500" />
              Gestión centralizada de egresos, comprobantes y validación fiscal
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 shadow-sm">
              <Download className="h-4 w-4" /> Exportar
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-lg shadow-indigo-200">
              <Plus className="h-4 w-4" /> Nueva Factura
            </Button>
          </div>
        </div>

        {/* Stats Section with Premium Design */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-none shadow-sm bg-white overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 transition-all group-hover:w-2" />
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Registros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-gray-900">{facturas.length}</div>
              <p className="text-[10px] text-gray-400 mt-1 font-bold">Documentos en ciclo actual</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 transition-all group-hover:w-2" />
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Pagadas / Aprobadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-gray-900">{formatCurrency(totalPagadas)}</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 transition-all group-hover:w-2" />
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Pendientes de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-gray-900">{formatCurrency(totalPendientes)}</div>
              <p className="text-[10px] text-amber-600 mt-1 font-bold flex items-center gap-1">
                <Clock className="h-3 w-3" /> Requiere validación DAF
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <AlertCircle className="h-16 w-16" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-indigo-200 tracking-widest">Estado Crítico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black italic">Operativo</div>
              <p className="text-[10px] text-indigo-200 mt-1 font-bold">Sin vencimientos detectados</p>
            </CardContent>
          </Card>
        </div>

        {/* Master Table with Advanced Filters */}
        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl">
          <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between py-6">
            <div>
              <CardTitle className="text-xl font-black text-gray-900">Listado Maestro de Facturas</CardTitle>
              <CardDescription className="text-xs font-medium">Validación técnica y administrativa de egresos</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por descripción, folio o número..."
                  className="pl-10 w-[300px] bg-gray-50 border-none focus-visible:ring-indigo-500 transition-all text-sm h-10 rounded-xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl bg-gray-50">
                <Filter className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full overflow-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="h-10 w-10 animate-spin border-4 border-indigo-600 border-t-transparent rounded-full" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sincronizando registros...</p>
                </div>
              ) : filteredFacturas.length === 0 ? (
                <div className="text-center py-20 px-4">
                  <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <AlertCircle className="h-10 w-10" />
                  </div>
                  <h3 className="text-lg font-black text-gray-800">No se encontraron facturas</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">Prueba ajustando los filtros o realizando una nueva búsqueda.</p>
                </div>
              ) : (
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="h-14 px-6 text-left align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Folio / Documento</th>
                      <th className="h-14 px-6 text-left align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Emisión</th>
                      <th className="h-14 px-6 text-left align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Concepto de Pago</th>
                      <th className="h-14 px-6 text-right align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Monto Bruto</th>
                      <th className="h-14 px-6 text-center align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Estado Fiscal</th>
                      <th className="h-14 px-6 text-right align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredFacturas.map((factura) => (
                      <tr key={factura.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs font-black text-indigo-600 uppercase">{factura.documentoRef || "S/N"}</span>
                            <span className="text-[10px] text-gray-400 font-bold">Asiento: {factura.numero}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-700">{new Date(factura.fecha).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col max-w-[300px]">
                            <span className="font-bold text-gray-800 truncate">{factura.descripcion}</span>
                            <span className="text-[10px] text-gray-400 font-medium">Cuenta: {factura.cuentaContable}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-black text-gray-900">{formatCurrency(Number(factura.monto))}</span>
                        </td>
                        <td className="px-6 py-4 flex justify-center">
                          {getStatusBadge(factura.estado)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-lg hover:bg-white group-hover:shadow-sm"
                            onClick={() => handleOpenDetail(factura)}
                          >
                            <Eye className="h-4 w-4 text-indigo-600" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
          <div className="bg-gray-50/80 p-6 flex items-center justify-between border-t border-gray-100 italic font-medium text-gray-400 text-xs">
            <p>Nota: Los datos mostrados corresponden a egresos contables validados por el sistema central.</p>
            <div className="flex items-center gap-2">
              <span>Sincronizado: hace un momento</span>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </Card>
      </div>

      <InvoiceDetailDialog
        invoice={selectedInvoice}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </DashboardLayout>
  )
}
