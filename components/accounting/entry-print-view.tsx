"use client"

import { useEffect, useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { ClientOnly } from "@/components/providers/client-only"
import { Button } from "@/components/ui/button"
import { FileDown, Printer } from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { toast } from "sonner"

export function EntryPrintView({ entry, printerUser }: { entry: any, printerUser?: any }) {
    const [isExporting, setIsExporting] = useState(false)
    const [genTime, setGenTime] = useState<string>("")
    const [logoUrl, setLogoUrl] = useState<string>("/logo.png")

    useEffect(() => {
        // Set generation time on client
        setGenTime(new Date().toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))

        // Fetch official logo from settings
        fetch("/api/settings")
            .then(res => res.json())
            .then(data => {
                const setting = data.find((s: any) => s.key === 'viz_logo_url')
                if (setting?.value) setLogoUrl(setting.value)
            })
            .catch(err => console.error("Error fetching report logo:", err))

        toast.info("Vista de impresión lista", {
            description: "Puedes imprimir o descargar el PDF oficial desde la barra superior."
        })
    }, [])

    const downloadPDF = async () => {
        const element = document.getElementById('report-content')
        if (!element) {
            toast.error("Error crítico: No se encontró el contenido del reporte")
            return
        }

        setIsExporting(true)
        const toastId = toast.loading("Generando PDF Oficial...", {
            description: "Estamos procesando el documento de alta resolución."
        })

        try {
            console.log("Iniciando captura de canvas...")
            const canvas = await html2canvas(element, {
                scale: 2,
                logging: true, // Habilitamos logging para ver fallos en consola
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff"
            })

            console.log("Canvas capturado con éxito.")
            const imgData = canvas.toDataURL('image/png')

            // Usamos una aproximación más compatible para jsPDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const imgWidth = 210
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
            pdf.save(`Comprobante_${entry.numero}.pdf`)

            toast.success("PDF generado correctamente", {
                id: toastId,
                description: "El archivo ha sido descargado."
            })
        } catch (error: any) {
            console.error("PDF Export Error:", error)
            toast.error("Error al generar PDF", {
                id: toastId,
                description: error.message || "Ocurrió un error inesperado al procesar el archivo."
            })
        } finally {
            setIsExporting(false)
        }
    }

    // Split account into parts (up to 4 levels)
    const accountParts = (entry.cuentaContable || "").split(/[-.]/)
    const cta = accountParts[0] || ""
    const subCta = accountParts[1] || ""
    const subSubCta = accountParts[2] || ""
    const subSubSubCta = accountParts[3] || ""

    const isIngreso = entry.tipo === 'INGRESO'
    const debe = isIngreso ? Number(entry.monto) : 0
    const haber = isIngreso ? 0 : Number(entry.monto)

    // Format date in Spanish (FECHA 31 DE DICIEMBRE 2025 style)
    const formatDateSpanish = (date: string | Date) => {
        const d = new Date(date)
        const day = d.getDate()
        const months = [
            "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
            "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
        ]
        const month = months[d.getMonth()]
        const year = d.getFullYear()
        return `FECHA ${day} DE ${month} ${year}`
    }

    return (
        <ClientOnly>
            {/* Control Bar (Hidden on print) */}
            <div className="fixed top-4 right-4 flex gap-2 print:hidden z-50">
                <Button
                    variant="outline"
                    className="bg-white/80 backdrop-blur shadow-xl border-slate-200 rounded-xl"
                    onClick={() => window.print()}
                >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                </Button>
                <Button
                    className="bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 rounded-xl"
                    onClick={downloadPDF}
                    disabled={isExporting}
                >
                    <FileDown className="w-4 h-4 mr-2" />
                    {isExporting ? 'Procesando...' : 'Descargar PDF (Oficial)'}
                </Button>
            </div>

            <div id="report-content" className="bg-white p-4 max-w-[21.59cm] mx-auto min-h-screen text-black font-serif">
                {/* Header Area (Reserved for Logos) */}
                <div className="flex justify-between items-start mb-2 px-4 h-24">
                    <div className="w-24 h-full flex items-center justify-center">
                        <img src={logoUrl} alt="Escudo Nacional" className="max-h-20 object-contain" />
                    </div>
                    <div className="flex-1 text-center py-2">
                        {/* Space for watermarks or centered seals if needed */}
                    </div>
                    <div className="w-24 h-full flex items-center justify-center">
                        <img src="/escudo_raccn.png" alt="Escudo Regional" className="max-h-20 object-contain opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                </div>

                {/* Title Section */}
                <div className="text-center mb-6">
                    <h1 className="text-lg font-bold uppercase tracking-tight">Gobierno Regional Autónomo Costa Caribe Norte</h1>
                    <h2 className="text-lg font-bold uppercase tracking-tight">(G.R.A.C.C.N)</h2>
                    <h3 className="text-xl font-bold uppercase tracking-widest mt-1">Comprobante de Diario</h3>
                </div>

                {/* Date Segment */}
                <div className="mb-2 pl-2">
                    <p className="text-xs font-bold uppercase">{formatDateSpanish(entry.fecha)}</p>
                </div>

                {/* The Main Table Container */}
                <div className="relative border-2 border-black">
                    {/* Diagonal Line - Moved out of table for valid HTML */}
                    <div className="absolute top-[40px] left-[40%] w-[50%] h-[360px] pointer-events-none overflow-hidden z-10">
                        <svg className="w-full h-full">
                            <line x1="0" y1="0" x2="100%" y2="100%" stroke="black" strokeWidth="1" />
                        </svg>
                    </div>

                    <table className="w-full border-collapse text-[11px] relative z-0">
                        <thead>
                            <tr className="border-b-2 border-black bg-gray-50/50">
                                <th className="border-r border-black p-1 w-[8%]">CTA</th>
                                <th className="border-r border-black p-1 w-[8%]">SUB-CTA</th>
                                <th className="border-r border-black p-1 w-[10%] text-[9px] leading-tight">SUB<br />SUB-CTA</th>
                                <th className="border-r border-black p-1 w-[12%] text-[9px] leading-tight">SUB-SUB<br />SUB/CTA</th>
                                <th className="border-r border-black p-1">DESCRIPCION</th>
                                <th className="border-r border-black p-1 w-[15%]">DEBE</th>
                                <th className="p-1 w-[15%]">HABER</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Data Row */}
                            <tr className="border-b border-black align-top h-8">
                                <td className="border-r border-black px-1 py-2 text-center font-mono">{cta}</td>
                                <td className="border-r border-black px-1 py-2 text-center font-mono">{subCta}</td>
                                <td className="border-r border-black px-1 py-2 text-center font-mono">{subSubCta}</td>
                                <td className="border-r border-black px-1 py-2 text-center font-mono">{subSubSubCta}</td>
                                <td className="border-r border-black px-2 py-2 uppercase font-medium">
                                    {entry.descripcion}
                                </td>
                                <td className="border-r border-black px-2 py-2 text-right">
                                    {debe > 0 ? formatCurrency(debe).replace('C$', '') : ''}
                                </td>
                                <td className="px-2 py-2 text-right">
                                    {haber > 0 ? formatCurrency(haber).replace('C$', '') : ''}
                                </td>
                            </tr>

                            {/* Filler Rows */}
                            {[...Array(15)].map((_, i) => (
                                <tr key={i} className="border-b border-gray-100 h-6 last:border-b-0">
                                    <td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td>
                                    <td className="border-r border-black px-2"></td>
                                    <td className="border-r border-black"></td>
                                    <td className=""></td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-black font-bold h-10">
                                <td colSpan={4} className="border-r border-black"></td>
                                <td className="border-r border-black px-4 text-right align-middle uppercase text-[10px]">
                                    Sumas Iguales C$
                                </td>
                                <td className="border-r border-black px-2 text-right align-middle">
                                    {formatCurrency(entry.monto).replace('C$', '').trim()}
                                </td>
                                <td className="px-2 text-right align-middle">
                                    {formatCurrency(entry.monto).replace('C$', '').trim()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Evidence Documentation Section */}
                {entry.evidenciaUrls && entry.evidenciaUrls.length > 0 && (
                    <div className="mt-8 mb-8 border-2 border-slate-200 rounded-xl p-6 bg-slate-50/30">
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

                {/* Signature Section */}
                <div className="mt-16 grid grid-cols-3 gap-0 text-[10px]">
                    <div className="flex flex-col border-t border-black pt-2 mx-8 text-left">
                        <p className="font-bold mb-6">Elaborado por:</p>
                        <p className="font-bold uppercase">LIC VLADIMIR DIESEN</p>
                        <p className="italic text-gray-600">contador</p>
                    </div>
                    <div className="flex flex-col border-t border-black pt-2 mx-8 text-left">
                        <p className="font-bold mb-6">Revisado por:</p>
                        <p className="font-bold">Lic. Julio López Escobar</p>
                        <p className="italic text-gray-600">Contador General</p>
                    </div>
                    <div className="flex flex-col border-t border-black pt-2 mx-8 text-left">
                        <p className="font-bold mb-6">Autorizado por:</p>
                        <p className="font-bold">Lic. Youngren Kinsman M.</p>
                        <p className="italic text-gray-600">Division Admon Fin.</p>
                    </div>
                </div>

                {/* Footer Details */}
                <div className="mt-12 flex justify-between items-end border-t border-gray-100 pt-4 px-10">
                    <div className="text-[7px] text-gray-400 uppercase tracking-widest text-left">
                        Documento oficial del G.R.A.C.C.N
                    </div>
                    <div className="text-[8px] text-slate-500 font-sans text-right italic">
                        Generado por: {printerUser?.name || "Sistema"} | Fecha: {new Date().toLocaleDateString('es-NI')} | Hora: {genTime}
                    </div>
                </div>
            </div>
        </ClientOnly>
    )
}
