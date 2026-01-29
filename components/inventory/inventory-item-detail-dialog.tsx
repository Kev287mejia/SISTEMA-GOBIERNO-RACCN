"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import {
    Package,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    User,
    Calendar,
    ArrowRightLeft,
    Clock,
    FileText,
    PieChart,
    Layers,
    History
} from "lucide-react"

interface InventoryItemDetailDialogProps {
    item: any | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function InventoryItemDetailDialog({ item, open, onOpenChange }: InventoryItemDetailDialogProps) {
    if (!item) return null

    const isLowStock = Number(item.stockActual) <= Number(item.stockMinimo)
    const valorTotal = Number(item.stockActual) * Number(item.costoUnitario)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl overflow-hidden p-0 gap-0 border-none rounded-2xl shadow-2xl">
                {/* Header Section */}
                <div className="bg-indigo-600 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Package className="h-40 w-40 rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Artículo de Inventario / Kardex</p>
                                <h2 className="text-3xl font-black leading-tight">{item.nombre}</h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="font-mono text-sm bg-black/20 px-2 py-0.5 rounded text-indigo-50">SKU: {item.codigo}</span>
                                    {isLowStock ? (
                                        <Badge className="bg-red-500 text-white border-none font-black px-3 py-1 shadow-lg animate-pulse">
                                            STOCK BAJO
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-indigo-500 text-white border-none font-black px-3 py-1 shadow-lg">
                                            DISPONIBLE
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mt-6">
                            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                                <p className="text-indigo-200 text-[9px] font-black uppercase tracking-widest">Stock Actual</p>
                                <p className="text-xl font-black">{item.stockActual} <span className="text-xs font-bold opacity-70">{item.unidadMedida}</span></p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                                <p className="text-indigo-200 text-[9px] font-black uppercase tracking-widest">Costo Unit.</p>
                                <p className="text-xl font-black">{formatCurrency(item.costoUnitario)}</p>
                            </div>
                            <div className="bg-indigo-700/50 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                                <p className="text-indigo-200 text-[9px] font-black uppercase tracking-widest">Valorización</p>
                                <p className="text-xl font-black text-indigo-100">{formatCurrency(valorTotal)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 bg-white grid grid-cols-1 md:grid-cols-5 gap-8">
                    <div className="md:col-span-3 space-y-8">
                        {/* Summary Section */}
                        <section className="space-y-4">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <PieChart className="h-3 w-3" /> Descripción y Detalles
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                    {item.descripcion || "Sin descripción técnica registrada."}
                                </p>
                            </div>
                        </section>

                        {/* Recent Transactions */}
                        <section className="space-y-4">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <History className="h-3 w-3" /> Últimos Movimientos
                            </h3>
                            <div className="space-y-3">
                                {item.transacciones?.length > 0 ? (
                                    item.transacciones.slice(0, 5).map((t: any) => (
                                        <div key={t.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${t.tipo === 'ENTRADA' ? 'bg-emerald-50 text-emerald-600' :
                                                        t.tipo === 'SALIDA' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    {t.tipo === 'ENTRADA' ? <TrendingUp className="h-4 w-4" /> :
                                                        t.tipo === 'SALIDA' ? <TrendingDown className="h-4 w-4" /> : <ArrowRightLeft className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{t.tipo}</p>
                                                    <p className="text-[11px] font-bold text-gray-700">{new Date(t.fecha).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-gray-900">{t.tipo === 'SALIDA' ? '-' : '+'}{t.cantidad} {item.unidadMedida}</p>
                                                <p className="text-[9px] text-gray-400 font-bold">{formatCurrency(t.costoTotal)}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-xs font-bold text-gray-400">Sin movimientos registrados</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Section */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6 h-full">
                            <section className="space-y-4">
                                <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                    <Layers className="h-3 w-3" /> Configuración Kardex
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">Categoría</span>
                                        <Badge variant="outline" className="text-[10px] font-black h-5 border-indigo-100 text-indigo-600 uppercase">{item.categoria}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">Método</span>
                                        <span className="text-xs font-black text-gray-800">{item.metodoKardex}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">Stock Mínimo</span>
                                        <span className="text-xs font-black text-red-600">{item.stockMinimo} {item.unidadMedida}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">Stock Máximo</span>
                                        <span className="text-xs font-black text-emerald-600">{item.stockMaximo || "N/A"}</span>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 pt-6 border-t border-gray-200">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <User className="h-3 w-3" /> Trazabilidad
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-white border border-gray-100 flex items-center justify-center">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-gray-400 font-black uppercase">Fecha Registro</p>
                                            <p className="text-[11px] font-bold text-gray-700">{new Date(item.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                                            {item.creadoPor?.nombre?.[0] || 'A'}
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-gray-400 font-black uppercase">Registrado Por</p>
                                            <p className="text-[11px] font-bold text-gray-700">
                                                {item.creadoPor ? `${item.creadoPor.nombre} ${item.creadoPor.apellido || ""}` : "Administrador"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="pt-6 border-t border-gray-200 mt-auto">
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-[9px] font-black text-indigo-700 uppercase leading-none">Última Actualización</p>
                                        <p className="text-[10px] font-medium text-indigo-600 mt-1">{new Date(item.updatedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t">
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2.5 text-[10px] font-black uppercase text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all border border-gray-200 flex items-center gap-2"
                    >
                        <FileText className="h-3.5 w-3.5" /> Kardex Físico
                    </button>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-8 py-2.5 text-[10px] font-black uppercase bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-100"
                    >
                        Cerrar
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
