
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
import { FileDown, Printer } from "lucide-react"
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
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-black uppercase">Informe General Contable</DialogTitle>
                            <p className="text-sm text-gray-500">Periodo Fiscal {new Date().getFullYear()} - Gobierno Regional</p>
                        </div>
                        <div className="flex gap-2 print:hidden">
                            <Button variant="outline" size="sm" onClick={handlePrint}>
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimir
                            </Button>
                            <Button variant="default" size="sm" onClick={handleDownloadCSV} className="bg-emerald-600 hover:bg-emerald-700">
                                <FileDown className="h-4 w-4 mr-2" />
                                Exportar Excel
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto border rounded-xl p-4 printable-content">
                    {/* Header for Print */}
                    <div className="hidden print:block mb-6 text-center">
                        <h1 className="text-2xl font-bold">GOBIERNO REGIONAL AUTÓNOMO COSTA CARIBE NORTE</h1>
                        <h2 className="text-xl">Libro Diario General</h2>
                        <p className="text-sm text-gray-500">Generado el: {new Date().toLocaleDateString()}</p>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="font-bold text-xs uppercase">No. Asiento</TableHead>
                                <TableHead className="font-bold text-xs uppercase">Fecha</TableHead>
                                <TableHead className="font-bold text-xs uppercase w-[300px]">Descripción</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-right">Monto</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-center">Tipo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="font-mono text-xs">{entry.numero}</TableCell>
                                    <TableCell className="text-xs">{new Date(entry.fecha).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-xs uppercase">{entry.descripcion}</TableCell>
                                    <TableCell className="text-xs font-bold text-right">{formatCurrency(entry.monto)}</TableCell>
                                    <TableCell className="text-xs text-center">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${entry.tipo === 'INGRESO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {entry.tipo}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="mt-8 flex justify-end gap-8 border-t pt-4">
                        <div className="text-right">
                            <p className="text-xs font-bold uppercase text-gray-500">Total Ingresos</p>
                            <p className="text-lg font-black text-emerald-600">{formatCurrency(totalIngresos)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold uppercase text-gray-500">Total Egresos</p>
                            <p className="text-lg font-black text-red-600">{formatCurrency(totalEgresos)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold uppercase text-gray-500">Balance Neto</p>
                            <p className="text-lg font-black text-indigo-900">{formatCurrency(totalIngresos - totalEgresos)}</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-mono">
                        <span>Sistema Financiero Gubernamental (SIGOB)</span>
                        <span>Generado por: <span className="font-bold text-gray-600 uppercase">{userName}</span> &bull; {new Date().toLocaleString()}</span>
                    </div>
                </div>

            </DialogContent>
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
            }
             /* Hide dialog overlay/close button */
            [role="dialog"] > button {
                display: none;
            }
        }
      `}</style>
        </Dialog>
    )
}
