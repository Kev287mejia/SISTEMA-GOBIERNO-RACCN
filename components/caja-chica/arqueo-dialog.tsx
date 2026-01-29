"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calculator, AlertTriangle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface ArqueoDialogProps {
    boxId: string
    boxName: string
    expectedBalance: number
    onSuccess?: () => void
}

export function ArqueoDialog({ boxId, boxName, expectedBalance, onSuccess }: ArqueoDialogProps) {
    const [open, setOpen] = useState(false)
    const [countedAmount, setCountedAmount] = useState("")
    const [observations, setObservations] = useState("")
    const [loading, setLoading] = useState(false)

    const counted = parseFloat(countedAmount) || 0
    const difference = counted - expectedBalance
    const isExact = Math.abs(difference) < 0.01

    const handleSubmit = async () => {
        if (!countedAmount) return

        setLoading(true)
        try {
            const res = await fetch("/api/caja-chica/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    boxId,
                    expected: expectedBalance,
                    counted,
                    observations
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Error al guardar")
            }

            toast.success("Arqueo registrado correctamente en base de datos", {
                description: `Diferencia: C$ ${difference.toFixed(2)}`
            })
            setOpen(false)
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || "Error al registrar arqueo")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50">
                    <Calculator className="h-4 w-4" />
                    Realizar Arqueo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-indigo-600" />
                        Arqueo de Caja
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="text-sm text-muted-foreground mb-1">Caja a auditar</p>
                        <p className="font-bold text-gray-900">{boxName}</p>
                        <div className="mt-3 flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Saldo en Sistema:</span>
                            <span className="font-mono font-bold text-indigo-600">
                                C$ {expectedBalance.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="counted">Monto Físico Contado</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500 font-bold">C$</span>
                            <Input
                                id="counted"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-10 text-lg font-bold"
                                value={countedAmount}
                                onChange={(e) => setCountedAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    {countedAmount && (
                        <div className={`p-4 rounded-lg border ${isExact ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Diferencia:</span>
                                <span className={`font-mono font-bold text-lg ${difference >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {difference > 0 ? '+' : ''}{difference.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <p className="text-xs flex items-center gap-1.5 mt-2">
                                {isExact ? (
                                    <>
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                        <span className="text-emerald-700 font-medium">Cuadre perfecto</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                                        <span className="text-red-700 font-medium">
                                            {difference > 0 ? 'Sobrante de efectivo' : 'Faltante de efectivo'}
                                        </span>
                                    </>
                                )}
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="obs">Observaciones del Auditor</Label>
                        <Textarea
                            id="obs"
                            placeholder="Detalle cualquier irregularidad o comentarios..."
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={!countedAmount || loading} className={isExact ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}>
                        {loading ? "Guardando..." : "Registrar Arqueo"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
