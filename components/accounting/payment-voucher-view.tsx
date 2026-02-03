"use client"

import { useEffect, useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { ClientOnly } from "@/components/providers/client-only"
import { Button } from "@/components/ui/button"
import { FileDown, Printer, ArrowLeft } from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { toast } from "sonner"
import { numberToSpanishWords } from "@/lib/number-to-words"
import { useRouter } from "next/navigation"

export function PaymentVoucherView({ check, printerUser }: { check: any, printerUser?: any }) {
    const router = useRouter()
    const [isExporting, setIsExporting] = useState(false)
    const [logoUrl, setLogoUrl] = useState<string>("/logo.png")

    useEffect(() => {
        fetch("/api/settings")
            .then(res => res.json())
            .then(data => {
                const setting = data.find((s: any) => s.key === 'viz_logo_url')
                if (setting?.value) setLogoUrl(setting.value)
            })
            .catch(err => console.error("Error fetching report logo:", err))
    }, [])

    const downloadPDF = async () => {
        const element = document.getElementById('voucher-content')
        if (!element) return

        setIsExporting(true)
        const toastId = toast.loading("Generando Comprobante de Pago...")

        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" })
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
            const imgWidth = 210
            const imgHeight = (canvas.height * imgWidth) / canvas.width
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
            pdf.save(`Comprobante_Pago_${check.numero}.pdf`)
            toast.success("PDF generado", { id: toastId })
        } catch (error) {
            toast.error("Error al generar PDF", { id: toastId })
        } finally {
            setIsExporting(false)
        }
    }

    const amountWords = numberToSpanishWords(Number(check.monto))
    const entry = check.accountingEntry || {}

    return (
        <ClientOnly>
            <div className="fixed top-4 left-4 right-4 flex justify-between print:hidden z-50">
                <Button variant="outline" onClick={() => router.back()} className="bg-white/80 backdrop-blur shadow-xl border-slate-200 rounded-xl">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.print()} className="bg-white/80 backdrop-blur shadow-xl border-slate-200 rounded-xl">
                        <Printer className="w-4 h-4 mr-2" /> Imprimir
                    </Button>
                    <Button className="bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 rounded-xl" onClick={downloadPDF} disabled={isExporting}>
                        <FileDown className="w-4 h-4 mr-2" /> {isExporting ? 'Procesando...' : 'Descargar PDF'}
                    </Button>
                </div>
            </div>

            <div id="voucher-content" className="bg-white p-12 max-w-[21.59cm] mx-auto min-h-screen text-black font-serif border">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <img src={logoUrl} alt="Logo" className="h-20 object-contain" />
                    <div className="text-center flex-1">
                        <h1 className="text-lg font-bold uppercase">Gobierno Regional Autónomo Costa Caribe Norte</h1>
                        <h2 className="text-md font-bold uppercase">Comprobante de Pago</h2>
                        <p className="text-sm font-bold mt-2">Nº: <span className="text-rose-600 font-black">{check.numero}</span></p>
                    </div>
                    <div className="w-20" />
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-y-4 border-2 border-black p-6 rounded-xl mb-8">
                    <div className="col-span-1">
                        <p className="text-[10px] font-bold uppercase text-slate-500">Beneficiario/Páguese a:</p>
                        <p className="text-md font-black uppercase text-slate-900 border-b border-dotted border-slate-300 pb-1">{check.beneficiario}</p>
                    </div>
                    <div className="col-span-1 text-right">
                        <p className="text-[10px] font-bold uppercase text-slate-500">Monto:</p>
                        <p className="text-xl font-black text-slate-900">{formatCurrency(check.monto)}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-[10px] font-bold uppercase text-slate-500">La suma de:</p>
                        <p className="text-sm font-bold uppercase italic text-slate-800 border-b border-dotted border-slate-300 pb-1">{amountWords}</p>
                    </div>
                    <div className="col-span-1">
                        <p className="text-[10px] font-bold uppercase text-slate-500">Banco / Cuenta:</p>
                        <p className="text-sm font-bold text-slate-800">{check.banco} - {check.cuentaBancaria}</p>
                    </div>
                    <div className="col-span-1 text-right">
                        <p className="text-[10px] font-bold uppercase text-slate-500">Fecha de Emisión:</p>
                        <p className="text-sm font-black text-slate-800">{new Date(check.fecha).toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-[10px] font-bold uppercase text-slate-500">Concepto de Pago:</p>
                        <p className="text-sm font-medium text-slate-800">{entry.descripcion || check.referencia}</p>
                    </div>
                </div>

                {/* Accounting Breakdown */}
                <div className="mb-8">
                    <h3 className="text-[10px] font-black uppercase mb-2 tracking-widest text-slate-400">Detalle Contable Asignado</h3>
                    <table className="w-full border-collapse border border-black text-[11px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-black">
                                <th className="border-r border-black p-2 text-left">Código Cuenta</th>
                                <th className="border-r border-black p-2 text-left">Nombre de la Cuenta / Descripción</th>
                                <th className="border-r border-black p-2 text-right">Debe</th>
                                <th className="p-2 text-right">Haber</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-200">
                                <td className="border-r border-black p-2 font-mono">{entry.cuentaContable}</td>
                                <td className="border-r border-black p-2 uppercase">{entry.descripcion}</td>
                                <td className="border-r border-black p-2 text-right">{entry.tipo === 'INGRESO' ? formatCurrency(entry.monto).replace('C$', '') : ''}</td>
                                <td className="p-2 text-right">{entry.tipo === 'EGRESO' ? formatCurrency(entry.monto).replace('C$', '') : ''}</td>
                            </tr>
                            {[...Array(5)].map((_, i) => (
                                <tr key={i} className="h-6 border-b border-slate-100 last:border-b-0">
                                    <td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td>
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-black font-bold">
                                <td colSpan={2} className="p-2 text-right uppercase">Totales C$</td>
                                <td className="border-r border-black p-2 text-right">{formatCurrency(entry.monto).replace('C$', '')}</td>
                                <td className="p-2 text-right">{formatCurrency(entry.monto).replace('C$', '')}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Evidence Documentation Section */}
                {entry.evidenciaUrls && entry.evidenciaUrls.length > 0 && (
                    <div className="mb-8 border-2 border-slate-200 rounded-xl p-6 bg-slate-50/30">
                        <h3 className="text-[10px] font-black uppercase mb-4 tracking-widest text-slate-600 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            Documentos de Respaldo Adjuntos
                        </h3>
                        <div className="space-y-2">
                            {entry.evidenciaUrls.map((url: string, index: number) => {
                                const filename = url.split('/').pop() || 'documento.pdf'
                                const extension = filename.split('.').pop()?.toUpperCase() || 'PDF'
                                const fileIcon = extension === 'PDF' ? '📄' : '🖼️'

                                return (
                                    <div key={index} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{fileIcon}</span>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-800">{index + 1}. {filename}</p>
                                                <p className="text-[8px] text-slate-500 uppercase">Tipo: {extension}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-bold text-slate-600 uppercase">Documento Verificado</p>
                                            <p className="text-[7px] text-slate-400">Expediente Digital</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <p className="text-[8px] text-slate-500 italic">
                                ✓ Los documentos originales están disponibles en el expediente digital del Sistema GRACCNN
                            </p>
                            <p className="text-[8px] text-slate-500 italic">
                                ✓ Total de documentos adjuntos: <span className="font-bold">{entry.evidenciaUrls.length}</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Signatures Area */}
                <div className="grid grid-cols-2 gap-12 mt-20">
                    <div className="space-y-16">
                        <div className="border-t border-black pt-2 text-center">
                            <p className="text-[10px] font-black uppercase">Elaborado por (Caja/Tesorería)</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 italic">Nombre y Firma</p>
                        </div>
                        <div className="border-t border-black pt-2 text-center">
                            <p className="text-[10px] font-black uppercase">Revisado y Autorizado</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 italic">DAF / Responsable Administrativo</p>
                        </div>
                    </div>
                    <div className="flex flex-col justify-end">
                        <div className="border-2 border-slate-100 p-6 rounded-2xl bg-slate-50/30">
                            <p className="text-[10px] font-black uppercase mb-16 text-slate-400">Recibí Conforme (Beneficiario)</p>
                            <div className="border-t border-black pt-2 text-left">
                                <p className="text-[9px] font-bold uppercase">Nombre:</p>
                                <div className="h-4" />
                                <p className="text-[9px] font-bold uppercase">Cédula:</p>
                                <div className="h-4" />
                                <p className="text-[9px] font-bold uppercase">Fecha de Recibo:</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Footer */}
                <div className="mt-auto pt-20 flex justify-between items-end">
                    <p className="text-[8px] font-bold uppercase text-slate-300">Este es un documento contable oficial del Sistema GRACCCN v3.2 Pro</p>
                    <p className="text-[8px] font-bold uppercase text-slate-300">Impreso por: {printerUser?.name || 'ADMIN'} - {new Date().toLocaleString()}</p>
                </div>
            </div>
        </ClientOnly>
    )
}
