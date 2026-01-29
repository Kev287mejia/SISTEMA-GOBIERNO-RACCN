"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, PieChart as PieChartIcon, Activity } from "lucide-react"

type TrendData = {
    name: string
    gasto: number
}

type PieData = {
    name: string
    value: number
}

interface BudgetChartsProps {
    trendData: TrendData[]
    pieData: PieData[]
    loading?: boolean
}

const COLORS = [
    "#10b981", // Emerald 500
    "#3b82f6", // Blue 500
    "#f59e0b", // Amber 500
    "#ef4444", // Red 500
    "#8b5cf6", // Violet 500
    "#ec4899", // Pink 500
    "#06b6d4", // Cyan 500
    "#6366f1", // Indigo 500
]

export function BudgetCharts({ trendData, pieData, loading }: BudgetChartsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="h-[400px] w-full rounded-[2.5rem] bg-slate-100 animate-pulse" />
                <div className="h-[400px] w-full rounded-[2.5rem] bg-slate-100 animate-pulse" />
            </div>
        )
    }

    // Prepare data for PieChart - if empty, show a placeholder entry
    const activePieData = pieData.length > 0 ? pieData : [{ name: 'Sin Datos', value: 1 }]
    const isPieEmpty = pieData.length === 0

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Line/Area Chart: Annual Behavior */}
            <div className="group relative bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden p-8 transition-all hover:shadow-2xl">
                <div className="flex flex-col space-y-2 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-2xl">
                            <Activity className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Comportamiento del Gasto</h3>
                            <p className="text-sm font-medium text-slate-400">Tendencia mensual de ejecución presupuestaria</p>
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                                formatter={(value: number) => [formatCurrency(value), 'Ejecutado']}
                                labelStyle={{ color: '#64748b', fontWeight: 'bold' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="gasto"
                                stroke="#3b82f6"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorGasto)"
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pie Chart: Spending by Department */}
            <div className="group relative bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden p-8 transition-all hover:shadow-2xl">
                <div className="flex flex-col space-y-2 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-50 rounded-2xl">
                            <PieChartIcon className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Distribución por Área</h3>
                            <p className="text-sm font-medium text-slate-400">Consumo de presupuesto por categorías</p>
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full mt-4 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={activePieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                                animationDuration={1500}
                                animationBegin={200}
                            >
                                {activePieData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={isPieEmpty ? "#e2e8f0" : COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value: number) => isPieEmpty ? ['0', 'Sin datos'] : [formatCurrency(value), 'Ejecutado']}
                                labelStyle={{ display: 'none' }}
                            />
                            {!isPieEmpty && (
                                <Legend
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    iconType="circle"
                                    formatter={(value) => <span className="text-xs font-bold text-slate-600 ml-1">{value}</span>}
                                />
                            )}
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
