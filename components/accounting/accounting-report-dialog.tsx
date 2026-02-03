
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { FileDown, Printer, ShieldCheck } from "lucide-react"
import { useSession } from "next-auth/react"

interface AccountingReportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    entries: any[]
    totalIngresos: number
    totalEgresos: number
}

export function AccountingReportDialog({
    open,
    onOpenChange,
    entries,
    totalIngresos,
    totalEgresos
}: AccountingReportDialogProps) {
    const { data: session } = useSession()
    const userName = session?.user?.name || session?.user?.email || "Usuario del Sistema"

    const handlePrint = () => {
        window.print()
    }

    const handleDownloadCSV = () => {
        const headers = ["Numero", "Fecha", "Descripcion", "Monto", "Tipo", "Estado", "Institucion", "Cuenta"]
        const csvContent = entries.map(e => {
            const date = new Date(e.fecha).toLocaleDateString()
            const desc = `"${e.descripcion.replace(/"/g, '""')}"`
            // Use raw monto if available or parse formated
            return [e.numero, date, desc, e.monto, e.tipo, e.estado, e.institucion, e.cuentaContable].join(",")
        })
        const csvString = [headers.join(","), ...csvContent].join("\n")
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `libro_diario_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl flex flex-col bg-white">
                <div className="bg-slate-950 p-10 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                        <FileDown className="h-48 w-48 rotate-12" />
                    </div>
                    <div className="relative z-10 space-y-2">
                        <h2 className="text-3xl font-black tracking-tighter uppercase italic">Informe General <span className="text-indigo-500">Contable</span></h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Gestión de Trazabilidad Fiscal &bull; {new Date().getFullYear()}</p>
                    </div>
                    <div className="flex gap-4 relative z-10 print:hidden">
                        <Button variant="outline" size="lg" onClick={handlePrint} className="rounded-2xl h-14 px-8 border-white/10 bg-white/5 text-white hover:bg-white/10 font-black uppercase text-[10px] tracking-widest transition-all">
                            <Printer className="h-5 w-5 mr-3" />
                            Imprimir Reporte
                        </Button>
                        <Button variant="default" size="lg" onClick={handleDownloadCSV} className="rounded-2xl h-14 px-10 bg-indigo-600 hover:bg-indigo-700 font-black uppercase text-[10px] tracking-widest shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] transition-all hover:translate-y-[-2px]">
                            <FileDown className="h-5 w-5 mr-3" />
                            Exportar CSV
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-hide printable-content bg-slate-50/30">
                    {/* Header for Print */}
                    <div className="hidden print:block mb-12 border-b-4 border-slate-900 pb-8 text-center space-y-2">
                        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">Gobierno Regional Autónomo Costa Caribe Norte</h1>
                        <h2 className="text-xl font-bold text-slate-600 uppercase italic tracking-widest">Libro Diario General Consolidado</h2>
                        <p className="text-[11px] text-slate-400 mt-4 font-black uppercase tracking-[0.5em]">CERTIFICACIÓN OFICIAL DE MOVIMIENTOS FISCALES</p>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 border-b border-slate-100 hover:bg-slate-50">
                                    <TableHead className="px-8 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400">ID Folio</TableHead>
                                    <TableHead className="px-8 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400">Fecha</TableHead>
                                    <TableHead className="px-8 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400 w-[45%]">Descripción del Asiento</TableHead>
                                    <TableHead className="px-8 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Monto Unitario</TableHead>
                                    <TableHead className="px-8 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Clase</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entries.map((entry) => (
                                    <TableRow key={entry.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                                        <TableCell className="px-8 py-6 font-mono text-[11px] font-black text-indigo-600 tracking-tighter">{entry.numero}</TableCell>
                                        <TableCell className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-slate-900">{new Date(entry.fecha).toLocaleDateString('es-NI', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase">{entry.institucion}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-8 py-6 text-xs font-bold text-slate-700 leading-relaxed uppercase tracking-tight">{entry.descripcion}</TableCell>
                                        <TableCell className="px-8 py-6 text-right font-black text-slate-900 text-sm whitespace-nowrap">{formatCurrency(entry.monto)}</TableCell>
                                        <TableCell className="px-8 py-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.1em] uppercase shadow-sm ${entry.tipo === 'INGRESO' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                {entry.tipo}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex flex-col lg:flex-row justify-end items-stretch gap-6 shrink-0">
                        <div className="bg-white p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 text-right space-y-1 min-w-[200px]">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Recaudación (Ingresos)</p>
                            <p className="text-2xl font-black text-emerald-600">{formatCurrency(totalIngresos)}</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 text-right space-y-1 min-w-[200px]">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ejecución (Egresos)</p>
                            <p className="text-2xl font-black text-rose-600">{formatCurrency(totalEgresos)}</p>
                        </div>
                        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl shadow-indigo-200/20 text-right space-y-1 min-w-[250px] transform hover:scale-[1.02] transition-transform">
                            <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Superavit / Déficit Fiscal</p>
                            <p className="text-3xl font-black text-white">{formatCurrency(totalIngresos - totalEgresos)}</p>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span>Sistema de Control <span className="text-indigo-600 font-black">GRACCNN SIGOB</span></span>
                                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest italic">Trazabilidad Total Auditada</span>
                            </div>
                        </div>
                        <div className="text-center md:text-right flex flex-col items-center md:items-end gap-1">
                            <span>Generado por: <span className="text-slate-900 font-black px-2 py-0.5 bg-slate-100 rounded-lg">{userName}</span></span>
                            <span className="text-[9px] lowercase font-medium text-slate-300">{new Date().toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <style jsx global>{`
        @media print {
            body * {
                visibility: hidden;
            }
            .printable-content, .printable-content * {
                visibility: visible;
            }
            .printable-content {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                border: none;
                padding: 0 !important;
                margin: 0 !important;
                background: white !important;
            }
            .printable-content table {
                width: 100% !important;
                border: 1px solid #e2e8f0 !important;
            }
            .printable-content .bg-white, .printable-content .bg-slate-50, .printable-content .bg-slate-900 {
                background: white !important;
                color: black !important;
                border: 1px solid #e2e8f0 !important;
                box-shadow: none !important;
            }
            .printable-content .text-indigo-400, .printable-content .text-indigo-600, .printable-content .text-emerald-600, .printable-content .text-rose-600 {
                color: black !important;
            }
             /* Hide dialog overlay/close button */
            [role="dialog"] > button {
                display: none;
            }
        }
      `}</style>
            </DialogContent>
        </Dialog>
    )
}
