"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Wallet,
    ArrowUpCircle,
    ArrowDownCircle,
    AlertTriangle,
    Plus,
    FileText,
    Printer,
    Search,
    History
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { PettyCashForm } from "./petty-cash-form"
import { PettyMovementForm } from "./petty-movement-form"
import { PettyReportDialog } from "./report-dialog"
import { ArqueoDialog } from "./arqueo-dialog"

export function CreditoDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isBoxOpen, setIsBoxOpen] = useState(false)
    const [isMovementOpen, setIsMovementOpen] = useState(false)
    const [isReportOpen, setIsReportOpen] = useState(false)

    const fetchStats = async () => {
        try {
            const res = await fetch(`/api/caja-chica/statistics?t=${Date.now()}`)
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (error) {
            console.error("Error fetching stats", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    if (loading) return <div className="p-8 text-center animate-pulse">Cargando panel de caja chica...</div>

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-gray-900">Control de Caja Chica</h2>
                    <p className="text-gray-500">Gestión de fondos para Lic. Sofia Loren Montoya</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" onClick={() => setIsReportOpen(true)}>
                        <Printer className="h-4 w-4" /> Generar Reporte
                    </Button>
                    <Dialog open={isBoxOpen} onOpenChange={setIsBoxOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="h-4 w-4" /> Apertura de Caja
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Registrar Apertura de Caja Chica</DialogTitle>
                            </DialogHeader>
                            <PettyCashForm onSuccess={() => {
                                setIsBoxOpen(false)
                                fetchStats()
                            }} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-wider">Saldo Global</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-gray-900">
                            C$ {stats?.totalBalance?.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Total en todas las cajas</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-wider">Cajas Activas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-indigo-600">{stats?.totalBoxes}</div>
                        <p className="text-xs text-muted-foreground mt-1">Sujetas a revisión</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-wider">Inconsistencias</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-amber-500">{stats?.inconsistencies}</div>
                        <p className="text-xs text-muted-foreground mt-1">Pendientes de observación</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-wider">Institución</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-black text-emerald-600">GRACCNN</div>
                        <p className="text-xs text-muted-foreground mt-1">Control Administrativo Financiero</p>
                    </CardContent>
                </Card>
            </div>

            {/* Boxes Overview */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-xl">Resumen de Cajas Chicas</CardTitle>
                    <CardDescription>Estado actual de fondos fiduciarios</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-gray-500 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-4">Nombre de Caja</th>
                                    <th className="px-6 py-4">Saldo Actual</th>
                                    <th className="px-6 py-4">Pendientes Validar</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {stats?.boxes?.map((box: any) => (
                                    <tr key={box.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">{box.nombre}</td>
                                        <td className="px-6 py-4 font-mono text-indigo-600 font-bold">C$ {box.montoActual.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                                                {box.pendingValidations}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={box.estado === 'ACTIVA' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}>
                                                {box.estado}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <ArqueoDialog
                                                    boxId={box.id}
                                                    boxName={box.nombre}
                                                    expectedBalance={box.montoActual}
                                                    onSuccess={fetchStats}
                                                />
                                                <Dialog open={isMovementOpen} onOpenChange={setIsMovementOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="ghost" className="gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                                                            <Plus className="h-3 w-3" /> Movimiento
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Registrar Movimiento - {box.nombre}</DialogTitle>
                                                        </DialogHeader>
                                                        <PettyMovementForm
                                                            boxId={box.id}
                                                            onSuccess={() => {
                                                                setIsMovementOpen(false)
                                                                fetchStats()
                                                                toast.success("Movimiento registrado satisfactoriamente")
                                                            }}
                                                        />
                                                    </DialogContent>
                                                </Dialog>
                                                <Button size="sm" variant="ghost" className="gap-2 text-slate-600" asChild>
                                                    <Link href={`/caja-chica/${box.id}`}>
                                                        <History className="h-3 w-3" /> Historial <span className="text-[8px] opacity-50">({box.id.slice(-4)})</span>
                                                    </Link>
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

            <PettyReportDialog open={isReportOpen} onOpenChange={setIsReportOpen} boxes={stats?.boxes || []} />
        </div>
    )
}
