"use client"

import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { Users, DollarSign } from "lucide-react"

type DistributionData = {
    name: string
    value: number
}

type PayrollTrendData = {
    name: string
    total: number
}

interface HRChartsProps {
    distributionData: DistributionData[]
    payrollTrend: PayrollTrendData[]
    loading?: boolean
}

const COLORS = [
    "#3b82f6", // Blue
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#f43f5e", // Rose
    "#10b981", // Emerald
    "#f59e0b", // Amber
]

export function HRCharts({ distributionData, payrollTrend, loading }: HRChartsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 animate-pulse">
                <div className="h-[350px] w-full rounded-[2rem] bg-slate-100" />
                <div className="h-[350px] w-full rounded-[2rem] bg-slate-100" />
            </div>
        )
    }

    // Default data if empty to show something nice
    const activeDistribution = distributionData.length > 0 ? distributionData : [{ name: 'Sin Datos', value: 1 }]
    const isDistEmpty = distributionData.length === 0

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Payroll Cost Trend */}
            <div className="group relative bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden p-8 hover:shadow-2xl transition-all">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 rounded-xl">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Costo de Nómina</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Evolución Mensual</p>
                        </div>
                    </div>
                </div>

                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={payrollTrend}>
                            <defs>
                                <linearGradient id="colorNomina" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.3} />
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
                                cursor={{ fill: '#f8fafc' }}
                            />
                            <Bar
                                dataKey="total"
                                fill="url(#colorNomina)"
                                radius={[12, 12, 0, 0]}
                                name="Total Nómina"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Department Distribution */}
            <div className="group relative bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden p-8 hover:shadow-2xl transition-all">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 rounded-xl">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Capital Humano</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Distribución por Área</p>
                        </div>
                    </div>
                </div>

                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={activeDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {activeDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={isDistEmpty ? "#e2e8f0" : COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value: number) => isDistEmpty ? '0' : [value, 'Colaboradores']}
                            />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                iconType="circle"
                                formatter={(value) => <span className="text-xs font-bold text-slate-500 ml-2">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
