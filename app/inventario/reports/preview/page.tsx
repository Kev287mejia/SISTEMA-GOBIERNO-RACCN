"use client"

export const dynamic = "force-dynamic";
import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Printer, Download, FileText, ChevronLeft, Calendar, User, Building2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"

// Tipos para el reporte
type InventoryItem = {
    id: string
    codigo: string
    nombre: string
    descripcion: string
    unidadMedida: string
    categoria: string
    stockActual: number
    stockMinimo: number
    costoUnitario: number
    metodoKardex: string
    updatedAt: string
}

const InventoryReportContent = () => {
    const searchParams = useSearchParams()
    const reportType = searchParams.get("type") || "general-kardex"
    const anio = searchParams.get("anio") || new Date().getFullYear().toString()

    const [items, setItems] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [printing, setPrinting] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [auditRef, setAuditRef] = useState("")

    // Generate audit ref only once on mount
    useEffect(() => {
        setAuditRef(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`)

        const fetchData = async () => {
            try {
                const res = await fetch("/api/inventory/items")
                if (res.ok) {
                    const data = await res.json()
                    setItems(data.data || [])
                }
            } catch (error) {
                console.error("Error loading report data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handlePrint = () => {
        setPrinting(true)
        setTimeout(() => {
            window.print()
            setPrinting(false)
        }, 100)
    }

    const totalValorizado = items.reduce((acc, item) => acc + (item.stockActual * item.costoUnitario), 0)
    const itemsCriticos = items.filter(i => i.stockActual <= i.stockMinimo).length

    const getReportTitle = () => {
        switch (reportType) {
            case "low-stock": return "REPORTE CRÍTICO DE REPOSICIÓN DE INVENTARIO"
            case "valuation": return "INFORME FINANCIERO DE VALUACIÓN DE EXISTENCIAS"
            default: return "KARDEX GENERAL DE EXISTENCIAS FÍSICAS Y VALORADAS"
        }
    }

    // Filter items based on report type for the view
    const displayItems = reportType === 'low-stock'
        ? items.filter(i => i.stockActual <= i.stockMinimo)
        : items

    return (
        <div className="min-h-screen bg-slate-50 p-8 print:p-0 print:bg-white font-sans text-slate-900">

            {/* Accesories Panel (Non-printable) */}
            <div className="max-w-[210mm] mx-auto mb-8 flex justify-between items-center print:hidden">
                <Button variant="ghost" className="gap-2 text-slate-500 hover:text-slate-900" onClick={() => window.close()}>
                    <ChevronLeft className="h-4 w-4" /> Cerrar Vista Previa
                </Button>
                <Button variant="outline" className={`gap-2 ${editMode ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white shadow-sm'}`} onClick={() => setEditMode(!editMode)}>
                    <FileText className="h-4 w-4" /> {editMode ? 'Finalizar Edición' : 'Editar Datos'}
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 bg-white shadow-sm" onClick={handlePrint}>
                        <Download className="h-4 w-4" /> Exportar PDF
                    </Button>
                    <Button className="gap-2 bg-slate-900 text-white shadow-md hover:bg-slate-800" onClick={handlePrint}>
                        <Printer className="h-4 w-4" /> Imprimir Documento
                    </Button>
                </div>
            </div>

            {/* Pages Container (A4 Size approximation) */}
            <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-2xl print:shadow-none print:w-full print:max-w-none p-[15mm] relative">

                {/* ESCUDO DE FONDO (Watermark) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none print:opacity-[0.02]">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Coat_of_arms_of_Nicaragua.svg/1200px-Coat_of_arms_of_Nicaragua.svg.png"
                        className="w-[80%] grayscale"
                        alt="Watermark"
                    />
                </div>

                {/* HEADER OFICIAL */}
                <header className="border-b-4 border-double border-slate-800 pb-6 mb-8 relative z-10">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col items-center w-24">
                            {/* Placeholder Logo 1 */}
                            <div className="h-20 w-20 relative">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Coat_of_arms_of_Nicaragua.svg/100px-Coat_of_arms_of_Nicaragua.svg.png"
                                    alt="Escudo"
                                    className="object-contain"
                                />
                            </div>
                        </div>
                        <div className="flex-1 text-center space-y-1">
                            <h1 className="text-xl font-black uppercase tracking-widest text-slate-900">Gobierno Regional Autónomo</h1>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">Costa Caribe Norte (GRACCN)</h2>
                            <h3 className="text-xs font-semibold uppercase text-slate-500 pt-1">Dirección Administrativa Financiera - División de Bodega</h3>
                            <p className="text-[10px] text-slate-400 italic">"Transparencia y Eficiencia en la Gestión Pública"</p>
                        </div>
                        <div className="flex flex-col items-center w-24">
                            {/* Placeholder Logo 2 */}
                            <div className="h-20 w-20 flex items-center justify-center border-2 border-slate-100 rounded-full bg-slate-50">
                                <span className="text-[8px] font-black text-slate-300 text-center leading-tight">SELLO<br />OFICIAL</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between items-end border-t border-slate-100 pt-4">
                        <div>
                            <h4 className="text-2xl font-black text-slate-900 uppercase leading-none max-w-md">{getReportTitle()}</h4>
                            <p className="text-xs font-medium text-slate-500 mt-2 uppercase flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> Periodo Fiscal: {anio}
                            </p>
                        </div>
                        <div className="text-right space-y-1">
                            <div className="bg-slate-100 px-3 py-1 rounded inline-block">
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Ref. Auditoría</p>
                                <p className="text-sm font-mono font-bold text-slate-900" suppressHydrationWarning>{auditRef}</p>
                            </div>
                            <p className="text-[9px] text-slate-400 uppercase" suppressHydrationWarning>
                                Generado: {new Date().toLocaleString('es-NI')}
                            </p>
                        </div>
                    </div>
                </header>

                {/* SUMMARY STATS ROW */}
                <div className="grid grid-cols-4 gap-4 mb-8 relative z-10 font-mono text-xs border border-slate-800">
                    <div className="p-3 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-700">
                        <span className="opacity-70 uppercase tracking-widest text-[9px]">Total Ítems</span>
                        <span className="text-xl font-bold">{items.length}</span>
                    </div>
                    <div className="p-3 border-r border-slate-200 flex flex-col justify-between">
                        <span className="text-slate-500 uppercase tracking-widest text-[9px]">Valor Total Inventario</span>
                        <span className="text-lg font-bold text-slate-900">{formatCurrency(totalValorizado)}</span>
                    </div>
                    <div className="p-3 border-r border-slate-200 flex flex-col justify-between">
                        <span className="text-slate-500 uppercase tracking-widest text-[9px]">Ítems Críticos</span>
                        <span className={`text-lg font-bold ${itemsCriticos > 0 ? 'text-red-600' : 'text-slate-900'}`}>{itemsCriticos}</span>
                    </div>
                    <div className="p-3 flex flex-col justify-between bg-slate-50">
                        <span className="text-slate-500 uppercase tracking-widest text-[9px]">Responsable Bodega</span>
                        <span className="text-sm font-bold text-slate-900 uppercase">Lic. Tangni Meza V.</span>
                    </div>
                </div>

                {/* MAIN DATA TABLE */}
                <div className="relative z-10 mb-12">
                    <div className="mb-2 flex items-center justify-end gap-2 print:hidden">
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase px-2 py-1 rounded">
                            MODO EDICIÓN ACTIVADO
                        </span>
                        <span className="text-[9px] text-slate-400 italic">
                            * Escriba en los cuadros para modificar antes de imprimir
                        </span>
                    </div>
                    <table className="w-full text-left text-[10px] font-medium border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-900">
                                <th className="py-2 pr-4 uppercase tracking-wider font-black text-slate-800 w-24">Código SKU</th>
                                <th className="py-2 pr-4 uppercase tracking-wider font-black text-slate-800">Descripción del Bien</th>
                                <th className="py-2 pr-4 uppercase tracking-wider font-black text-slate-800 w-20">U/M</th>
                                <th className="py-2 pr-4 uppercase tracking-wider font-black text-slate-800 w-24 text-right">Costo Unit.</th>
                                <th className="py-2 pr-4 uppercase tracking-wider font-black text-slate-800 w-20 text-center">Físico</th>
                                <th className="py-2 pr-4 uppercase tracking-wider font-black text-slate-800 w-28 text-right">Valor Total</th>
                                <th className="py-2 uppercase tracking-wider font-black text-slate-800 w-20 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400 italic">Procesando datos del sistema...</td>
                                </tr>
                            ) : displayItems.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400 italic">No hay registros para mostrar en este reporte.</td>
                                </tr>
                            ) : (
                                displayItems.map((item, index) => {
                                    const isCritico = item.stockActual <= item.stockMinimo
                                    return (
                                        <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50 print:bg-transparent"}>
                                            <td className="py-1 pr-4">
                                                {editMode ? (
                                                    <input
                                                        defaultValue={item.codigo}
                                                        className="w-full bg-white border border-blue-200 p-1 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 rounded outline-none shadow-sm"
                                                    />
                                                ) : (
                                                    <span className="font-bold text-slate-900">{item.codigo}</span>
                                                )}
                                            </td>
                                            <td className="py-1 pr-4">
                                                {editMode ? (
                                                    <input
                                                        defaultValue={item.nombre}
                                                        className="w-full bg-white border border-blue-200 p-1 text-slate-700 uppercase focus:ring-2 focus:ring-blue-500 rounded outline-none shadow-sm"
                                                    />
                                                ) : (
                                                    <span className="text-slate-700 uppercase">{item.nombre}</span>
                                                )}
                                            </td>
                                            <td className="py-1 pr-4">
                                                {editMode ? (
                                                    <input
                                                        defaultValue={item.unidadMedida}
                                                        className="w-full bg-white border border-blue-200 p-1 text-slate-500 focus:ring-2 focus:ring-blue-500 rounded outline-none shadow-sm"
                                                    />
                                                ) : (
                                                    <span className="text-slate-500">{item.unidadMedida}</span>
                                                )}
                                            </td>
                                            <td className="py-1 pr-4 text-right">
                                                {editMode ? (
                                                    <input
                                                        defaultValue={formatCurrency(item.costoUnitario)}
                                                        className="w-full bg-white border border-blue-200 p-1 text-right text-slate-700 focus:ring-2 focus:ring-blue-500 rounded outline-none shadow-sm"
                                                    />
                                                ) : (
                                                    <span className="text-slate-700">{formatCurrency(item.costoUnitario)}</span>
                                                )}
                                            </td>
                                            <td className="py-1 pr-4 text-center">
                                                {editMode ? (
                                                    <input
                                                        defaultValue={item.stockActual}
                                                        className="w-full bg-white border border-blue-200 p-1 text-center font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 rounded outline-none shadow-sm"
                                                    />
                                                ) : (
                                                    <span className="font-bold text-slate-900">{item.stockActual}</span>
                                                )}
                                            </td>
                                            <td className="py-1 pr-4 text-right">
                                                {editMode ? (
                                                    <input
                                                        defaultValue={formatCurrency(item.stockActual * item.costoUnitario)}
                                                        className="w-full bg-white border border-blue-200 p-1 text-right font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 rounded outline-none shadow-sm"
                                                    />
                                                ) : (
                                                    <span className="font-bold text-slate-900">{formatCurrency(item.stockActual * item.costoUnitario)}</span>
                                                )}
                                            </td>
                                            <td className="py-1 text-center font-bold">
                                                {editMode ? (
                                                    <input
                                                        defaultValue={isCritico ? "REPONER" : "BUENO"}
                                                        className="w-full bg-white border border-blue-200 p-1 text-center font-bold text-[8px] uppercase focus:ring-2 focus:ring-blue-500 rounded outline-none shadow-sm"
                                                    />
                                                ) : (
                                                    isCritico && (
                                                        <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[8px] uppercase print:border print:border-red-900 print:bg-transparent print:text-red-900">
                                                            Reponer
                                                        </span>
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FIRMAS SECTION */}
                <div className="mt-auto relative z-10 pt-12 break-inside-avoid">
                    <div className="grid grid-cols-3 gap-12 text-center">
                        <div className="flex flex-col items-center">
                            <div className="h-20 w-full border-b border-slate-800 mb-2"></div>
                            <p className="text-[10px] font-black uppercase text-slate-900">Lic. Julio Lopez Escobar</p>
                            <p className="text-[9px] uppercase text-slate-500">Responsable de Contabilidad</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="h-20 w-full border-b border-slate-800 mb-2"></div>
                            <p className="text-[10px] font-black uppercase text-slate-900">Lic. Youngren Kinsham</p>
                            <p className="text-[9px] uppercase text-slate-500">Directora Adm. Financiera</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="h-20 w-full border-b border-slate-800 mb-2"></div>
                            <p className="text-[10px] font-black uppercase text-slate-900">Lic. Tangni Massiel Meza Valdivia</p>
                            <p className="text-[9px] uppercase text-slate-500">Responsable de Bodega</p>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-slate-200 pt-2 flex justify-between items-center">
                        <p className="text-[8px] text-slate-400 uppercase">
                            Sistema Integrado de Gestión de Gobierno - GRACCNN 2026
                        </p>
                        <p className="text-[8px] text-slate-400 uppercase">
                            Página 1 de 1
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export default function InventoryReportPreview() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
                    <p className="text-sm font-medium text-slate-500 uppercase">Cargando Módulo de Reportes...</p>
                </div>
            </div>
        }>
            <InventoryReportContent />
        </Suspense>
    )
}
