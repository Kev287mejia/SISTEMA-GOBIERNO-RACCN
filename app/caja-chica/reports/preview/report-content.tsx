"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Printer, Edit, Check } from "lucide-react"

interface ReportContentProps {
    startDate: string
    endDate: string
    box: any
    movements: any[]
    totalIngresos: number
    totalEgresos: number
}

export function ReportContent({ startDate, endDate, box, movements, totalIngresos, totalEgresos }: ReportContentProps) {
    // State for interactive fields
    const [physicalCount, setPhysicalCount] = useState<string>("")
    const [observations, setObservations] = useState<string>("")
    const [isEditing, setIsEditing] = useState(true)
    const [reportNumber, setReportNumber] = useState("------")

    // Local state for movements to allow editing descriptions/refs
    const [localMovements, setLocalMovements] = useState(movements)

    const updateMovement = (id: string, field: 'descripcion' | 'referencia', value: string) => {
        setLocalMovements(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m))
    }

    useEffect(() => {
        // Generate random report number only on client to avoid hydration mismatch
        setReportNumber(Math.floor(Math.random() * 10000).toString().padStart(6, '0'))
    }, [])

    // Calculate diff
    const systemBalance = box ? Number(box.montoActual) : 0
    const counted = parseFloat(physicalCount) || 0
    const difference = physicalCount ? (counted - systemBalance) : 0

    // Print handler
    const handlePrint = () => {
        setIsEditing(false)
        setTimeout(() => {
            window.print()
        }, 300)
    }

    return (
        <div className="min-h-screen bg-white p-8 print:p-0 print:text-black">
            {/* Control Bar (Hidden on Print) */}
            <div className="mb-8 p-4 bg-slate-100 rounded-lg flex justify-between items-center print:hidden border border-slate-200">
                <div className="flex items-center gap-4">
                    <p className="text-sm font-medium text-slate-600">
                        <span className="font-bold text-indigo-600">Modo Interactivo:</span> Llene los datos del arqueo antes de imprimir.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        className="gap-2"
                    >
                        {isEditing ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                        {isEditing ? "Vista Final" : "Editar Datos"}
                    </Button>
                    <Button
                        onClick={handlePrint}
                        className="bg-indigo-600 hover:bg-indigo-700 gap-2 text-white"
                        size="sm"
                    >
                        <Printer className="h-4 w-4" />
                        Imprimir / Guardar PDF
                    </Button>
                </div>
            </div>

            {/* Header */}
            <div className="mb-8 border-b-2 border-slate-900 pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Gobierno Regional Autónomo</h1>
                        <h2 className="text-xl font-bold text-slate-700 uppercase">Costa Caribe Norte</h2>
                        <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wide">Dirección Administrativa Financiera - Tesorería</p>
                    </div>
                    <div className="text-right">
                        <div className="inline-block px-4 py-2 border-2 border-slate-900 rounded-lg">
                            <p className="text-xs font-black uppercase text-slate-500 mb-1">Reporte N°</p>
                            <p className="text-xl font-mono font-bold text-slate-900">{reportNumber}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 text-center bg-slate-50 py-3 rounded-lg border border-slate-200 print:border-none print:bg-transparent print:py-0">
                    <h3 className="text-xl font-black uppercase text-slate-800 tracking-wide">Reporte de Liquidación y Arqueo de Caja Chica</h3>
                    {box && <p className="text-base font-bold text-slate-600 uppercase mt-1">Caja: <span className="text-slate-900">{box.nombre}</span></p>}
                    <p className="text-sm text-slate-500 mt-1 uppercase">
                        Periodo: <span className="font-bold">{format(new Date(startDate), "dd 'de' MMMM yyyy", { locale: es })}</span> al <span className="font-bold">{format(new Date(endDate), "dd 'de' MMMM yyyy", { locale: es })}</span>
                    </p>
                </div>
            </div>

            {/* Info Cards (Grid) */}
            <div className="grid grid-cols-3 gap-6 mb-8 text-sm">
                <div className="p-3 border rounded border-slate-300 bg-slate-50 print:bg-transparent print:border-slate-800">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1 print:text-slate-600">Responsable de Custodia</span>
                    <span className="font-bold text-slate-900 uppercase text-sm">
                        {box ? `${box.usuario.nombre} ${box.usuario.apellido}` : 'Varios Responsables'}
                    </span>
                </div>
                <div className="p-3 border rounded border-slate-300 bg-slate-50 print:bg-transparent print:border-slate-800">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1 print:text-slate-600">Estado Actual</span>
                    <span className="font-bold text-slate-900 uppercase text-sm">{box ? box.estado : '-'}</span>
                </div>
                <div className="p-3 border rounded border-slate-300 bg-slate-50 print:bg-transparent print:border-slate-800">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1 print:text-slate-600">Fecha de Emisión</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{format(new Date(), "dd/MM/yyyy HH:mm")}</span>
                </div>
            </div>

            {/* Table */}
            <div className="mb-8">
                <h4 className="text-sm font-black uppercase mb-2 text-slate-800 border-b border-slate-900 w-full">Detalle de Movimientos</h4>
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-900">
                            <th className="py-2 pr-4 font-black uppercase text-xs">Fecha</th>
                            <th className="py-2 pr-4 font-black uppercase text-xs">Tipo</th>
                            <th className="py-2 pr-4 font-black uppercase text-xs w-1/3">Descripción / Referencia</th>
                            <th className="py-2 pr-4 font-black uppercase text-xs text-right">Ingresos</th>
                            <th className="py-2 font-black uppercase text-xs text-right">Egresos</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {localMovements.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-slate-400 italic">No hay movimientos registrados en este periodo</td>
                            </tr>
                        ) : (
                            localMovements.map((mov) => (
                                <tr key={mov.id} className="print:break-inside-avoid">
                                    <td className="py-2 pr-4 whitespace-nowrap text-slate-700 font-mono text-[11px]">
                                        {format(new Date(mov.fecha), "dd/MM/yyyy")}
                                    </td>
                                    <td className="py-2 pr-4">
                                        <span className={`inline-block px-2 text-[10px] font-bold uppercase border rounded ${mov.tipo === 'INGRESO' ? 'border-emerald-200 text-emerald-800 print:text-black print:border-black' :
                                                mov.tipo === 'EGRESO' ? 'border-amber-200 text-amber-800 print:text-black print:border-black' :
                                                    'border-blue-200 text-blue-800 print:text-black print:border-black'
                                            }`}>
                                            {mov.tipo.substring(0, 3)}
                                        </span>
                                    </td>
                                    <td className="py-2 pr-4 text-slate-900 text-xs">
                                        {isEditing ? (
                                            <div className="space-y-1">
                                                <Input
                                                    value={mov.descripcion}
                                                    onChange={(e) => updateMovement(mov.id, 'descripcion', e.target.value)}
                                                    className="h-7 text-xs"
                                                    placeholder="Descripción"
                                                />
                                                <Input
                                                    value={mov.referencia || ''}
                                                    onChange={(e) => updateMovement(mov.id, 'referencia', e.target.value)}
                                                    className="h-6 text-[10px] font-mono text-slate-500"
                                                    placeholder="Referencia / Factura"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <span className="uppercase font-medium">{mov.descripcion}</span>
                                                {mov.referencia && <div className="text-[10px] text-slate-500 font-mono mt-0.5 print:text-slate-600">Ref: {mov.referencia}</div>}
                                            </>
                                        )}
                                    </td>
                                    <td className="py-2 pr-4 text-right font-mono text-emerald-800 text-xs font-bold print:text-black">
                                        {mov.tipo === 'INGRESO' || mov.tipo === 'AJUSTE' ? Number(mov.monto).toLocaleString('es-NI', { minimumFractionDigits: 2 }) : ''}
                                    </td>
                                    <td className="py-2 text-right font-mono text-indigo-900 text-xs font-bold print:text-black">
                                        {mov.tipo === 'EGRESO' ? Number(mov.monto).toLocaleString('es-NI', { minimumFractionDigits: 2 }) : ''}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-900 font-bold bg-slate-50 print:bg-transparent">
                        <tr>
                            <td colSpan={3} className="py-2 pr-4 text-right uppercase text-[10px] tracking-wider">Subtotales</td>
                            <td className="py-2 pr-4 text-right text-emerald-800 print:text-black">C$ {totalIngresos.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                            <td className="py-2 text-right text-indigo-900 print:text-black">C$ {totalEgresos.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr className="border-t border-slate-300">
                            <td colSpan={3} className="py-3 pr-4 text-right uppercase text-xs tracking-wider font-black">Saldo Neto del Periodo</td>
                            <td colSpan={2} className="py-3 text-right font-black text-sm bg-slate-100 print:bg-transparent px-2 border-b border-slate-400">
                                C$ {(totalIngresos - totalEgresos).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Interactive Arqueo Section */}
            <div className="mb-8 border-2 border-slate-800 p-6 rounded-lg print:border-2 print:border-black print:break-inside-avoid">
                <h4 className="text-sm font-black uppercase mb-4 border-b border-slate-400 pb-2 flex justify-between items-center">
                    <span>Acta de Arqueo (Control Físico)</span>
                    <span className="text-[10px] font-normal text-slate-500 print:hidden">Llene los campos marcados</span>
                </h4>

                <div className="flex gap-8">
                    {/* Column 1: System */}
                    <div className="flex-1 space-y-4">
                        <div className="bg-slate-50 p-4 rounded border border-slate-200 print:bg-transparent print:border-none print:p-0">
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Saldo en Libros</p>
                            <p className="text-lg font-mono font-bold text-slate-900">
                                C$ {systemBalance.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    {/* Column 2: Physical (Interactive) */}
                    <div className="flex-1 space-y-4">
                        <div className="bg-amber-50 p-4 rounded border border-amber-200 print:bg-transparent print:border-none print:p-0">
                            <p className="text-[10px] font-bold text-amber-700 uppercase print:text-slate-600">
                                Efectivo Contado (Físico)
                            </p>
                            {isEditing ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-lg font-bold text-slate-500">C$</span>
                                    <Input
                                        type="number"
                                        value={physicalCount}
                                        onChange={(e) => setPhysicalCount(e.target.value)}
                                        className="font-mono font-bold text-lg h-9 bg-white border-amber-300 focus:ring-amber-500"
                                        placeholder="0.00"
                                    />
                                </div>
                            ) : (
                                <p className="text-lg font-mono font-bold text-slate-900 border-b border-black inline-block min-w-[100px]">
                                    C$ {Number(counted).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Column 3: Diff */}
                    <div className="flex-1 space-y-4">
                        <div className={`p-4 rounded border ${difference === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                            } print:bg-transparent print:border-none print:p-0`}>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Diferencia (+/-)</p>
                            <p className={`text-lg font-mono font-bold ${difference === 0 ? 'text-emerald-700 print:text-black' : 'text-red-600 print:text-black'
                                }`}>
                                {difference > 0 ? '+' : ''}{Number(difference).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Observaciones / Comentarios del Auditor</p>
                    {isEditing ? (
                        <Textarea
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                            placeholder="Ingrese observaciones sobre billetes deteriorados, faltantes justificados, etc."
                            className="bg-white"
                        />
                    ) : (
                        <div className="border border-slate-200 rounded p-3 min-h-[60px] text-sm print:border-none print:p-0 print:border-b print:border-slate-400 print:min-h-[40px] print:rounded-none">
                            {observations || "Ninguna."}
                        </div>
                    )}
                </div>
            </div>

            {/* Signatures */}
            <div className="mt-20 grid grid-cols-3 gap-12 print:break-inside-avoid">
                <div className="text-center group">
                    <div className="border-t-2 border-slate-900 mx-4 pt-2 group-print:border-black"></div>
                    <p className="font-bold text-[11px] uppercase text-slate-900">Responsable Caja Chica</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">{box ? `${box.usuario.nombre} ${box.usuario.apellido}` : ''}</p>
                </div>
                <div className="text-center">
                    <div className="border-t-2 border-slate-900 mx-4 pt-2"></div>
                    <p className="font-bold text-[11px] uppercase text-slate-900">Resp. Contabilidad / Auditor</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">Lic. Julio López</p>
                </div>
                <div className="text-center">
                    <div className="border-t-2 border-slate-900 mx-4 pt-2"></div>
                    <p className="font-bold text-[11px] uppercase text-slate-900">Autorizado DAF</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">Lic. Youngren Kinsham</p>
                </div>
            </div>
        </div>
    )
}
