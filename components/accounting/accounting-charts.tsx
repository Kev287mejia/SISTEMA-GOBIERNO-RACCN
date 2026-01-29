"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react"

type TrendData = {
    name: string
    ingresos: number
    egresos: number
}

type StatusData = {
    name: string
    value: number
}

interface AccountingChartsProps {
    trendData: TrendData[]
    statusData: StatusData[]
    loading?: boolean
}

const COLORS = {
    ingreso: "#10b981", // Emerald
    egreso: "#ef4444",  // Red
    pending: "#f59e0b", // Amber
    approved: "#10b981", // Emerald
    draft: "#94a3b8",   // Slate
    rejected: "#ef4444" // Red
}

export function AccountingCharts({ trendData, statusData, loading }: AccountingChartsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 animate-pulse">
                <div className="h-[350px] w-full rounded-[2rem] bg-slate-100" />
                <div className="h-[350px] w-full rounded-[2rem] bg-slate-100" />
            </div>
        )
    }

    console.log("Charts Data:", { trendData, statusData })

    if (!loading && (!trendData.length && !statusData.length)) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <div className="h-[350px] w-full rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-400">
                    No hay datos financieros disponibles
                </div>
                <div className="h-[350px] w-full rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-400">
                    No hay datos de estado disponibles
                </div>
            </div>
        )
    }

    // Logic for Status Colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APROBADO': return COLORS.approved
            case 'PENDIENTE': return COLORS.pending
            case 'BORRADOR': return COLORS.draft
            case 'RECHAZADO': return COLORS.rejected
            default: return "#6366f1"
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Balance Trend Area Chart */}
            <div className="group relative bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden p-8 hover:shadow-2xl transition-all">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 rounded-xl">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Balance Fiscal</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ingresos vs Egresos</p>
                        </div>
                    </div>
                </div>

                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorIngreso" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.ingreso} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.ingreso} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorEgreso" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.egreso} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.egreso} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value: number) => formatCurrency(value)}
                                labelStyle={{ color: '#64748b', fontWeight: 'bold' }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '10px' }} />
                            <Area
                                type="monotone"
                                dataKey="ingresos"
                                stroke={COLORS.ingreso}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorIngreso)"
                                name="Ingresos"
                            />
                            <Area
                                type="monotone"
                                dataKey="egresos"
                                stroke={COLORS.egreso}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorEgreso)"
                                name="Egresos"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Status Distribution Pie Chart */}
            <div className="group relative bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden p-8 hover:shadow-2xl transition-all">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-50 rounded-xl">
                            <PieChartIcon className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Eficiencia Operativa</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado de los Asientos</p>
                        </div>
                    </div>
                </div>

                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value: number) => [value, 'Asientos']}
                                itemStyle={{ fontWeight: 'bold', color: '#334155' }}
                            />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                iconType="circle"
                                formatter={(value) => <span className="text-xs font-bold text-slate-500 ml-2 uppercase">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
