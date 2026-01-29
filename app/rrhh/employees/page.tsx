"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    Search,
    Users,
    Briefcase,
    UserPlus,
    Building2,
    Eye,
    Filter,
    FileCheck,
    UserCheck,
    TrendingUp,
    History,
    ShieldCheck,
    Smartphone,
    CheckCircle2,
    FileBarChart,
    Fingerprint
} from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { EmployeeDetailDialog } from "@/components/hr/employee-detail-dialog"

type EmployeeWithRelations = {
    id: string
    nombre: string
    apellido: string
    cedula: string
    inss?: string
    ruc?: string
    email: string
    telefono: string
    direccion: string
    profesion?: string
    nivelAcademico?: string
    hijos?: number
    contactoEmergencia?: string
    telefonoEmergencia?: string
    tipoSangre?: string
    banco?: string
    numeroCuenta?: string
    tipoCuenta?: string
    estado: string
    fechaIngreso: string
    createdAt: string
    updatedAt: string
    contratos: {
        cargo: {
            titulo: string
            departamento: string
        }
    }[]
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<EmployeeWithRelations[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithRelations | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [mounted, setMounted] = useState(false)
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        pendingReviews: 0,
        payrollBudget: 0
    })

    useEffect(() => {
        setMounted(true)
        fetchEmployees()
        fetchStats()
    }, [])

    const fetchEmployees = async () => {
        try {
            const res = await fetch("/api/hr/employees")
            if (res.ok) {
                const data = await res.json()
                setEmployees(data || [])
            }
        } catch (error) {
            console.error("Failed to fetch employees", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/hr/statistics")
            if (res.ok) {
                const data = await res.json()
                setStats({
                    total: data.totalEmployees || 0,
                    active: data.activeContracts || 0,
                    pendingReviews: data.pendingReviews || 0,
                    payrollBudget: data.lastPayrollAmount || 0
                })
            }
        } catch (error) {
            console.error("Failed to fetch statistics", error)
        }
    }

    const filteredEmployees = employees.filter(emp =>
        emp.nombre.toLowerCase().includes(search.toLowerCase()) ||
        emp.apellido.toLowerCase().includes(search.toLowerCase()) ||
        emp.cedula.toLowerCase().includes(search.toLowerCase()) ||
        (emp.contratos?.[0]?.cargo?.titulo || "").toLowerCase().includes(search.toLowerCase())
    )

    const handleOpenDetail = (employee: EmployeeWithRelations) => {
        setSelectedEmployee(employee)
        setIsDetailOpen(true)
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-gray-900">Gestión de Talento Humano</h1>
                        <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
                            <Users className="h-4 w-4 text-emerald-500" />
                            Control administrativo y expedientes de personal gubernamental
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2 shadow-sm border-gray-200">
                            <FileBarChart className="h-4 w-4" /> Exportar Planilla
                        </Button>
                        <Link href="/rrhh/employees/new">
                            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2 shadow-lg shadow-emerald-100">
                                <UserPlus className="h-4 w-4" /> Alta de Personal
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Dynamic HR Stats Section */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="border-none shadow-sm bg-white overflow-hidden group relative">
                        <div className="absolute top-0 right-0 p-4 text-emerald-50 group-hover:text-emerald-100 transition-colors">
                            <ShieldCheck className="h-16 w-16" />
                        </div>
                        <CardHeader className="pb-2 relative">
                            <CardTitle className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Personal Activo</CardTitle>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-4xl font-black text-gray-900">{stats.active}</div>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase flex items-center gap-1">
                                <UserCheck className="h-3.5 w-3.5 text-emerald-500" /> Funcionarios vigentes
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 transition-all group-hover:w-2" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Total Cargos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-gray-900">{stats.total}</div>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase flex items-center gap-1">
                                <Briefcase className="h-3.5 w-3.5 text-indigo-500" /> Plazas presupuestadas
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 transition-all group-hover:w-2" />
                        <CardHeader className="pb-2 text-amber-600">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest">Revisiones Pend.</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-gray-900">{stats.pendingReviews}</div>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase flex items-center gap-1">
                                <FileCheck className="h-3.5 w-3.5 text-amber-500" /> Trámites en espera
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-emerald-900 overflow-hidden relative group">
                        <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:rotate-12 transition-transform">
                            <TrendingUp className="h-24 w-24 text-white" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase text-emerald-300 tracking-widest">Presupuesto Mensual</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-white">{formatCurrency(stats.payrollBudget)}</div>
                            <p className="text-[10px] text-emerald-400 mt-2 font-bold uppercase">Última nómina pagada</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Master Employee List */}
                <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl">
                    <CardHeader className="border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between py-6 gap-4">
                        <div>
                            <CardTitle className="text-xl font-black text-gray-900 uppercase tracking-tight">Escalafón General de Personal</CardTitle>
                            <CardDescription className="text-xs font-medium text-gray-400">Expedientes digitales y estado administrativo</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar por nombre, cédula, cargo..."
                                    className="pl-10 w-[300px] border-none bg-gray-50 rounded-xl text-sm focus-visible:ring-emerald-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button variant="ghost" size="icon" className="bg-gray-50 rounded-xl">
                                <Filter className="h-4 w-4 text-gray-500" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="h-10 w-10 animate-spin border-4 border-emerald-600 border-t-transparent rounded-full" />
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Sincronizando Archivo General...</p>
                            </div>
                        ) : filteredEmployees.length === 0 ? (
                            <div className="text-center py-24 bg-gray-50/20">
                                <Users className="h-16 w-16 mx-auto mb-4 text-gray-200" />
                                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Sin resultados</h3>
                                <p className="text-sm text-gray-400 max-w-xs mx-auto mt-2">No se encontraron funcionarios que coincidan con los criterios de búsqueda.</p>
                            </div>
                        ) : (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="h-14 px-6 text-left align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Funcionario / Perfil</th>
                                            <th className="h-14 px-6 text-left align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Cédula e INSS</th>
                                            <th className="h-14 px-6 text-left align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Cargo & Departamento</th>
                                            <th className="h-14 px-6 text-center align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Fecha Ingreso</th>
                                            <th className="h-14 px-6 text-center align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Estado</th>
                                            <th className="h-14 px-6 text-right align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Expediente</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredEmployees.map((emp) => {
                                            const cargo = emp.contratos?.[0]?.cargo?.titulo || "Puesto no asignado"
                                            const depto = emp.contratos?.[0]?.cargo?.departamento || "S/D"

                                            return (
                                                <tr key={emp.id} className="hover:bg-emerald-50/30 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black text-emerald-600 text-xs shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                                {emp.nombre?.[0]}{emp.apellido?.[0]}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-gray-900 block max-w-[200px] truncate uppercase text-xs tracking-tight">
                                                                    {emp.nombre} {emp.apellido}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 font-medium">{emp.email || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-mono text-xs font-black text-gray-700">{emp.cedula}</span>
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Fingerprint className="h-3 w-3 text-emerald-400" />
                                                                <span className="text-[10px] text-gray-400 font-black uppercase">INSS: {emp.inss || '---'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black text-indigo-900 uppercase">{cargo}</span>
                                                            <span className="text-[10px] text-gray-400 flex items-center gap-1 uppercase font-bold">
                                                                <Building2 className="h-3 w-3" /> {depto}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-xs font-bold text-gray-600">{new Date(emp.fechaIngreso).toLocaleDateString()}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Badge className={`${emp.estado === 'ACTIVO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'} font-black text-[9px] px-2 py-0.5 shadow-sm`}>
                                                            {emp.estado}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 rounded-lg hover:bg-white group-hover:shadow-sm"
                                                            onClick={() => handleOpenDetail(emp)}
                                                        >
                                                            <Eye className="h-4 w-4 text-emerald-600" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                    <div className="bg-gray-50/80 p-6 border-t border-gray-100 flex items-center justify-between italic font-medium text-gray-400 text-[10px]">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Nómina auditada bajo normas de Contraloría</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <History className="h-3.5 w-3.5 text-indigo-400" />
                                <span>Trazabilidad de Expedientes Activa</span>
                            </div>
                        </div>
                        <p>Actualizado: {mounted ? new Date().toLocaleDateString() : ""}</p>
                    </div>
                </Card>
            </div>

            <EmployeeDetailDialog
                employee={selectedEmployee}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />
        </DashboardLayout>
    )
}
