"use client"

export const dynamic = "force-dynamic";
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { CheckPrintView } from "@/components/accounting/check-print-view"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer } from "lucide-react"

export default function PrintCheckPage() {
    const params = useParams()
    const router = useRouter()
    const [check, setCheck] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            fetch(`/api/accounting/checks/${params.id}`)
                .then(res => res.json())
                .then(data => {
                    setCheck(data)
                })
                .catch(console.error)
                .finally(() => setLoading(false))
        }
    }, [params.id])

    if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-slate-400">PREPARANDO VISTA DE IMPRESIÓN...</div>
    if (!check) return <div className="p-20 text-center font-black text-rose-500 uppercase tracking-widest">Cheque no encontrado</div>

    return (
        <div className="min-h-screen bg-slate-50 p-8 print:p-0 print:bg-white">
            <div className="max-w-4xl mx-auto space-y-8 print:space-y-0">
                <div className="flex items-center justify-between print:hidden">
                    <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Volver
                    </Button>
                    <Button onClick={() => window.print()} className="gap-2 bg-slate-900">
                        <Printer className="h-4 w-4" /> Imprimir Ahora
                    </Button>
                </div>

                <div className="bg-white shadow-2xl rounded-[2rem] p-12 print:shadow-none print:p-0 print:rounded-none">
                    <CheckPrintView check={check} bankTemplate={check.banco as any} />
                </div>
            </div>
        </div>
    )
}
