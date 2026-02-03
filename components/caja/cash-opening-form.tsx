
"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Calculator, Banknote, Coins, ArrowRight, Save } from "lucide-react"

interface CashOpeningFormProps {
    onConfirm: (total: number, details: any) => void
    onCancel: () => void
    isLoading?: boolean
}

type Denomination = {
    value: number
    label: string
    type: 'bill' | 'coin'
    quantity: number
}

const DENOMINATIONS: Denomination[] = [
    // Billetes
    { value: 1000, label: "C$ 1,000", type: 'bill', quantity: 0 },
    { value: 500, label: "C$ 500", type: 'bill', quantity: 0 },
    { value: 200, label: "C$ 200", type: 'bill', quantity: 0 },
    { value: 100, label: "C$ 100", type: 'bill', quantity: 0 },
    { value: 50, label: "C$ 50", type: 'bill', quantity: 0 },
    { value: 20, label: "C$ 20", type: 'bill', quantity: 0 },
    { value: 10, label: "C$ 10", type: 'bill', quantity: 0 },
    // Monedas
    { value: 5, label: "C$ 5", type: 'coin', quantity: 0 },
    { value: 1, label: "C$ 1", type: 'coin', quantity: 0 },
    { value: 0.50, label: "C$ 0.50", type: 'coin', quantity: 0 },
    { value: 0.25, label: "C$ 0.25", type: 'coin', quantity: 0 },
]

export function CashOpeningForm({ onConfirm, onCancel, isLoading }: CashOpeningFormProps) {
    const [denominations, setDenominations] = useState<Denomination[]>(DENOMINATIONS)
    const [notes, setNotes] = useState("")

    const updateQuantity = (value: number, qtyString: string) => {
        const qty = parseInt(qtyString) || 0
        setDenominations(prev => prev.map(d =>
            d.value === value ? { ...d, quantity: qty >= 0 ? qty : 0 } : d
        ))
    }

    const totalBills = denominations
        .filter(d => d.type === 'bill')
        .reduce((sum, d) => sum + (d.value * d.quantity), 0)

    const totalCoins = denominations
        .filter(d => d.type === 'coin')
        .reduce((sum, d) => sum + (d.value * d.quantity), 0)

    const grandTotal = totalBills + totalCoins

    const handleConfirm = () => {
        const breakdown = denominations.reduce((acc, curr) => {
            if (curr.quantity > 0) {
                acc[curr.value] = curr.quantity
            }
            return acc
        }, {} as Record<number, number>)

        onConfirm(grandTotal, {
            breakdown,
            notes,
            manualTotal: grandTotal
        })
    }

    return (
        <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Calculator className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Arqueo Inicial de Caja</h3>
                        <p className="text-xs text-slate-500">Ingrese la cantidad de billetes y monedas para apertura.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Billetes Column */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-indigo-600 font-bold text-sm uppercase tracking-wider">
                            <Banknote className="h-4 w-4" />
                            Billetes
                        </div>
                        <div className="space-y-3">
                            {denominations.filter(d => d.type === 'bill').map((denom) => (
                                <div key={denom.value} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                    <span className="font-bold text-slate-700 min-w-[80px]">{denom.label}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-400">x</span>
                                        <Input
                                            type="number"
                                            min="0"
                                            className="w-20 h-8 text-right font-mono"
                                            placeholder="0"
                                            value={denom.quantity || ''}
                                            onChange={(e) => updateQuantity(denom.value, e.target.value)}
                                        />
                                        <div className="w-24 text-right font-bold text-slate-900 font-mono text-sm">
                                            {formatCurrency(denom.value * denom.quantity).replace('C$', '')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-between pt-2 border-t border-indigo-100 mt-2">
                                <span className="text-xs font-bold text-indigo-500 uppercase">Subtotal Billetes</span>
                                <span className="font-bold text-indigo-700">{formatCurrency(totalBills)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Monedas Column */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-amber-600 font-bold text-sm uppercase tracking-wider">
                            <Coins className="h-4 w-4" />
                            Monedas
                        </div>
                        <div className="space-y-3">
                            {denominations.filter(d => d.type === 'coin').map((denom) => (
                                <div key={denom.value} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                    <span className="font-bold text-slate-700 min-w-[80px]">{denom.label}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-400">x</span>
                                        <Input
                                            type="number"
                                            min="0"
                                            className="w-20 h-8 text-right font-mono"
                                            placeholder="0"
                                            value={denom.quantity || ''}
                                            onChange={(e) => updateQuantity(denom.value, e.target.value)}
                                        />
                                        <div className="w-24 text-right font-bold text-slate-900 font-mono text-sm">
                                            {formatCurrency(denom.value * denom.quantity).replace('C$', '')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-between pt-2 border-t border-amber-100 mt-2">
                                <span className="text-xs font-bold text-amber-500 uppercase">Subtotal Monedas</span>
                                <span className="font-bold text-amber-700">{formatCurrency(totalCoins)}</span>
                            </div>

                            {/* Additional Info */}
                            <div className="mt-8">
                                <Label htmlFor="notes" className="text-xs font-bold text-slate-500 uppercase">Observaciones Iniciales</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Ej. Cambio recibido de tesorería central..."
                                    className="mt-2 text-sm bg-white"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grand Total Bar */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center justify-between shadow-xl">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Apertura</p>
                    <div className="text-3xl font-black tracking-tight font-mono">
                        {formatCurrency(grandTotal)}
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="text-slate-900 border-none hover:bg-slate-100" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 shadow-lg shadow-emerald-900/20"
                    >
                        {isLoading ? "Abriendo..." : (
                            <>
                                Confirmar Apertura <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
