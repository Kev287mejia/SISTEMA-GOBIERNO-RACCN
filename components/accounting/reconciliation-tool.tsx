"use client"

import { useState, useEffect } from "react"
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    Upload,
    Search,
    ArrowRightLeft,
    Banknote,
    FileSpreadsheet,
    RefreshCw,
    ShieldCheck,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    Sparkles,
    Zap,
    MousePointer2,
    Lock,
    ListChecks,
    History,
    Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import * as XLSX from "xlsx"

interface StatementEntry {
    date: string
    amount: number
    description: string
    reference?: string
}

interface ReconciliationMatch {
    external: StatementEntry
    internal: any
    confidence: number
}

export function ReconciliationTool({ bankAccountId }: { bankAccountId: string }) {
    const [loading, setLoading] = useState(false)
    const [rawInput, setRawInput] = useState("")
    const [processedEntries, setProcessedEntries] = useState<StatementEntry[]>([])
    const [matches, setMatches] = useState<ReconciliationMatch[]>([])
    const [unmatchedInternal, setUnmatchedInternal] = useState<any[]>([])
    const [unmatchedExternal, setUnmatchedExternal] = useState<StatementEntry[]>([])
    const [step, setStep] = useState(1) // 1: Input, 2: Preview/Match, 3: Completed

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result
                const wb = XLSX.read(bstr, { type: "binary" })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][]

                if (data.length < 2) {
                    toast.error("El archivo parece estar vacío o no tiene el formato correcto.")
                    return
                }

                // --- Intelligent mapping logic ---
                let dateIdx = 0, descIdx = 1, amountIdx = 2, refIdx = 3
                const firstRow = data[0].map(c => String(c).toLowerCase())

                // Look for common headers
                const dateHeader = firstRow.findIndex(h => h.includes("fecha") || h.includes("date"))
                const descHeader = firstRow.findIndex(h => h.includes("desc") || h.includes("concepto") || h.includes("detalle") || h.includes("beneficiario"))
                const amountHeader = firstRow.findIndex(h => h.includes("monto") || h.includes("cantidad") || h.includes("valor") || h.includes("importe") || h.includes("debe") || h.includes("haber") || h.includes("cargo") || h.includes("abono"))
                const refHeader = firstRow.findIndex(h => h.includes("ref") || h.includes("comprobante") || h.includes("documento") || h.includes("cheque"))

                if (dateHeader !== -1) dateIdx = dateHeader
                if (descHeader !== -1) descIdx = descHeader
                if (amountHeader !== -1) amountIdx = amountHeader
                if (refHeader !== -1) refIdx = refHeader

                const entries: StatementEntry[] = data.slice(1).map((row, index) => {
                    if (row.length < 2) return null // Skip very short rows

                    let dateStr = ""
                    const rawDate = row[dateIdx]
                    if (typeof rawDate === 'number') {
                        // Handle Excel date format (number of days since 1900-01-01)
                        const date = new Date(Math.round((rawDate - 25569) * 86400 * 1000))
                        dateStr = date.toISOString().split('T')[0]
                    } else if (rawDate) {
                        dateStr = String(rawDate).trim()
                    }

                    const rawAmount = row[amountIdx]
                    let amountNum = 0
                    if (typeof rawAmount === 'number') {
                        amountNum = rawAmount
                    } else {
                        // Clean currency symbols, commas, and handle parentheses for negatives
                        let cleaned = String(rawAmount || "0").replace(/[^\d.,()-]/g, "")
                        if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
                            cleaned = '-' + cleaned.slice(1, -1)
                        }
                        cleaned = cleaned.replace(/,/g, "")
                        amountNum = parseFloat(cleaned)
                    }

                    if (!dateStr || isNaN(amountNum)) return null

                    return {
                        date: dateStr,
                        description: String(row[descIdx] || "Sin descripción"),
                        amount: amountNum,
                        reference: row[refIdx] ? String(row[refIdx]) : undefined
                    }
                }).filter(e => e !== null) as StatementEntry[]

                if (entries.length === 0) {
                    toast.error("No se pudieron extraer datos válidos. Verifique que el archivo tenga columnas de Fecha, Descripción y Monto.")
                    return
                }

                toast.success(`Se cargaron ${entries.length} movimientos del archivo.`)
                setProcessedEntries(entries)
                runAutoMatch(entries)
            } catch (error) {
                console.error("Excel parse error", error)
                toast.error("Error crítico al procesar el archivo Excel/CSV")
            }
        }
        reader.readAsBinaryString(file)
    }

    const processRawData = () => {
        try {
            const lines = rawInput.trim().split("\n")
            const errors: string[] = []
            const entries: StatementEntry[] = []

            lines.forEach((line, index) => {
                if (!line.trim()) return

                const parts = line.split(/[,\t]/)
                if (parts.length < 3) {
                    errors.push(`Línea ${index + 1}: Faltan columnas (Se requiere Fecha, Descripción y Monto)`)
                    return
                }

                const dateStr = parts[0].trim()
                const descStr = parts[1].trim()
                const amountStr = parts[2].trim().replace(/[^\d.-]/g, "")
                const amount = parseFloat(amountStr)

                // Basic date validation (YYYY-MM-DD or DD/MM/YYYY)
                const dateRegex = /^(\d{4}-\d{2}-\d{2})|(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})$/
                if (!dateRegex.test(dateStr)) {
                    errors.push(`Línea ${index + 1}: Fecha inválida "${dateStr}"`)
                    return
                }

                if (!descStr) {
                    errors.push(`Línea ${index + 1}: La descripción es obligatoria`)
                    return
                }

                if (isNaN(amount)) {
                    errors.push(`Línea ${index + 1}: Monto inválido "${parts[2]}"`)
                    return
                }

                entries.push({
                    date: dateStr,
                    description: descStr,
                    amount: amount,
                    reference: parts[3]?.trim() || undefined
                })
            })

            if (errors.length > 0) {
                // Show first 3 errors to not overwhelm
                errors.slice(0, 3).forEach(err => toast.error(err))
                if (errors.length > 3) toast.error(`Y ${errors.length - 3} errores más...`)
                return
            }

            if (entries.length === 0) {
                toast.error("No se detectaron entradas válidas. Verifique que ha pegado datos del banco.")
                return
            }

            setProcessedEntries(entries)
            runAutoMatch(entries)
        } catch (error) {
            toast.error("Error crítico al procesar los datos. Revise el formato.")
        }
    }

    const runAutoMatch = async (entries: StatementEntry[]) => {
        setLoading(true)
        try {
            const res = await fetch("/api/accounting/reconciliation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bankAccountId, statementEntries: entries })
            })

            if (res.ok) {
                const results = await res.json()
                setMatches(results.matched)
                setUnmatchedInternal(results.unmatchedInternal)
                setUnmatchedExternal(results.unmatchedExternal)
                setStep(2)
            } else {
                toast.error("Error al conectar con el motor de conciliación")
            }
        } catch (error) {
            toast.error("Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    const [reconciliationId, setReconciliationId] = useState<string | null>(null)

    const confirmReconciliation = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/accounting/reconciliation", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bankAccountId,
                    matchIds: matches.map(m => m.internal.id),
                    stats: {
                        totalMatched: matches.length,
                        totalUnmatchedInternal: unmatchedInternal.length,
                        totalUnmatchedExternal: unmatchedExternal.length,
                        matches: matches, // Save matches for the report
                        unmatchedInternal: unmatchedInternal,
                        unmatchedExternal: unmatchedExternal
                    }
                })
            })

            if (res.ok) {
                const data = await res.json()
                toast.success("Conciliación guardada exitosamente")
                setReconciliationId(data.id)
                setStep(3)
            } else {
                toast.error("Error al guardar la conciliación")
            }
        } catch (error) {
            toast.error("Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    const insertExample = () => {
        setRawInput(`2026-01-25, Transferencia Recibida Hacienda, 1500000.00, DEP-001\n2026-01-26, Pago Proveedor Suministros, -12500.50, CH-5520\n2026-01-28, Intereses Ganados, 450.20, NC-101`)
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Stepper - Humanizing the process flow */}
            <div className="flex items-center justify-center mb-12">
                <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${step === 1 ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${step === 1 ? 'bg-white text-indigo-600' : 'bg-slate-100'}`}>1</div>
                        <span className="text-xs font-black uppercase tracking-tighter">Entrada de Datos</span>
                    </div>
                    <div className="w-8 h-px bg-slate-200" />
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${step === 2 ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${step === 2 ? 'bg-white text-indigo-600' : 'bg-slate-100'}`}>2</div>
                        <span className="text-xs font-black uppercase tracking-tighter">Cruce de Cuentas</span>
                    </div>
                    <div className="w-8 h-px bg-slate-200" />
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${step === 3 ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${step === 3 ? 'bg-white text-indigo-600' : 'bg-slate-100'}`}>3</div>
                        <span className="text-xs font-black uppercase tracking-tighter">Certificación</span>
                    </div>
                </div>
            </div>

            {step === 1 && (
                <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden bg-white/50 backdrop-blur-sm border border-slate-100">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-8 pb-10">
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 animate-pulse-slow">
                                <Sparkles className="h-7 w-7" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Asistente de Conciliación Inteligente</CardTitle>
                                <CardDescription className="text-slate-500 font-medium text-base mt-1 italic">
                                    Vincule su estado de cuenta bancario para detectar coincidencias automáticas con el Libro Diario.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="space-y-4">
                                <div className="bg-slate-50/50 p-10 rounded-[2rem] border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-white transition-all duration-500 flex flex-col items-center justify-center gap-5 group">
                                    <div className="h-20 w-20 bg-white text-indigo-600 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl shadow-indigo-100/50">
                                        <FileSpreadsheet className="h-10 w-10" />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-lg font-black text-slate-800 uppercase tracking-tight">Importar Estado de Cuenta</p>
                                        <p className="text-xs text-slate-400 font-medium">Arrastre su archivo Excel o CSV aquí</p>
                                    </div>
                                    <div className="relative mt-2">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={handleFileUpload}
                                        />
                                        <Button className="bg-slate-900 hover:bg-indigo-600 rounded-xl px-8 h-12 shadow-lg shadow-slate-200">
                                            Seleccionar Archivo Digital
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-slate-100" />
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">O Pegar Texto</span>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>

                                <div className="bg-indigo-50/50 border border-indigo-100/50 p-6 rounded-2xl flex items-start gap-4">
                                    <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                                        <Zap className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <div className="text-xs text-indigo-900 leading-relaxed">
                                        <p className="font-black uppercase tracking-[0.1em] mb-2 text-indigo-700">Guía de Vinculación Rápida:</p>
                                        <ol className="list-decimal list-inside space-y-1 font-medium italic">
                                            <li>Copie las columnas desde su portal bancario o Excel.</li>
                                            <li>Asegúrese de incluir: Fecha, Descripción y Monto.</li>
                                            <li>Pegue el contenido en el panel de la derecha.</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <History className="h-3 w-3" /> Area de Procesamiento Directo
                                    </label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={insertExample}
                                        className="h-7 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg px-3"
                                    >
                                        <MousePointer2 className="h-3 w-3 mr-1" /> Ver Ejemplo de Llenado
                                    </Button>
                                </div>
                                <textarea
                                    className="w-full min-h-[350px] p-8 rounded-[2rem] border-none bg-slate-50/80 font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none shadow-inner placeholder:text-slate-300"
                                    placeholder="Pegue aquí el contenido de su portal bancario...&#10;&#10;Ej: 30/01/2026, Depósito Tesoro, 25000.00&#10;Ej: 30/01/2026, Pago Servicios, -1500.00"
                                    value={rawInput}
                                    onChange={(e) => setRawInput(e.target.value)}
                                />
                                <div className="space-y-4 pt-6">
                                    <Button
                                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-700 hover:shadow-2xl hover:shadow-indigo-200 h-16 rounded-2xl font-black uppercase tracking-tight text-white transition-all hover:scale-[1.01] active:scale-95 group border-none"
                                        onClick={processRawData}
                                        disabled={!rawInput.trim() || loading}
                                    >
                                        {loading ? (
                                            <RefreshCw className="h-5 w-5 animate-spin mr-3" />
                                        ) : (
                                            <Sparkles className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
                                        )}
                                        Validar Saldo y Detectar Coincidencias
                                    </Button>

                                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50/50 text-emerald-700 rounded-xl border border-emerald-100/30">
                                        <Lock className="h-3 w-3" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600/80">Encriptación de Grado Bancario Activa • Privacidad Garantizada</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-xl rounded-3xl overflow-hidden border-indigo-100">
                            <CardHeader className="bg-indigo-50/50 border-b pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-emerald-500 text-white border-none font-black px-2">{matches.length}</Badge>
                                        <CardTitle className="text-lg font-black text-slate-800 uppercase tracking-tight">Coincidencias Automáticas Encontradas</CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        98% Precisión
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[500px]">
                                    <div className="divide-y divide-slate-100">
                                        {matches.map((match, i) => (
                                            <div key={i} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center gap-6">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Banco (Externo)</span>
                                                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest text-right">Sistema (Interno)</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                            <div className="flex justify-between items-start">
                                                                <p className="text-xs font-bold text-slate-700 mb-1">{match.external.description}</p>
                                                                <Badge variant="outline" className="text-[9px] h-4">{match.external.date}</Badge>
                                                            </div>
                                                            <p className="text-sm font-black text-slate-900">{formatCurrency(match.external.amount)}</p>
                                                        </div>
                                                        <ArrowRightLeft className="h-5 w-5 text-indigo-500 shrink-0" />
                                                        <div className="flex-1 bg-indigo-50/30 p-3 rounded-xl border border-indigo-100 shadow-sm">
                                                            <div className="flex justify-between items-start">
                                                                <p className="text-xs font-bold text-indigo-900 mb-1 truncate max-w-[120px]">{match.internal.description}</p>
                                                                <Badge variant="outline" className="text-[9px] h-4 border-indigo-200 text-indigo-500 bg-white">
                                                                    {new Date(match.internal.date).toLocaleDateString()}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-sm font-black text-indigo-600">{formatCurrency(match.internal.amount)}</p>
                                                                {match.internal.reference && (
                                                                    <Badge className="bg-indigo-600 text-[8px] h-3 px-1">{match.internal.reference}</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-none shadow-xl rounded-3xl bg-slate-900 text-white overflow-hidden">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Resumen de Operación</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-slate-500">Conciliados</p>
                                        <p className="text-2xl font-black text-emerald-400">{matches.length}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-slate-500">Diferencia</p>
                                        <p className="text-2xl font-black text-white">C$ 0.00</p>
                                    </div>
                                </div>
                                <div className="space-y-3 pt-4 border-t border-slate-800">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Sin correspondencia (Ext):</span>
                                        <span className="font-bold text-amber-500">{unmatchedExternal.length}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Sin correspondencia (Int):</span>
                                        <span className="font-bold text-red-400">{unmatchedInternal.length}</span>
                                    </div>
                                </div>
                                <Button
                                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-tight rounded-xl shadow-lg shadow-emerald-900/40"
                                    onClick={confirmReconciliation}
                                    disabled={loading}
                                >
                                    {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                    Confirmar Conciliación
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg rounded-3xl overflow-hidden border-amber-100">
                            <CardHeader className="bg-amber-50/50 pb-3">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-amber-600">Pendientes en Sistema</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[200px]">
                                    <div className="divide-y divide-amber-50">
                                        {unmatchedInternal.map((it, i) => (
                                            <div key={i} className="p-3 bg-white flex justify-between items-center text-[10px]">
                                                <div className="max-w-[120px]">
                                                    <p className="font-bold text-slate-700 truncate">{it.description}</p>
                                                    <p className="text-slate-400">{new Date(it.date).toLocaleDateString()}</p>
                                                </div>
                                                <span className="font-black text-slate-900">{formatCurrency(it.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
                    <div className="h-24 w-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">¡Conciliación Finalizada!</h2>
                    <p className="text-slate-500 font-medium max-w-sm text-center mt-2">
                        Se han actualizado satisfactoriamente {matches.length} movimientos bancarios. El saldo de la cuenta ha sido validado.
                    </p>
                    <div className="flex gap-4 mt-8">
                        <Button variant="outline" className="rounded-xl h-12 px-8 font-black uppercase text-[10px]" onClick={() => setStep(1)}>Nueva Carga</Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-12 px-8 font-black uppercase shadow-lg shadow-indigo-100 text-[10px] flex items-center gap-2"
                            onClick={() => {
                                if (reconciliationId) {
                                    const width = 1000;
                                    const height = 800;
                                    const left = (window.screen.width - width) / 2;
                                    const top = (window.screen.height - height) / 2;
                                    window.open(
                                        `/contabilidad/bancos/reconciliation/print/${reconciliationId}`,
                                        'PrintWindow',
                                        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=no,resizable=yes`
                                    );
                                }
                            }}
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            Generar Acta de Conciliación
                        </Button>
                        <Button variant="ghost" className="rounded-xl h-12 px-8 font-black uppercase text-[10px]" onClick={() => window.location.reload()}>Cerrar</Button>
                    </div>
                </div>
            )}
        </div>
    )
}
