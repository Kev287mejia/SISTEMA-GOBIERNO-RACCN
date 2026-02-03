"use client"

import { useEffect, useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { ClientOnly } from "@/components/providers/client-only"
import { Button } from "@/components/ui/button"
import { FileDown, Printer } from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { toast } from "sonner"

export function ReconciliationPrintView({ reconciliation, printerUser }: { reconciliation: any, printerUser?: any }) {
    const [isExporting, setIsExporting] = useState(false)
    const [genTime, setGenTime] = useState<string>("")

    useEffect(() => {
        setGenTime(new Date().toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
        toast.info("Reporte de Conciliación listo", {
            description: "Usa los controles superiores para imprimir o exportar."
        })
    }, [])

    const downloadPDF = async () => {
        const element = document.getElementById('report-content')
        if (!element) {
            toast.error("Error: No se encontró el contenido del reporte")
            return
        }

        setIsExporting(true)
        const toastId = toast.loading("Generando Acta de Conciliación...", {
            description: "Procesando el documento oficial."
        })

        try {
            console.log("Iniciando captura de Conciliación...")
            const canvas = await html2canvas(element, {
                scale: 2,
                logging: true,
                useCORS: true,
                backgroundColor: "#ffffff"
            })

            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const imgWidth = 210
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
            pdf.save(`Conciliacion_${reconciliation.id.substring(0, 8)}.pdf`)

            toast.success("Acta generada correctamente", {
                id: toastId
            })
        } catch (error: any) {
            console.error("PDF Export Error:", error)
            toast.error("Error al generar Acta", {
                id: toastId,
                description: error.message
            })
        } finally {
            setIsExporting(false)
        }
    }

    const bankAccount = reconciliation.bankAccount || {}
    const detalles = reconciliation.detalles || {}
    const matches = detalles.matches || []
    const unmatchedInternal = detalles.unmatchedInternal || []

    const months = [
        "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
        "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    ]
    const monthBrief = months[reconciliation.periodoMes - 1]?.substring(0, 3) || ""
    const yearBrief = String(reconciliation.periodoAnio || "").substring(2)
    const periodoDisplay = `${monthBrief}-${yearBrief}`

    const depositsLibros = matches.filter((m: any) => m.internal.amount > 0).reduce((acc: number, m: any) => acc + Number(m.internal.amount), 0)
    const chequesLibros = Math.abs(matches.filter((m: any) => m.internal.amount < 0).reduce((acc: number, m: any) => acc + Number(m.internal.amount), 0))

    const saldoInicial = Number(bankAccount.openingBalance) || 0
    const saldoCierreLibros = saldoInicial + depositsLibros - chequesLibros

    return (
        <ClientOnly>
            {/* Control Bar */}
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

            <div id="report-content" className="bg-white p-8 max-w-[21.59cm] mx-auto min-h-screen text-black font-serif text-[11px] leading-tight">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-4 border-b-2 border-black pb-2">
                    <div className="w-1/4">
                        <p className="font-bold">DEPARTAMENTO DE CONTABILIDAD</p>
                    </div>
                    <div className="w-1/2 text-center">
                        <h1 className="text-sm font-bold uppercase">Gobierno Regional Autónomo Costa Caribe Norte</h1>
                        <p className="text-[9px] italic">"Gobierno de Reconciliación y Unidad Nacional"</p>
                    </div>
                    <div className="w-1/4 text-right">
                    </div>
                </div>

                {/* Title Table */}
                <div className="border border-black mb-4">
                    <div className="grid grid-cols-4 border-b border-black">
                        <div className="col-span-1 p-2 border-r border-black font-bold uppercase">
                            CTA-CTE <br /> GRACCN
                        </div>
                        <div className="col-span-2 p-2 border-r border-black text-center">
                            <h2 className="text-lg font-black tracking-widest leading-none">CONCILIACION</h2>
                            <h2 className="text-lg font-black tracking-widest leading-none">BANCARIA</h2>
                        </div>
                        <div className="col-span-1 p-2 font-bold uppercase text-center bg-gray-50/50">
                            MES DE: <br /> <span className="text-sm">{periodoDisplay}</span>
                        </div>
                    </div>
                    <div className="p-2 border-b border-black italic">
                        Asignacion Presupuestaria.
                    </div>
                    <div className="grid grid-cols-3 p-2">
                        <div className="font-bold">BANCO: {bankAccount.bankName || "BANPRO"}</div>
                        <div className="font-bold">SUCURSAL: {bankAccount.region || "PUERTO CABEZAS"}</div>
                        <div className="font-bold text-right">CTA-CTE No. {bankAccount.accountNumber}</div>
                    </div>
                </div>

                {/* Main Comparison Table */}
                <div className="border border-black mb-6">
                    <div className="grid grid-cols-2 bg-gray-50/50 border-b border-black font-bold text-center uppercase py-1 tracking-tighter">
                        <div className="border-r border-black">MOVIMIENTO MENSUAL SEGÚN N/LIBROS</div>
                        <div>MOVIMIENTO MENSUAL SEGÚN BANCO</div>
                    </div>
                    <div className="grid grid-cols-2">
                        {/* Left Column: Libros */}
                        <div className="border-r border-black">
                            <div className="flex justify-between p-2 border-b border-gray-100">
                                <span>Saldo al inicio del periodo</span>
                                <span className="font-mono">C$ {formatCurrency(saldoInicial).replace('C$', '').trim()}</span>
                            </div>
                            <div className="flex justify-between p-2 border-b border-gray-100">
                                <span>Depositos realizados</span>
                                <span className="font-mono">C$ {formatCurrency(depositsLibros).replace('C$', '').trim()}</span>
                            </div>
                            <div className="flex justify-between p-2 h-12">
                                <span>Cheques girados</span>
                                <span className="font-mono">C$ {formatCurrency(chequesLibros).replace('C$', '').trim()}</span>
                            </div>
                            <div className="flex justify-between p-2 border-t border-black font-bold bg-gray-50/20">
                                <span>Saldo según libros al cierre</span>
                                <span className="font-mono">C$ {formatCurrency(saldoCierreLibros).replace('C$', '').trim()}</span>
                            </div>
                        </div>
                        {/* Right Column: Banco */}
                        <div>
                            <div className="flex justify-between p-2 border-b border-gray-100">
                                <span>Saldo al inicio del periodo</span>
                                <span className="font-mono">C$ {formatCurrency(saldoInicial).replace('C$', '').trim()}</span>
                            </div>
                            <div className="flex justify-between p-2 border-b border-gray-100">
                                <span>Depositos realizados</span>
                                <span className="font-mono">C$ {formatCurrency(depositsLibros).replace('C$', '').trim()}</span>
                            </div>
                            <div className="flex justify-between p-2 h-12">
                                <span>Retiros efectuados/cheques pagados</span>
                                <span className="font-mono">C$ {formatCurrency(chequesLibros).replace('C$', '').trim()}</span>
                            </div>
                            <div className="flex justify-between p-2 border-t border-black font-bold bg-gray-50/20">
                                <span>Saldo según estado de cuentas Banco</span>
                                <span className="font-mono">C$ {formatCurrency(saldoCierreLibros).replace('C$', '').trim()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Adjustments Section */}
                <div className="border-2 border-black mb-6">
                    <div className="bg-gray-100 border-b border-black p-1 font-bold uppercase text-[10px]">
                        SALDO SEGÚN ESTADO DE CUENTA DEL BANCO
                    </div>
                    <div className="divide-y divide-black/80">
                        <div className="flex justify-between p-2 font-bold italic">
                            <span>CHEQUES FLOTANTES</span>
                            <span>C$ {formatCurrency(unmatchedInternal.filter((i: any) => i.amount < 0).reduce((acc: number, i: any) => acc + Math.abs(Number(i.amount)), 0)).replace('C$', '')}</span>
                        </div>
                        <div className="px-2 py-3 text-[9px]">
                            <p className="font-bold underline mb-2 uppercase">TRANSFERENCIAS/NOTAS DE DÉBITO PENDIENTES</p>
                            <div className="h-6 flex justify-between">
                                <span className="italic">Total:</span>
                                <span className="font-mono">C$ 0.00</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Table (Checks Detail) */}
                <div className="mt-8">
                    <h3 className="font-bold uppercase mb-2">DETALLE DE CHEQUES FLOTANTES</h3>
                    <div className="relative">
                        <div className="absolute top-[26px] left-[50%] w-[45%] h-[150px] pointer-events-none overflow-hidden print:block z-20">
                            <svg className="w-full h-full">
                                <line x1="0" y1="0" x2="100%" y2="100%" stroke="black" strokeWidth="0.5" />
                            </svg>
                        </div>

                        <table className="w-full border-collapse border border-black mb-4 relative z-10">
                            <thead>
                                <tr className="bg-gray-50 border-b border-black">
                                    <th className="border-r border-black p-1 uppercase">Fecha</th>
                                    <th className="border-r border-black p-1 uppercase">No. Cheque</th>
                                    <th className="border-r border-black p-1 uppercase">Beneficiarios</th>
                                    <th className="p-1 uppercase">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches.filter((m: any) => m.internal.amount < 0).map((match: any, i: number) => (
                                    <tr key={i} className="border-b border-gray-200 h-6">
                                        <td className="border-r border-black text-center" suppressHydrationWarning>{new Date(match.internal.date).toLocaleDateString('es-NI')}</td>
                                        <td className="border-r border-black text-center">{match.internal.reference || "S/R"}</td>
                                        <td className="border-r border-black px-2 uppercase text-[9px]">{match.internal.description}</td>
                                        <td className="text-right px-2 font-mono">{formatCurrency(Math.abs(match.internal.amount)).replace('C$', '')}</td>
                                    </tr>
                                ))}
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i} className="h-6 border-b border-gray-100 last:border-0 opacity-20">
                                        <td className="border-r border-black"></td>
                                        <td className="border-r border-black"></td>
                                        <td className="border-r border-black"></td>
                                        <td className=""></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Signature Section */}
                <div className="mt-16 grid grid-cols-3 gap-8 text-[9px]">
                    <div className="flex flex-col border-t border-black pt-2 text-left">
                        <p className="font-bold">Elaborado por:</p>
                        <p className="mt-8 font-black uppercase underline">Lic: Elias Benjamin H</p>
                        <p className="italic text-gray-500">contador auxiliar</p>
                    </div>
                    <div className="flex flex-col border-t border-black pt-2 text-left">
                        <p className="font-bold">Revisado por:</p>
                        <p className="mt-8 font-black uppercase underline">Lic: Julio Lopez E</p>
                        <p className="italic text-gray-500">Contador General</p>
                    </div>
                    <div className="flex flex-col border-t border-black pt-2 text-left">
                        <p className="font-bold">Autorizado por:</p>
                        <p className="mt-8 font-black uppercase underline text-[8px]">Lic: Youngren Kinsman</p>
                        <p className="italic text-gray-500">Direccion Admon-Fin.</p>
                    </div>
                </div>

                {/* System Footer */}
                <div className="mt-12 flex justify-between items-end border-t border-black/10 pt-4">
                    <div className="text-[7px] text-gray-400 font-sans tracking-widest uppercase">
                        SISTEMA GOBIERNO CARIBE NORTE • Folio: {reconciliation.id.substring(0, 8)}
                    </div>
                    <div className="text-[8px] text-slate-500 font-sans italic text-right">
                        Generado por: {printerUser?.name || "Sistema"} | Fecha: {new Date().toLocaleDateString('es-NI')} | Hora: {genTime}
                    </div>
                </div>
            </div>
        </ClientOnly>
    )
}
