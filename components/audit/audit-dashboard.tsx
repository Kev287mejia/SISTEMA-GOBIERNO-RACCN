"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, Trash2, Activity, TrendingUp, AlertTriangle } from "lucide-react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from "recharts"

export function AuditDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/audit/stats")
            .then(res => res.json())
            .then(data => {
                setStats(data)
                setLoading(false)
            })
            .catch(err => console.error(err))
    }, [])

    if (loading || !stats) return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl" />)}
        </div>
    )

    const actionColors: Record<string, string> = {
        CREATE: "#10b981",
        UPDATE: "#3b82f6",
        DELETE: "#ef4444",
        LOGIN: "#8b5cf6"
    }

    return (
        <div className="space-y-8">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-xl bg-gradient-to-br from-red-50 to-white overflow-hidden relative group transition-all hover:scale-[1.02]">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldAlert className="h-24 w-24 text-red-600 rotate-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">Operaciones de Alto Riesgo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-black text-slate-900">{stats.highValueEntriesCount}</span>
                            <span className="text-xs font-bold text-red-500 mb-1 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Transacciones &gt; 500k
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-gradient-to-br from-amber-50 to-white overflow-hidden relative group transition-all hover:scale-[1.02]">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Trash2 className="h-24 w-24 text-amber-600 -rotate-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Registros en Papelera</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-black text-slate-900">{stats.deletedEntriesCount}</span>
                            <span className="text-xs font-bold text-amber-500 mb-1">Borrados Lógicos (Soft Delete)</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-50 to-white overflow-hidden relative group transition-all hover:scale-[1.02]">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity className="h-24 w-24 text-indigo-600 rotate-45" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Índice de Actividad</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-black text-slate-900">{stats.auditStats.reduce((a: any, b: any) => a + b._count, 0)}</span>
                            <span className="text-xs font-bold text-indigo-500 mb-1 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> Eventos (30 d)
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-xl bg-white p-6">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Tendencia de Auditoría (15 días)</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.activityData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                                    tickFormatter={(val) => val.split('-').slice(1).reverse().join('/')}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-white p-6">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Distribución por Acción</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.auditStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="accion"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="_count" radius={[8, 8, 8, 8]} barSize={40}>
                                    {stats.auditStats.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={actionColors[entry.accion] || "#64748b"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
