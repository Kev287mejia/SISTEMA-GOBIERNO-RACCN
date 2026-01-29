"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    FileCheck,
    Building2,
    AlertTriangle,
    History,
    TrendingUp,
    Landmark,
    ArrowUpRight,
    ArrowDownRight,
    ClipboardCheck,
    FileText,
    Search,
    Settings
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react" // Added useState and useEffect

// Helper function for currency formatting (assuming it's needed based on the diff)
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-NI', {
        style: 'currency',
        currency: 'NIO', // Nicaraguan Córdoba
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

export function ResponsableContabilidadDashboard() {
    const [stats, setStats] = useState({
        pendingValidation: 0,
        accountsPayable: 0,
        accountsReceivable: 0,
        bankBalance: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/accounting/dashboard-stats")
                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                }
            } catch (error) {
                console.error("Error loading stats", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">
                        Panel de Control Contable
                    </h1>
                    <p className="text-slate-500 text-lg font-medium mt-1">
                        Supervisión, validación y control financiero del GRACCNN.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 font-bold" asChild>
                        <Link href="/reportes">Emisión de Estados Financieros</Link>
                    </Button>
                    <Button className="h-12 px-6 rounded-xl bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800" asChild>
                        <Link href="/contabilidad/validacion">
                            <FileCheck className="mr-2 h-5 w-5" />
                            Validar Operaciones
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Por Validar"
                    value={loading ? "..." : stats.pendingValidation}
                    description="Asientos pendientes"
                    icon={ClipboardCheck}
                    color="text-amber-600"
                    bg="bg-amber-50"
                    borderColor="border-amber-100"
                />
                <StatsCard
                    title="Cuentas x Pagar"
                    value={loading ? "..." : formatCurrency(stats.accountsPayable)}
                    description="Proveedores"
                    icon={ArrowDownRight}
                    color="text-red-600"
                    bg="bg-red-50"
                    borderColor="border-red-100"
                />
                <StatsCard
                    title="Cuentas x Cobrar"
                    value={loading ? "..." : formatCurrency(stats.accountsReceivable)}
                    description="Documentos"
                    icon={ArrowUpRight}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                    borderColor="border-emerald-100"
                />
                <StatsCard
                    title="Bancos"
                    value={loading ? "..." : formatCurrency(stats.bankBalance)}
                    description="Disponibilidad Global"
                    icon={Landmark}
                    color="text-blue-600"
                    bg="bg-blue-50"
                    borderColor="border-blue-100"
                />
            </div>

            {/* Action Cards Grid */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-slate-900 transition-colors">
                                <FileText className="h-6 w-6 text-slate-600 group-hover:text-white transition-colors" />
                            </div>
                            <span className="font-bold">Gestión de Asientos</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-500 font-medium">Revisión, edición y corrección de comprobantes contables diarios.</p>
                        <Button variant="secondary" className="w-full font-bold" asChild>
                            <Link href="/contabilidad">Ir al Libro Diario</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-slate-900 transition-colors">
                                <Settings className="h-6 w-6 text-slate-600 group-hover:text-white transition-colors" />
                            </div>
                            <span className="font-bold">Catalogo de Cuentas</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-500 font-medium">Administración, creación y desactivación de códigos contables.</p>
                        <Button variant="secondary" className="w-full font-bold" asChild>
                            <Link href="/configuracion">Administrar Cuentas</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-slate-900 transition-colors">
                                <AlertTriangle className="h-6 w-6 text-slate-600 group-hover:text-white transition-colors" />
                            </div>
                            <span className="font-bold">Observaciones</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-500 font-medium">Gestión de inconsistencias y notas de corrección a usuarios.</p>
                        <Button variant="secondary" className="w-full font-bold" asChild>
                            <Link href="/contabilidad?tab=observaciones">Ver Observaciones</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-slate-900 transition-colors">
                                <Settings className="h-6 w-6 text-slate-600 group-hover:text-white transition-colors" />
                            </div>
                            <span className="font-bold">Gestión de Usuarios</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-500 font-medium">Altas, bajas y administración de roles de usuarios.</p>
                        <Button variant="secondary" className="w-full font-bold" asChild>
                            <Link href="/usuarios">Administrar Usuarios</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Audit & Validation Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                            <History className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Auditoría y Trazabilidad</h3>
                            <p className="text-slate-500 font-medium">Todas las validaciones y correcciones son registradas para control institucional.</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-white px-4 py-2 font-mono text-xs font-bold">
                        SESIÓN ACTIVA: RESPONSABLE DE CONTABILIDAD
                    </Badge>
                </div>
            </div>

        </div>
    )
}

function StatsCard({ title, value, description, icon: Icon, color, bg, borderColor }: any) {
    return (
        <Card className={`border ${borderColor} shadow-sm overflow-hidden hover:shadow-lg transition-all`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-wider">
                    {title}
                </CardTitle>
                <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black text-slate-900 tabular-nums">{value}</div>
                <p className="text-xs text-slate-500 font-bold mt-1 line-clamp-1">{description}</p>
            </CardContent>
        </Card>
    )
}
