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
        <div className="space-y-12">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-[2rem] shadow-xl border-slate-100 hover:shadow-2xl transition-all bg-white p-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[13px] font-black uppercase text-slate-700 tracking-wider">SALDO ACTUAL (HOY)</CardTitle>
                        <div className="bg-slate-100 p-2 rounded-full">
                            <Banknote className="h-4 w-4 text-slate-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="text-center pb-6">
                        <div className="text-4xl font-black text-slate-900 tracking-tighter mb-2">C$0.00</div>
                        <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400">EFECTIVO DISPONIBLE EN CAJA</p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] shadow-xl border-slate-100 hover:shadow-2xl transition-all bg-white p-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[13px] font-black uppercase text-slate-700 tracking-wider">INGRESOS HOY</CardTitle>
                        <div className="bg-green-50 p-2 rounded-full">
                            <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="text-center pb-6">
                        <div className="text-4xl font-black text-slate-900 tracking-tighter mb-2">C$0.00</div>
                        <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400">TOTAL PERCIBIDO HOY</p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] shadow-xl border-slate-100 hover:shadow-2xl transition-all bg-white p-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[13px] font-black uppercase text-slate-700 tracking-wider">EGRESO HOY</CardTitle>
                        <div className="bg-rose-50 p-2 rounded-full">
                            <ArrowDownCircle className="h-4 w-4 text-rose-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="text-center pb-6">
                        <div className="text-4xl font-black text-slate-900 tracking-tighter mb-2">-C$0.00</div>
                        <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400">TOTAL PAGADO HOY</p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] shadow-xl border-slate-100 hover:shadow-2xl transition-all bg-white p-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[13px] font-black uppercase text-slate-700 tracking-wider leading-tight">PENDIENTES DE VALIDACIÓN</CardTitle>
                        <div className="bg-orange-50 p-2 rounded-full">
                            <Clock className="h-4 w-4 text-orange-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="text-center pb-6">
                        <div className="text-4xl font-black text-slate-900 tracking-tighter mb-2">C$0.00</div>
                        <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400">CHEQUES POR VALIDAR</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12 space-y-6">
                {/* Banner de Acciones Rápidas */}
                <Card className="w-full bg-[#526066] rounded-[1.5rem] overflow-hidden shadow-2xl border-0 p-0">
                    <CardContent className="flex items-center px-10 py-6 gap-6">
                        <div className="text-[#9ae2df] opacity-80 animate-pulse">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg>
                        </div>
                        <h2 className="text-[32px] font-black uppercase text-white tracking-[0.2em] drop-shadow-lg">ACCIONES RÁPIDAS</h2>
                    </CardContent>
                </Card>

                {/* Botones de acción envueltos en Dialogos */}
                <div className="flex flex-wrap gap-6 px-4">
                    <Dialog open={isMovementOpen} onOpenChange={setIsMovementOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-full bg-[#8c8c8b] hover:bg-slate-600 text-white font-black uppercase tracking-widest text-[11px] px-12 py-7 shadow-xl transition-all hover:scale-105 active:scale-95">
                                <Banknote className="h-4 w-4 mr-3" />
                                Nuevo movimiento
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] p-8 max-w-2xl bg-white/95 backdrop-blur-xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight mb-4">Registrar Movimiento</DialogTitle>
                            </DialogHeader>
                            <MovementForm onSuccess={() => {
                                setIsMovementOpen(false)
                                fetchStats()
                            }} />
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="rounded-full bg-[#8c8c8b] hover:bg-slate-600 text-white font-black uppercase tracking-widest text-[11px] px-12 py-7 shadow-xl transition-all hover:scale-105 active:scale-95">
                                <ArrowUpCircle className="h-4 w-4 mr-3" />
                                Ingresar fondos
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] p-8 max-w-2xl bg-white/95 backdrop-blur-xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight mb-4">Reposición de Fondos (Entrada)</DialogTitle>
                            </DialogHeader>
                            <MovementForm
                                defaultValues={{
                                    tipo: "INGRESO",
                                    descripcion: "Reposición de efectivo desde Bóveda Central",
                                    monto: ""
                                }}
                                onSuccess={() => fetchStats()}
                            />
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isCheckOpen} onOpenChange={setIsCheckOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-full bg-[#8c8c8b] hover:bg-slate-600 text-white font-black uppercase tracking-widest text-[11px] px-12 py-7 shadow-xl transition-all hover:scale-105 active:scale-95">
                                <ArrowDownCircle className="h-4 w-4 mr-3" />
                                Registrar cheque
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] p-8 max-w-2xl bg-white/95 backdrop-blur-xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight mb-4">Emisión de Cheque (Salida)</DialogTitle>
                            </DialogHeader>
                            <CheckForm onSuccess={() => {
                                setIsCheckOpen(false)
                                fetchStats()
                            }} />
                        </DialogContent>
                    </Dialog>

                    <Button onClick={handleClosure} className="rounded-full bg-[#8c8c8b] hover:bg-slate-600 text-white font-black uppercase tracking-widest text-[11px] px-12 py-7 shadow-xl transition-all hover:scale-105 active:scale-95">
                        <Lock className="h-4 w-4 mr-3" />
                        Cierre de caja
                    </Button>
                </div>
            </div>
        </div>
    )
}
