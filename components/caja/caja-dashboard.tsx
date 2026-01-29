"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Banknote,
    ArrowUpCircle,
    ArrowDownCircle,
    Clock,
    CheckCircle2,
    Lock
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { MovementForm } from "./movement-form"
import { CheckForm } from "./check-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function CajaDashboard() {
    const router = useRouter()
    const [stats, setStats] = useState({
        balanceActual: 0,
        ingresosHoy: 0,
        egresosHoy: 0,
        pendientesValidacion: 0
    })
    const [loading, setLoading] = useState(true)
    const [isMovementOpen, setIsMovementOpen] = useState(false)
    const [isCheckOpen, setIsCheckOpen] = useState(false)

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/caja/movements")
            if (res.ok) {
                const data = await res.json()
                const today = new Date().toISOString().split('T')[0]
                const todayMovements = data.filter((m: any) => m.fecha.startsWith(today))

                const ingresos = todayMovements.filter((m: any) => m.tipo === "INGRESO").reduce((acc: number, m: any) => acc + Number(m.monto), 0)
                const egresos = todayMovements.filter((m: any) => m.tipo === "EGRESO").reduce((acc: number, m: any) => acc + Number(m.monto), 0)

                setStats(prev => ({
                    ...prev,
                    ingresosHoy: ingresos,
                    egresosHoy: egresos,
                    balanceActual: ingresos - egresos
                }))
            }

            const checksRes = await fetch("/api/caja/checks")
            if (checksRes.ok) {
                const checks = await checksRes.json()
                const pending = checks.filter((c: any) => c.estado === "PENDIENTE_VALIDACION").length
                setStats(prev => ({
                    ...prev,
                    pendientesValidacion: pending
                }))
            }
        } catch (error) {
            console.error("Error fetching caja stats", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    const handleClosure = () => {
        // We tell the user to go to the closures tab for safety
        toast.info("Por favor, proceda a la pestaña de 'Cierres de Caja' para completar esta acción.")
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saldo Actual (Hoy)</CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.balanceActual.toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })}</div>
                    <p className="text-xs text-muted-foreground">Efectivo disponible en caja</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
                    <ArrowUpCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{stats.ingresosHoy.toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })}</div>
                    <p className="text-xs text-muted-foreground">Total percibido hoy</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Egresos Hoy</CardTitle>
                    <ArrowDownCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">-{stats.egresosHoy.toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })}</div>
                    <p className="text-xs text-muted-foreground">Total pagado hoy</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pendientes de Validación</CardTitle>
                    <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.pendientesValidacion}</div>
                    <p className="text-xs text-muted-foreground">Cheques por validar</p>
                </CardContent>
            </Card>

            <Card className="col-span-full">
                <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <Dialog open={isMovementOpen} onOpenChange={setIsMovementOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Banknote className="h-4 w-4" />
                                Nuevo Movimiento
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Registrar Movimiento</DialogTitle>
                            </DialogHeader>
                            <MovementForm onSuccess={() => {
                                setIsMovementOpen(false)
                                fetchStats()
                            }} />
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isCheckOpen} onOpenChange={setIsCheckOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Registrar Cheque
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Registrar Cheque</DialogTitle>
                            </DialogHeader>
                            <CheckForm onSuccess={() => {
                                setIsCheckOpen(false)
                                fetchStats()
                            }} />
                        </DialogContent>
                    </Dialog>

                    <Button variant="destructive" className="gap-2" onClick={handleClosure}>
                        <Lock className="h-4 w-4" />
                        Cierre de Caja
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
