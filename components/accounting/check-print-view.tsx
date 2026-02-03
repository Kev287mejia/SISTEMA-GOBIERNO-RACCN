"use client"

import { useMemo } from "react"
import { numberToSpanishWords } from "@/lib/number-to-words"
import { formatCurrency } from "@/lib/utils"

interface CheckPrintViewProps {
    check: any
    bankTemplate: "BANPRO" | "BDF" | "BAC" | "LA_FISE"
}

export const CheckPrintView = ({ check, bankTemplate }: CheckPrintViewProps) => {
    const formattedDate = useMemo(() => {
        const d = new Date(check.fecha)
        return {
            day: d.getDate().toString().padStart(2, '0'),
            month: (d.getMonth() + 1).toString().padStart(2, '0'),
            year: d.getFullYear().toString()
        }
    }, [check.fecha])

    const amountInWords = useMemo(() => {
        return numberToSpanishWords(Number(check.monto))
    }, [check.monto])

    // Specific coordinates for each bank (in mm or similar)
    // This is just a simulation, in a real system these would be stored in DB
    const templates = {
        BANPRO: {
            container: "w-[175mm] h-[75mm]",
            date: "top-[10mm] left-[130mm]",
            beneficiary: "top-[25mm] left-[25mm]",
            amount: "top-[25mm] left-[140mm]",
            amountWords: "top-[35mm] left-[25mm] max-w-[130mm]",
            memo: "top-[55mm] left-[25mm]"
        },
        BDF: {
            container: "w-[180mm] h-[80mm]",
            date: "top-[12mm] left-[135mm]",
            beneficiary: "top-[28mm] left-[30mm]",
            amount: "top-[28mm] left-[145mm]",
            amountWords: "top-[38mm] left-[30mm] max-w-[135mm]",
            memo: "top-[60mm] left-[30mm]"
        },
        BAC: {
            container: "w-[170mm] h-[70mm]",
            date: "top-[8mm] left-[125mm]",
            beneficiary: "top-[22mm] left-[22mm]",
            amount: "top-[22mm] left-[135mm]",
            amountWords: "top-[32mm] left-[22mm] max-w-[125mm]",
            memo: "top-[52mm] left-[22mm]"
        },
        LA_FISE: {
            container: "w-[178mm] h-[78mm]",
            date: "top-[11mm] left-[132mm]",
            beneficiary: "top-[26mm] left-[28mm]",
            amount: "top-[26mm] left-[142mm]",
            amountWords: "top-[36mm] left-[28mm] max-w-[132mm]",
            memo: "top-[58mm] left-[28mm]"
        }
    }

    const t = templates[bankTemplate] || templates.BANPRO

    return (
        <div className={`relative bg-white text-black font-mono overflow-hidden ${t.container} border border-slate-100 shadow-sm print:border-none print:shadow-none`}>
            {/* Amount Number */}
            <div className={`absolute ${t.amount} font-black text-lg`}>
                *{formatCurrency(check.monto).replace('C$', '')}*
            </div>

            {/* Date */}
            <div className={`absolute ${t.date} flex gap-4 font-bold`}>
                <span>{formattedDate.day}</span>
                <span>{formattedDate.month}</span>
                <span>{formattedDate.year}</span>
            </div>

            {/* Beneficiary */}
            <div className={`absolute ${t.beneficiary} font-black uppercase text-sm`}>
                {check.beneficiario}
            </div>

            {/* Amount in Words */}
            <div className={`absolute ${t.amountWords} font-bold text-[10px] leading-tight break-words uppercase`}>
                {amountInWords}
            </div>

            {/* Memo / Reference */}
            <div className={`absolute ${t.memo} text-[9px] font-medium italic text-slate-500 uppercase`}>
                {check.referencia || check.accountingEntry?.descripcion || "S/R"}
            </div>

            {/* Signature Area (Optional indicators) */}
            <div className="absolute bottom-[10mm] right-[20mm] border-t border-slate-300 w-[50mm] text-center pt-1 hidden print:block">
                <span className="text-[8px] font-bold text-slate-400">FIRMA AUTORIZADA</span>
            </div>

            {/* Visual background for screen preview only */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none print:hidden uppercase font-black text-6xl rotate-[-15deg]">
                {bankTemplate} PREVIEW
            </div>
        </div>
    )
}
