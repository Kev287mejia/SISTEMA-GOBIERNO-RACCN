"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer, Loader2, ArrowLeft, Download } from "lucide-react"
import Link from "next/link"

export default function MasterEmployeeReport() {
    const [employees, setEmployees] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/hr/employees")
            .then(res => res.json())
            .then(data => {
                setEmployees(data)
                setLoading(false)
            })
    }, [])

    return (
        <div className="min-h-screen bg-white p-8 max-w-[1200px] mx-auto text-sm font-sans text-slate-900">
            {/* Header de Navegación (Oculto al imprimir) */}
            <div className="mb-8 flex justify-between items-center print:hidden">
                <Link href="/rrhh/reports">
                    <Button variant="outline" className="gap-2 bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700">
                        <ArrowLeft className="h-4 w-4" /> Volver a Reportes
                    </Button>
                </Link>
                <div className="flex gap-2">
                    <Button onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white gap-2 font-bold shadow-lg shadow-slate-300">
                        <Printer className="h-4 w-4" /> Imprimir / Guardar PDF
                    </Button>
                </div>
            </div>

            {/* Cabecera Oficial del Reporte */}
            <div className="text-center border-b-2 border-slate-900 pb-6 mb-8 print:mb-4">
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-widest leading-none">Gobierno Regional Autónomo</h1>
                <h2 className="text-lg font-bold text-slate-600 uppercase tracking-wide mt-1">Costa Caribe Norte</h2>
                <div className="mt-6 mb-2">
                    <h3 className="text-xl font-black bg-slate-900 text-white py-2 px-8 uppercase inline-block rounded-sm shadow-sm tracking-tight">
                        Listado Maestro de Personal
                    </h3>
                </div>
                <div className="flex justify-between items-end mt-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <p>Departamento de Recursos Humanos</p>
                    <p>Generado: {new Date().toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            </div>

            {loading ? (
                <div className="py-32 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
                    <p className="text-slate-400 font-medium animate-pulse">Generando reporte oficial...</p>
                </div>
            ) : (
                <div className="w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-900 bg-slate-50 print:bg-transparent">
                                <th className="py-3 px-2 font-black uppercase text-[10px] tracking-wider text-slate-900 w-[15%]">Identificación</th>
                                <th className="py-3 px-2 font-black uppercase text-[10px] tracking-wider text-slate-900 w-[25%]">Colaborador</th>
                                <th className="py-3 px-2 font-black uppercase text-[10px] tracking-wider text-slate-900 w-[20%]">Cargo / Área</th>
                                <th className="py-3 px-2 font-black uppercase text-[10px] tracking-wider text-slate-900 text-right w-[15%]">Salario Mensual</th>
                                <th className="py-3 px-2 font-black uppercase text-[10px] tracking-wider text-slate-900 text-center w-[15%]">Contratación</th>
                                <th className="py-3 px-2 font-black uppercase text-[10px] tracking-wider text-slate-900 text-center w-[10%]">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {employees.map((emp, i) => (
                                <tr key={emp.id} className="break-inside-avoid hover:bg-slate-50 transition-colors print:hover:bg-transparent">
                                    <td className="py-3 px-2 align-top">
                                        <div className="font-bold text-slate-800 text-xs">{emp.cedula}</div>
                                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">INSS: {emp.inss || "N/A"}</div>
                                    </td>
                                    <td className="py-3 px-2 align-top font-bold text-slate-700 uppercase text-xs">
                                        {emp.apellido}, {emp.nombre}
                                    </td>
                                    <td className="py-3 px-2 align-top">
                                        <div className="font-bold text-slate-800 text-[11px] uppercase leading-tight">{emp.contratos?.[0]?.cargo?.titulo || "Sin Asignar"}</div>
                                        <div className="text-[10px] text-slate-500 mt-0.5 uppercase">{emp.contratos?.[0]?.cargo?.departamento || "General"}</div>
                                    </td>
                                    <td className="py-3 px-2 align-top text-right font-mono font-bold text-slate-700 text-xs">
                                        C$ {parseFloat(emp.contratos?.[0]?.salarioBase || 0).toLocaleString('en-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-3 px-2 align-top text-center">
                                        <span className="text-[9px] px-2 py-0.5 rounded-full border border-slate-300 font-bold uppercase text-slate-600 print:border-slate-400 print:text-slate-800">
                                            {emp.contratos?.[0]?.tipo || "PENDIENTE"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 align-top text-center">
                                        {emp.estado === 'ACTIVO' ? (
                                            <span className="text-[9px] font-black text-emerald-700 uppercase print:text-slate-900">Activo</span>
                                        ) : (
                                            <span className="text-[9px] font-black text-red-600 uppercase print:text-slate-900">{emp.estado}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-900 bg-slate-50 print:bg-transparent">
                            <tr>
                                <td colSpan={3} className="py-3 px-2 font-black uppercase text-xs text-right text-slate-900">Total Nómina Mensual:</td>
                                <td className="py-3 px-2 font-mono font-black text-xs text-right text-slate-900">
                                    C$ {employees.reduce((acc, emp) => acc + Number(emp.contratos?.[0]?.salarioBase || 0), 0).toLocaleString('en-NI', { minimumFractionDigits: 2 })}
                                </td>
                                <td colSpan={2}></td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="mt-12 border-t pt-4 flex justify-between text-[10px] text-slate-400 uppercase tracking-wider print:mt-8 print:text-slate-600">
                        <div>
                            Total Registros: <span className="font-bold text-slate-900">{employees.length}</span>
                        </div>
                        <div className="text-right">
                            Sistema de Gestión Gubernamental Integrado &bull; Módulo de Recursos Humanos
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 1.5cm;
                        size: letter;
                    }
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    )
}
