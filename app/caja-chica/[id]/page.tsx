"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft,
    AlertCircle,
    MessageSquare,
    CheckCircle2,
    Clock,
    User as UserIcon,
    History,
    Edit3,
    Printer
} from "lucide-react"
import { PettyCorrectionDialog } from "@/components/caja-chica/correction-dialog"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function PettyCashHistoryPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [movements, setMovements] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedMovement, setSelectedMovement] = useState<any>(null)
    const [isCorrectionOpen, setIsCorrectionOpen] = useState(false)

    const fetchMovements = async () => {
        try {
            const res = await fetch(`/api/caja-chica/${params.id}/movements`)
            if (res.ok) {
                const data = await res.json()
                setMovements(data)
            }
        } catch (error) {
            console.error("Error fetching history", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMovements()
    }, [params.id])

    const handleMarkInconsistency = async (id: string, current: boolean) => {
        try {
            const res = await fetch(`/api/caja-chica/movements/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inconsistente: !current,
                    observaciones: !current ? "Se detectó discrepancia en el comprobante adjunto." : null
                })
            })
            if (res.ok) {
                toast.success(!current ? "Inconsistencia marcada" : "Registro validado localmente")
                fetchMovements()
            }
        } catch (error) {
            toast.error("Error al actualizar estado")
        }
    }

    if (loading) return <div className="p-8 text-center animate-pulse">Cargando historial de caja chica...</div>

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" /> Volver al Control Global
                    </Button>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-gray-500 border-gray-200">
                            Historial de Auditoría
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="bg-slate-900 text-white p-8">
                            <div className="flex items-center gap-3 mb-2">
                                <History className="h-6 w-6 text-indigo-400" />
                                <CardTitle className="text-2xl font-black">Bitácora de Movimientos</CardTitle>
                            </div>
                            <CardTitle className="text-sm opacity-60 font-medium">Registros cronológicos sujetos a fiscalización institucional</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b">
                                        <tr>
                                            <th className="px-6 py-4">Fecha / Hora</th>
                                            <th className="px-6 py-4">Concepto y Referencia</th>
                                            <th className="px-6 py-4">Monto (C$)</th>
                                            <th className="px-6 py-4">Estado / Usuario</th>
                                            <th className="px-6 py-4 text-right">Fiscalización</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {movements.map((move: any) => (
                                            <tr key={move.id} className={`${move.inconsistente ? 'bg-red-50/50' : 'hover:bg-slate-50/50'} transition-colors`}>
                                                <td className="px-6 py-4 font-mono text-xs text-gray-400">
                                                    {format(new Date(move.fecha), "dd MMM yyyy", { locale: es })}<br />
                                                    {format(new Date(move.fecha), "HH:mm")}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-900">{move.descripcion}</p>
                                                    <p className="text-xs text-slate-400">Ref: {move.referencia || 'S/R'}</p>
                                                </td>
                                                <td className={`px-6 py-4 font-black ${move.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {move.tipo === 'INGRESO' ? '+' : '-'} {Number(move.monto).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 space-y-1">
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                                                        <UserIcon className="h-3 w-3" /> {move.usuario.nombre} {move.usuario.apellido}
                                                    </div>
                                                    <Badge className={`text-[9px] uppercase font-black ${move.estado === 'VALIDADO' ? 'bg-emerald-50 text-emerald-600' :
                                                        move.estado === 'PENDIENTE_VALIDACION' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-slate-100 text-slate-500'
                                                        } border-none`}>
                                                        {move.estado === 'PENDIENTE_VALIDACION' ? 'Pendiente General' : move.estado}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setSelectedMovement(move)
                                                                setIsCorrectionOpen(true)
                                                            }}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Edit3 className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => window.open(`/caja-chica/print/${move.id}`, '_blank', 'width=900,height=800')}
                                                            title="Imprimir Vale"
                                                        >
                                                            <Printer className="h-3.5 w-3.5 text-slate-500" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={move.inconsistente ? "destructive" : "outline"}
                                                            onClick={() => handleMarkInconsistency(move.id, move.inconsistente)}
                                                            className="gap-2 h-8 text-[11px] font-bold"
                                                        >
                                                            {move.inconsistente ? (
                                                                <> <AlertCircle className="h-3.5 w-3.5" /> Inconsistente </>
                                                            ) : (
                                                                <> <CheckCircle2 className="h-3.5 w-3.5" /> Marcar Observación </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <PettyCorrectionDialog
                open={isCorrectionOpen}
                onOpenChange={setIsCorrectionOpen}
                movement={selectedMovement}
                onSuccess={fetchMovements}
            />
        </DashboardLayout>
    )
}
