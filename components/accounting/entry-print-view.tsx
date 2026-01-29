"use client"

import { useEffect, useState } from "react"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"

export function EntryPrintView({ entry }: { entry: any }) {
    useEffect(() => {
        // Auto-print when page loads
        setTimeout(() => {
            window.print()
        }, 500)
    }, [])

    const isIngreso = entry.tipo === 'INGRESO'

    return (
        <div className="bg-white p-8 max-w-[21cm] mx-auto min-h-screen">
            {/* Header Oficial */}
            <div className="flex justify-between items-start mb-8 border-b-2 border-slate-800 pb-6">
                <div className="flex gap-4 items-center">
                    <img src="/logo-gobierno.png" alt="Gobierno" className="h-16 w-auto" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 uppercase">Gobierno Regional</h1>
                        <p className="text-sm text-slate-600 font-medium">Departamento de Contabilidad</p>
                        <p className="text-xs text-slate-500">RUC: 20123456789</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="inline-block bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Comprobante de Diario</p>
                        <p className="text-2xl font-black text-slate-900">{entry.numero}</p>
                    </div>
                </div>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Concepto</label>
                        <p className="text-sm font-medium text-slate-800 leading-relaxed border-l-2 border-slate-200 pl-3">
                            {entry.descripcion}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Fecha</label>
                            <DateDisplay date={entry.fecha} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Tipo</label>
                            <span className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase rounded ${isIngreso ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                {entry.tipo}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-4">
                        <span className="text-xs font-bold text-slate-500 uppercase">Monto Total</span>
                        <span className="text-2xl font-black text-slate-900">{formatCurrency(entry.monto)}</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Cuenta Contable</span>
                            <span className="font-mono font-bold text-slate-700">{entry.cuentaContable}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Centro de Costo</span>
                            <span className="font-medium text-slate-700">{entry.centroCosto || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Referencia</span>
                            <span className="font-medium text-slate-700">{entry.documentoRef || 'S/N'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Evidencia Section */}
            {entry.evidenciaUrls && entry.evidenciaUrls.length > 0 && (
                <div className="mt-8 page-break-inside-avoid">
                    <h3 className="text-xs font-black text-slate-900 uppercase border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                        <span>Evidencia Digital Adjunta</span>
                        <span className="bg-slate-100 text-slate-500 px-1.5 rounded text-[10px]">{entry.evidenciaUrls.length}</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {entry.evidenciaUrls.map((url: string, idx: number) => {
                            const isImg = ["jpg", "jpeg", "png", "webp"].includes(url.split('.').pop()?.toLowerCase() || "");
                            if (isImg) {
                                return (
                                    <div key={idx} className="border border-slate-200 rounded-lg p-2 bg-slate-50 break-inside-avoid">
                                        <div className="relative aspect-[4/3] w-full bg-white rounded border border-slate-100 overflow-hidden">
                                            {/* Standard HTML img for reliable printing */}
                                            <img
                                                src={url}
                                                alt={`Evidencia ${idx + 1}`}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <p className="text-[9px] text-center text-slate-400 mt-1 truncate">{url.split('/').pop()}</p>
                                    </div>
                                )
                            }
                            return (
                                <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex items-center gap-3">
                                    <div className="h-10 w-10 bg-white border border-slate-200 rounded flex items-center justify-center">
                                        <span className="font-bold text-xs text-slate-400">PDF</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-700 truncate">{url.split('/').pop()}</p>
                                        <p className="text-[10px] text-slate-400">Documento Adjunto (Ver en digital)</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Signatures */}
            <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-3 gap-8 text-center text-xs page-break-inside-avoid">
                <div className="pt-8 border-t border-slate-400 mx-4">
                    <p className="font-bold text-slate-900 mb-1 uppercase">{entry.creadoPor ? `${entry.creadoPor.nombre} ${entry.creadoPor.apellido}` : 'PENDIENTE DE FIRMA'}</p>
                    <p className="text-slate-500">Contador / Elaborado Por</p>
                </div>
                <div className="pt-8 border-t border-slate-400 mx-4">
                    <p className="font-bold text-slate-900 mb-1 uppercase">Carlos Alemán</p>
                    <p className="text-slate-500">Coordinador de Gobierno / Revisado</p>
                </div>
                <div className="pt-8 border-t border-slate-400 mx-4">
                    <p className="font-bold text-slate-900 mb-1 uppercase">Youngren Kingsman</p>
                    <p className="text-slate-500">Dirección Financiera / Autorizado</p>
                </div>
            </div>

            {/* Footer Timestamp */}
            <div className="mt-12 text-[9px] text-slate-400 text-center font-mono uppercase">
                Documento generado por SISTEMA GOBIERNO
            </div>
        </div>
    )
}

function DateDisplay({ date }: { date: string | Date }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <p className="text-sm font-bold text-slate-700">...</p>
    }

    return <p className="text-sm font-bold text-slate-700">{new Date(date).toLocaleDateString()}</p>
}
