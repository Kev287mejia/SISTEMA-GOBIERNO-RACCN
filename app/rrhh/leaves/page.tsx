"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Filter, Plus, Search, UserCheck, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { LeaveRequestDialog } from "@/components/hr/leave-request-dialog"

export default function LeavesPage() {
    const [leaves, setLeaves] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [search, setSearch] = useState("")

    const fetchLeaves = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/hr/leaves")
            if (res.ok) {
                const data = await res.json()
                setLeaves(data)
            }
        } catch (error) {
            console.error("Error fetching leaves", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLeaves()
    }, [])

    const filteredLeaves = leaves.filter(l =>
        l.empleado?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        l.empleado?.apellido?.toLowerCase().includes(search.toLowerCase()) ||
        l.tipo.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-7xl mx-auto pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-gray-900">Control de Ausencias</h1>
                        <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-indigo-500" />
                            Gestión de vacaciones, permisos y reposos médicos
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button onClick={() => setIsDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-lg shadow-indigo-100">
                            <Plus className="h-4 w-4" /> Registrar Ausencia
                        </Button>
                    </div>
                </div>

                <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl">
                    <CardHeader className="border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between py-6 gap-4">
                        <div>
                            <CardTitle className="text-xl font-black text-gray-900 uppercase tracking-tight">Historial de Solicitudes</CardTitle>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar empleado o tipo..."
                                    className="pl-10 w-[300px] border-none bg-gray-50 rounded-xl text-sm focus-visible:ring-indigo-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex justify-center p-10"><div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div></div>
                        ) : filteredLeaves.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">No hay registros de ausencias.</div>
                        ) : (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="h-12 px-6 text-left align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Empleado</th>
                                            <th className="h-12 px-6 text-left align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Tipo</th>
                                            <th className="h-12 px-6 text-center align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Periodo</th>
                                            <th className="h-12 px-6 text-center align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Días</th>
                                            <th className="h-12 px-6 text-center align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Estado Pago</th>
                                            <th className="h-12 px-6 text-center align-middle font-black text-[10px] uppercase tracking-wider text-gray-400">Estatus</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredLeaves.map((leave) => (
                                            <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-900">
                                                    {leave.empleado.nombre} {leave.empleado.apellido}
                                                    <span className="block text-[10px] text-gray-400 font-medium">{leave.empleado.cedula}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="font-bold border-slate-200 text-slate-600">
                                                        {leave.tipo.replace("_", " ")}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-center text-xs">
                                                    {new Date(leave.fechaInicio).toLocaleDateString()} - {new Date(leave.fechaFin).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-center font-black text-gray-900">
                                                    {leave.dias}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {leave.conGoceSueldo ? (
                                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none">Pagado</Badge>
                                                    ) : (
                                                        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none shadow-none">Deducible</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">{leave.estado}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <LeaveRequestDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={fetchLeaves} />
            </div>
        </DashboardLayout>
    )
}
