"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FileBarChart, Printer, Loader2, TrendingUp, BarChart3, PieChart } from "lucide-react"
import { toast } from "sonner"

export function BudgetReportDialog({
    open,
    onOpenChange
}: {
    open: boolean,
    onOpenChange: (open: boolean) => void
}) {
    const [loading, setLoading] = useState(false)
    const [reportType, setReportType] = useState("execution-regional")

    const handleGenerate = async () => {
        setLoading(true)

        try {
            const query = new URLSearchParams({
                type: reportType,
                anio: new Date().getFullYear().toString()
            }).toString()

            toast.success("Generando reporte oficial...", {
                description: "Abriendo vista previa en nueva ventana"
            })

            // Redirect to a preview/print page
            setTimeout(() => {
                window.open(`/presupuesto/reports/preview?${query}`, '_blank')
                onOpenChange(false)
                setLoading(false)
            }, 500)
        } catch (error) {
            toast.error("Error al generar el reporte", {
                description: "Intente nuevamente"
            })
            setLoading(false)
        }
    }

    const reportOptions = [
        {
            value: "execution-regional",
            label: "Ejecución por Centro Regional",
            icon: BarChart3,
            description: "Muestra el balance consolidado por cada centro regional (Bilwi, Waspam, etc.) detallando montos transados y remanentes."
        },
        {
            value: "comparative",
            label: "Análisis Comparativo",
            icon: TrendingUp,
            description: "Presenta una comparativa detallada por partida presupuestaria, indicando porcentajes de cumplimiento fiscal."
        },
        {
            value: "debt-investment",
            label: "Estado de Deuda - Inversión Pública",
            icon: PieChart,
            description: "Informe técnico de gastos de capital e inversión pública con saldos pendientes de ejecución."
        }
    ]

    const selectedReport = reportOptions.find(opt => opt.value === reportType)
    const ReportIcon = selectedReport?.icon || FileBarChart

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] border-none shadow-2xl rounded-[2.5rem] overflow-hidden p-0">
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <FileBarChart className="h-32 w-32" />
                    </div>
                    <div className="relative z-10">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                                <FileBarChart className="h-8 w-8" />
                                Informes Oficiales
                            </DialogTitle>
                            <DialogDescription className="text-emerald-100 font-medium mt-2 text-base">
                                Generación de documentación institucional certificada para el GRACCNN.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                </div>

                <div className="p-10 bg-white space-y-6">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Tipo de Informe Presupuestario
                        </Label>
                        <Select value={reportType} onValueChange={setReportType}>
                            <SelectTrigger className="h-14 px-5 rounded-2xl border-slate-100 bg-slate-50 font-bold">
                                <SelectValue placeholder="Seleccione un informe" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                                {reportOptions.map((option) => {
                                    const Icon = option.icon
                                    return (
                                        <SelectItem key={option.value} value={option.value} className="py-3">
                                            <div className="flex items-center gap-3">
                                                <Icon className="h-4 w-4" />
                                                <span className="font-bold">{option.label}</span>
                                            </div>
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedReport && (
                        <div className="p-6 bg-gradient-to-br from-emerald-50 to-transparent rounded-2xl border border-emerald-100 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                    <ReportIcon className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-black text-emerald-900 uppercase mb-2">
                                        Descripción del Informe
                                    </h4>
                                    <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                                        {selectedReport.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                        <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                                <span className="text-lg">📄</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
                                    Formato del Documento
                                </p>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                    El informe se generará en formato oficial con firmas de responsabilidad y sello institucional del GRACCNN. Incluye fecha de emisión: <span className="font-bold">{new Date().toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-12 px-6 rounded-2xl font-bold border-slate-200 hover:bg-white"
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="h-12 px-8 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-200 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                        onClick={handleGenerate}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Generando...
                            </>
                        ) : (
                            <>
                                <Printer className="mr-2 h-5 w-5" />
                                Generar Vista Previa
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
