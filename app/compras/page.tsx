"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Plus,
    Search,
    Filter,
    Eye,
    ShoppingBag,
    ShoppingCart,
    Truck,
    PackageCheck,
    FileText,
    Clock,
    AlertCircle,
    Building2,
    TrendingUp,
    Archive
} from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
// import { useSession } from "next-auth/react" // Not used yet

export default function ComprasPage() {
    const router = useRouter()
    // const { data: session } = useSession()
    const [loading, setLoading] = useState(true)

    // Simulation Data
    const [recentRequests, setRecentRequests] = useState<any[]>([])
    const [recentOrders, setRecentOrders] = useState<any[]>([])

    const [stats, setStats] = useState({
        pendingRequests: 0,
        activeOrders: 0,
        budgetCommitted: 0,
        totalExecuted: 0
    })

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true)
                const [reqRes, orderRes] = await Promise.all([
                    fetch('/api/compras/solicitudes?limit=5'),
                    fetch('/api/compras/ordenes?limit=5')
                ])

                if (reqRes.ok && orderRes.ok) {
                    const reqData = await reqRes.json()
                    const orderData = await orderRes.json()

                    setRecentRequests(reqData.data || [])
                    setRecentOrders(orderData.data || [])

                    setStats({
                        pendingRequests: reqData.stats?.pending || 0,
                        activeOrders: orderData.stats?.activeOrders || 0,
                        budgetCommitted: orderData.stats?.budgetCommitted || 0,
                        totalExecuted: orderData.stats?.totalExecuted || 0
                    })
                }
            } catch (error) {
                console.error("Error fetching dashboard data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                        <ShoppingBag className="h-32 w-32 rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">Compras y <span className="text-indigo-600">Adquisiciones</span></h1>
                        <p className="text-slate-500 mt-2 font-bold text-sm flex items-center gap-2">
                            <Truck className="h-4 w-4 text-indigo-500" />
                            Gestión del Plan Anual de Compras y Contrataciones (PAC)
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 relative z-10">
                        <Button
                            variant="outline"
                            className="gap-2 rounded-xl h-12 px-6 border-slate-200 bg-white font-black uppercase text-[10px] hover:bg-slate-50 transition-all"
                            onClick={() => router.push('/entidades?type=PROVEEDOR')}
                        >
                            <Building2 className="h-4 w-4 text-slate-500" /> Proveedores
                        </Button>

                        <Link href="/compras/solicitudes/nueva">
                            <Button variant="outline" className="gap-2 rounded-xl h-12 px-6 border-indigo-100 bg-indigo-50/50 text-indigo-700 font-black uppercase text-[10px] hover:bg-indigo-100 transition-all">
                                <FileText className="h-4 w-4" /> Nueva Solicitud
                            </Button>
                        </Link>

                        <Link href="/compras/ordenes/nueva">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 h-12 px-8 rounded-xl shadow-xl shadow-indigo-100 font-black uppercase text-[10px] transition-all hover:translate-y-[-2px]">
                                <Plus className="h-5 w-5" /> Nueva Orden de Compra
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="border-none shadow-sm bg-white overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 transition-all group-hover:w-2" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Solicitudes Pendientes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-gray-900">{stats.pendingRequests}</div>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-amber-500" /> En espera de aprobación
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 transition-all group-hover:w-2" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Órdenes Activas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-gray-900">{stats.activeOrders}</div>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase flex items-center gap-1">
                                <Truck className="h-3.5 w-3.5 text-indigo-500" /> En proceso de entrega
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 transition-all group-hover:w-2" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Comprometido (PAC)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-gray-900">{formatCurrency(stats.budgetCommitted)}</div>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase flex items-center gap-1">
                                <ShoppingCart className="h-3.5 w-3.5 text-blue-500" /> Reservado por O.C.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-emerald-50 overflow-hidden relative group">
                        <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:rotate-12 transition-transform">
                            <PackageCheck className="h-24 w-24 text-emerald-600" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Ejecución Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-emerald-700">{formatCurrency(stats.totalExecuted)}</div>
                            <p className="text-[10px] text-emerald-600/60 mt-2 font-bold uppercase flex items-center gap-1">
                                <TrendingUp className="h-3.5 w-3.5" /> Compras Finalizadas
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Content Tabs */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Recent Requests */}
                    <Card className="border-none shadow-lg bg-white overflow-hidden rounded-2xl h-full flex flex-col">
                        <CardHeader className="border-b border-gray-50 bg-gray-50/30">
                            <CardTitle className="text-sm font-black text-gray-900 uppercase">Solicitudes Recientes</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            {recentRequests.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-xs font-medium uppercase tracking-widest h-full flex flex-col items-center justify-center">
                                    <Archive className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    No hay solicitudes pendientes
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {recentRequests.map(req => (
                                        <div key={req.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{req.numero}</span>
                                                    <span className="text-[10px] font-bold uppercase text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-700 mt-1 line-clamp-1">{req.justificacion}</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{req.solicitante?.nombre} {req.solicitante?.apellido}</p>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] font-black uppercase">{req.estado}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Orders */}
                    <Card className="border-none shadow-lg bg-white overflow-hidden rounded-2xl h-full flex flex-col">
                        <CardHeader className="border-b border-gray-50 bg-gray-50/30">
                            <CardTitle className="text-sm font-black text-gray-900 uppercase">Órdenes de Compra Recientes</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            {recentOrders.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-xs font-medium uppercase tracking-widest h-full flex flex-col items-center justify-center">
                                    <Archive className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    No hay órdenes activas
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {recentOrders.map(order => (
                                        <div
                                            key={order.id}
                                            onClick={() => router.push(`/compras/ordenes/${order.id}`)}
                                            className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer group"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded group-hover:bg-emerald-100 transition-colors">{order.numero}</span>
                                                    <span className="text-[10px] font-bold uppercase text-slate-400">{new Date(order.fechaEmision).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-700 mt-1">{order.proveedor?.nombre}</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{formatCurrency(order.total)}</p>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] font-black uppercase">{order.estado}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </DashboardLayout>
    )
}
