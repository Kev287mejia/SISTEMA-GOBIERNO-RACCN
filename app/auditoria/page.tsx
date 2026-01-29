"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    Shield,
    Search,
    Download,
    Filter,
    Activity,
    User,
    Calendar,
    FileText,
    Loader2,
    Eye,
    X,
    Printer
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface AuditLog {
    id: string
    accion: string
    entidad: string
    entidadId?: string
    detalles?: string
    datosAnteriores?: any
    datosNuevos?: any
    ipAddress?: string
    fecha: string
    usuario: {
        nombre: string
        apellido: string
        email: string
        role: string
    }
}

const LABEL_MAP: Record<string, string> = {
    nombre: "Nombre",
    apellido: "Apellido",
    email: "Correo",
    role: "Rol",
    cargo: "Cargo",
    departamento: "Departamento",
    activo: "Estado Activo",
    monto: "Monto",
    descripcion: "Descripción",
    passwordReset: "Contraseña Restablecida",
    tipo: "Tipo",
    estado: "Estado",
    fecha: "Fecha",
    montoAsignado: "Monto Asignado",
    montoDisponible: "Monto Disponible",
    montoEjecutado: "Monto Ejecutado",
    institucion: "Institución",
    cuentaContable: "Cuenta Contable",
    beneficiario: "Beneficiario",
    numero: "Número Documento/Cheque",
    banco: "Banco",
    referencia: "Referencia",
    mes: "Mes",
    budgetItemId: "Partida Presupuestaria (ID)",
    usuarioId: "Usuario (ID)",
    providerId: "Proveedor (ID)",
    entityId: "Entidad/Proveedor (ID)",
    accountingEntryId: "Asiento Contable (ID)",
    createdAt: "Fecha de Creación",
    updatedAt: "Fecha de Actualización",
    deletedAt: "Fecha de Eliminación",
    id: "ID de Registro",
    partidaCod: "Código de Partida",
    partidaNombre: "Nombre de Partida",
    beneficiarioNombre: "Nombre de Beneficiario",
    cuentaCodigo: "Código Cuenta",
    cuentaNombre: "Nombre Cuenta",
    status: "Estado",
    isActive: "Estado Activo"
}

const ENTITY_MAP: Record<string, string> = {
    "User": "Usuario del Sistema",
    "BudgetItem": "Partida Presupuestaria",
    "BudgetExecution": "Ejecución Presupuestaria",
    "BankAccount": "Cuenta Bancaria",
    "AccountingEntry": "Asiento Contable",
    "Check": "Cheque",
    "CashMovement": "Movimiento de Caja",
    "Provider": "Proveedor",
    "Institution": "Institución",
    "Closure": "Cierre Contable",
    "BankTransaction": "Transacción Bancaria"
}

export default function AuditoriaPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<Array<{ accion: string, count: number }>>([])
    const [totalCount, setTotalCount] = useState(0)

    // Export Preview State
    const [showExportPreview, setShowExportPreview] = useState(false)
    const [previewData, setPreviewData] = useState<{ headers: string[], rows: string[][] } | null>(null)

    const [filters, setFilters] = useState({
        entidad: "ALL",
        accion: "ALL",
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 7 days
        endDate: new Date().toISOString().split('T')[0],
        limit: "100"
    })

    // Initial Load - Keep this to load data on mount
    useEffect(() => {
        fetchLogs()
    }, []) // No dependencies - Manual trigger only

    const fetchLogs = async (customFilters?: typeof filters) => {
        setLoading(true)
        const activeFilters = customFilters || filters
        try {
            const queryParams = new URLSearchParams()
            if (activeFilters.entidad && activeFilters.entidad !== "ALL") queryParams.set("entidad", activeFilters.entidad)
            if (activeFilters.accion && activeFilters.accion !== "ALL") queryParams.set("accion", activeFilters.accion)
            if (activeFilters.startDate) queryParams.set("startDate", activeFilters.startDate)
            if (activeFilters.endDate) queryParams.set("endDate", activeFilters.endDate)
            queryParams.set("limit", activeFilters.limit)

            const response = await fetch(`/api/audit/logs?${queryParams}`)
            if (response.ok) {
                const data = await response.json()
                setLogs(data.logs)
                setStats(data.stats)
                setTotalCount(data.totalCount)
            }
        } catch (error) {
            console.error('Error fetching audit logs:', error)
        } finally {
            setLoading(false)
        }
    }



    const prepareExportData = () => {
        const headers = ['Fecha', 'Hora', 'Usuario', 'Rol', 'Acción', 'Entidad', 'Detalles', 'IP']
        const rows = logs.map(log => {
            const date = new Date(log.fecha)

            // Translate Action
            let accionEs = log.accion
            if (accionEs === 'CREATE') accionEs = 'CREAR'
            if (accionEs === 'UPDATE') accionEs = 'ACTUALIZAR'
            if (accionEs === 'DELETE') accionEs = 'ELIMINAR'
            if (accionEs === 'LOGIN') accionEs = 'INICIO DE SESIÓN'
            if (accionEs === 'LOGOUT') accionEs = 'CIERRE DE SESIÓN'

            return [
                date.toLocaleDateString('es-NI'),
                date.toLocaleTimeString('es-NI'),
                `${log.usuario.nombre} ${log.usuario.apellido}`,
                log.usuario.role,
                accionEs,
                ENTITY_MAP[log.entidad] || log.entidad,
                log.detalles || '',
                log.ipAddress || ''
            ]
        })
        return { headers, rows }
    }

    const handleExportClick = () => {
        const data = prepareExportData()
        setPreviewData(data)
        setShowExportPreview(true)
    }

    const confirmDownload = () => {
        if (!previewData) return

        // Helper to escape CSV fields
        const escape = (val: string | null | undefined) => `"${String(val || '').replace(/"/g, '""')}"`

        const csvContent = [
            previewData.headers.map(escape).join(','),
            ...previewData.rows.map(r => r.map(escape).join(','))
        ].join('\n')

        // Add BOM for Excel UTF-8 compatibility
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `auditoria_gobierno_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setShowExportPreview(false)
    }


    const getActionColor = (accion: string) => {
        if (accion.includes('CREATE')) return 'bg-emerald-100 text-emerald-700'
        if (accion.includes('UPDATE')) return 'bg-blue-100 text-blue-700'
        if (accion.includes('DELETE')) return 'bg-red-100 text-red-700'
        if (accion.includes('LOGIN')) return 'bg-purple-100 text-purple-700'
        return 'bg-slate-100 text-slate-700'
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-full px-6 pb-20">

                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-900/20 border border-indigo-500/10">
                    <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                        <Shield className="h-64 w-64 text-white rotate-12" />
                    </div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm mb-4">
                            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Sistema de Auditoría</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-white leading-tight mb-2">
                            Registro de <span className="text-indigo-400">Auditoría</span>
                        </h1>
                        <p className="text-indigo-100/60 font-medium text-lg">
                            Trazabilidad completa de todas las operaciones del sistema
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="border-none shadow-xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Total Registros</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900">{totalCount.toLocaleString()}</div>
                            <p className="text-xs text-slate-500 mt-1">En el período seleccionado</p>
                        </CardContent>
                    </Card>

                    {/* Quick Access to Monthly Archives */}
                    <Card className="border-none shadow-xl bg-indigo-900 text-white col-span-1 md:col-span-1 cursor-pointer hover:bg-indigo-800 transition-colors group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Calendar className="h-24 w-24 text-white rotate-12" />
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-200">Expedientes Históricos</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="space-y-2">
                                {[0, 1, 2].map(offset => {
                                    const d = new Date()
                                    d.setMonth(d.getMonth() - offset)
                                    const monthName = d.toLocaleDateString('es-NI', { month: 'long', year: 'numeric' })
                                    const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
                                    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]

                                    return (
                                        <div
                                            key={offset}
                                            onClick={() => {
                                                const newFilters = { ...filters, startDate: startOfMonth, endDate: endOfMonth, limit: '1000' }
                                                setFilters(newFilters)
                                                fetchLogs(newFilters)
                                            }}
                                            className="flex items-center justify-between text-xs font-bold hover:bg-white/10 p-2 rounded cursor-pointer transition-colors border border-white/5 group-hover:bg-white/5"
                                        >
                                            <span className="capitalize">{monthName}</span>
                                            <Download className="h-3 w-3 opacity-50" />
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {stats.slice(0, 3).map((stat, idx) => (
                        <Card key={idx} className="border-none shadow-xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">
                                    {stat.accion === 'CREATE' ? 'CREAR' :
                                        stat.accion === 'UPDATE' ? 'ACTUALIZAR' :
                                            stat.accion === 'DELETE' ? 'ELIMINAR' :
                                                stat.accion === 'LOGIN' ? 'INICIO DE SESIÓN' :
                                                    stat.accion === 'LOGOUT' ? 'CIERRE DE SESIÓN' : stat.accion}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-slate-900">{stat.count}</div>
                                <p className="text-xs text-slate-500 mt-1">Registros en Periodo</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-900">Filtros de Búsqueda</CardTitle>
                                <CardDescription>Personalice los criterios para visualizar registros específicos</CardDescription>
                            </div>
                            <Button onClick={handleExportClick} variant="outline" className="gap-2 border-slate-200">
                                <Download className="h-4 w-4" />
                                Previsualizar y Exportar
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entidad</Label>
                                <Select value={filters.entidad} onValueChange={(v) => setFilters({ ...filters, entidad: v })}>
                                    <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200">
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Todas</SelectItem>
                                        <SelectItem value="BudgetItem">Partidas Presupuestarias</SelectItem>
                                        <SelectItem value="BudgetExecution">Ejecución Presupuestaria</SelectItem>
                                        <SelectItem value="AccountingEntry">Asientos Contables</SelectItem>
                                        <SelectItem value="BankAccount">Cuentas Bancarias</SelectItem>
                                        <SelectItem value="Check">Cheques</SelectItem>
                                        <SelectItem value="CashMovement">Movimientos de Caja</SelectItem>
                                        <SelectItem value="User">Usuarios del Sistema</SelectItem>
                                        <SelectItem value="Institution">Instituciones</SelectItem>
                                        <SelectItem value="Provider">Proveedores</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Acción</Label>
                                <Select value={filters.accion} onValueChange={(v) => setFilters({ ...filters, accion: v })}>
                                    <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200">
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Todas</SelectItem>
                                        <SelectItem value="CREATE">Crear</SelectItem>
                                        <SelectItem value="UPDATE">Actualizar</SelectItem>
                                        <SelectItem value="DELETE">Eliminar</SelectItem>
                                        <SelectItem value="LOGIN">Login</SelectItem>
                                        <SelectItem value="LOGOUT">Logout</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha Inicio</Label>
                                <Input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    className="h-12 rounded-xl bg-white border-slate-200"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha Fin</Label>
                                <Input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    className="h-12 rounded-xl bg-white border-slate-200"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">&nbsp;</Label>
                                <Button onClick={() => fetchLogs()} className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20">
                                    <Search className="mr-2 h-4 w-4" />
                                    Buscar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Timeline View */}
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8">
                    <div className="mb-8">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900">Línea de Tiempo</h2>
                            <p className="text-slate-500">Historial cronológico detallado</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                            <p className="text-sm font-medium text-slate-500 animate-pulse">Cargando registros...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <FileText className="h-12 w-12 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Sin Registros</h3>
                            <p className="text-slate-500 max-w-sm mt-1">No se encontraron actividades de auditoría con los filtros seleccionados.</p>
                        </div>
                    ) : (
                        <div className="relative pl-8 border-l-2 border-indigo-100 space-y-12 py-4">
                            {logs.map((log, index) => {
                                const isDetailsJson = log.detalles && log.detalles.startsWith('{');
                                const detailsObj = isDetailsJson ? JSON.parse(log.detalles || '{}') : null;

                                return (
                                    <div key={log.id} className="relative group animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                                        {/* Timestamp Dot */}
                                        <div className={`absolute -left-[41px] top-0 h-5 w-5 rounded-full border-4 border-white shadow-md ${getActionColor(log.accion).replace('bg-', 'bg-').split(' ')[0]}`} />

                                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                                            {/* Time Column */}
                                            <div className="md:w-48 flex-shrink-0 pt-0.5">
                                                <p className="text-sm font-bold text-slate-900">
                                                    {new Date(log.fecha).toLocaleDateString('es-NI', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                <p className="text-xs font-medium text-slate-500">
                                                    {new Date(log.fecha).toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <p className="text-[10px] text-indigo-400 font-medium mt-1">
                                                    {formatDistanceToNow(new Date(log.fecha), { addSuffix: true, locale: es })}
                                                </p>
                                            </div>

                                            {/* Card Content */}
                                            <div className="flex-1 bg-slate-50/50 hover:bg-white border boundary-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all p-5 rounded-2xl group-hover:-translate-y-1 duration-300">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 text-slate-700 font-bold">
                                                            {log.usuario.nombre.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                                                                {log.usuario.nombre} {log.usuario.apellido}
                                                            </p>
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                                {log.usuario.role}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getActionColor(log.accion).replace('bg-', 'bg-opacity-10 border-')}`}>
                                                        {log.accion === 'CREATE' ? 'CREAR' :
                                                            log.accion === 'UPDATE' ? 'ACTUALIZAR' :
                                                                log.accion === 'DELETE' ? 'ELIMINAR' : log.accion}
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                                        <Activity className="h-4 w-4 text-indigo-500" />
                                                        <span className="font-medium">
                                                            {ENTITY_MAP[log.entidad] || log.entidad}
                                                            {log.entidadId && <span className="text-slate-400 font-mono text-xs ml-2">ID: {log.entidadId.slice(0, 8)}...</span>}
                                                        </span>
                                                    </div>

                                                    {/* Smart Details View */}
                                                    <ChangeViewer log={log} />

                                                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                                            <Shield className="h-3 w-3" />
                                                            IP: {log.ipAddress || 'Desconocida'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
            {/* Export Preview Dialog */}
            <Dialog open={showExportPreview} onOpenChange={setShowExportPreview}>
                <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Vista Previa de Exportación</DialogTitle>
                        <DialogDescription>
                            Revise los datos que se incluirán en el archivo CSV. Se mostrarán los primeros 50 registros como ejemplo.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {previewData?.headers.map((h, i) => (
                                        <TableHead key={i} className="whitespace-nowrap bg-slate-50">{h}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {previewData?.rows.map((row, i) => (
                                    <TableRow key={i}>
                                        {row.map((cell, j) => (
                                            <TableCell key={j} className="whitespace-nowrap text-xs max-w-[200px] truncate" title={cell}>
                                                {cell}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowExportPreview(false)}>Cerrar Vista</Button>
                        <Button onClick={() => window.print()} variant="outline" className="gap-2 border-slate-200">
                            <Printer className="h-4 w-4" />
                            Imprimir Oficial
                        </Button>
                        <Button onClick={confirmDownload} className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
                            <Download className="h-4 w-4" />
                            Archivar Expediente Digital
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    )
}

function ChangeViewer({ log }: { log: AuditLog }) {
    const [isOpen, setIsOpen] = useState(false)

    // Handle stringified JSON details
    const getDetailsObj = () => {
        if (log.detalles && log.detalles.startsWith('{')) {
            try {
                return JSON.parse(log.detalles)
            } catch (e) {
                return null
            }
        }
        return null
    }

    const detailsObj = getDetailsObj()

    // Determine what to show
    const isUpdate = log.accion === "UPDATE"
    const hasDiff = (log.datosAnteriores || log.datosNuevos)
    const hasJsonDetails = detailsObj !== null

    // Format value helper - Shared logic
    const formatVal = (k: string, v: any) => {
        if (v === null || v === undefined) return <span className="text-slate-300 italic">Vacío</span>

        // Booleans
        if ((k === 'activo' || k === 'isActive') && typeof v === 'boolean') return v ? 'SI (Habilitado)' : 'NO (Deshabilitado)'
        if (typeof v === 'boolean') return v ? 'Sí' : 'No'

        // Money
        if (k === 'monto' || k.toLowerCase().includes('monto')) {
            return <span className="font-bold text-emerald-600">C$ {Number(v).toLocaleString('es-NI', { minimumFractionDigits: 2 })}</span>
        }

        // Dates
        if ((k.includes('fecha') || k.includes('At')) && typeof v === 'string' && v.includes('T')) {
            return new Date(v).toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        }

        // Month
        if (k === 'mes') {
            return ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][Number(v) - 1] || String(v)
        }

        // Enum Translations (Common)
        const s = String(v).toUpperCase()
        const translations: Record<string, string> = {
            'ACTIVE': 'ACTIVO',
            'INACTIVE': 'INACTIVO',
            'PENDING_VALIDATION': 'PENDIENTE DE VALIDACIÓN',
            'BLOCKED': 'BLOQUEADO',
            'APPROVED': 'APROBADO',
            'REJECTED': 'RECHAZADO',
            'PENDING': 'PENDIENTE',
            'DRAFT': 'BORRADOR',
            'ABIERTO': 'ABIERTO',
            'CERRADO': 'CERRADO'
        }
        if (translations[s]) return translations[s]

        return String(v)
    }

    if (!hasDiff && !hasJsonDetails && !log.detalles) return null

    return (
        <div className="pt-2">
            {/* Simple text details if no JSON/Diff */}
            {log.detalles && !hasJsonDetails && !hasDiff && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600 mb-2">
                    {log.detalles}
                </div>
            )}

            {/* Comparison / Details View */}
            {(hasDiff || hasJsonDetails) && (
                <div className="mt-2 text-sm">
                    {!isOpen ? (
                        <button
                            onClick={() => setIsOpen(true)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
                        >
                            <Eye className="h-3 w-3" />
                            Ver Detalles del Cambio
                        </button>
                    ) : (
                        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                                    {isUpdate ? "Comparativa de Cambios" : "Datos Registrados"}
                                </span>
                                <button onClick={() => setIsOpen(false)}>
                                    <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                                </button>
                            </div>

                            <div className="p-4 space-y-3">
                                {isUpdate && log.datosAnteriores && log.datosNuevos ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 pb-2 mb-2">
                                            <span>Campo Modificado</span>
                                            <span></span>
                                            <span>Cambio Realizado</span>
                                        </div>
                                        {Object.keys(log.datosNuevos).map((key) => {
                                            const oldVal = log.datosAnteriores[key]
                                            const newVal = log.datosNuevos[key]
                                            if (JSON.stringify(oldVal) === JSON.stringify(newVal)) return null // Skip unchanged

                                            return (
                                                <div key={key} className="grid grid-cols-[1fr,auto,1fr] gap-3 items-center group hover:bg-slate-100/50 rounded-lg p-2 -mx-2 transition-colors">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                            {LABEL_MAP[key] || key}
                                                        </span>
                                                        <div className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded border border-red-100 self-start line-through opacity-75">
                                                            {formatVal(key, oldVal)}
                                                        </div>
                                                    </div>

                                                    <div className="text-slate-300">
                                                        &rarr;
                                                    </div>

                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Nuevo Valor</span>
                                                        <div className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-100 shadow-sm">
                                                            {formatVal(key, newVal)}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    // Fallback or Create View
                                    <div className="space-y-2">
                                        {/* Try to show datosNuevos or detailsObj */}
                                        {Object.entries(log.datosNuevos || detailsObj || {})
                                            .filter(([key]) => !['id', 'usuarioId', 'updatedAt', 'createdAt', 'deletedAt', 'providerId', 'entityId', 'accountingEntryId', 'budgetItemId', 'pettyCashId', 'bankAccountId', 'closureId'].includes(key))
                                            .map(([key, value]) => (
                                                <div key={key} className="flex justify-between items-center border-b border-slate-200 pb-1 last:border-0 hover:bg-slate-50 transition-colors px-1 rounded">
                                                    <span className="text-xs font-medium text-slate-500">{LABEL_MAP[key] || key}</span>
                                                    <div className="text-right">
                                                        <span className="text-xs font-bold text-slate-800">
                                                            {formatVal(key, value)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}


                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

