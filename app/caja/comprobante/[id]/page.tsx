"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PaymentVoucherView } from "@/components/accounting/payment-voucher-view"
import { useSession } from "next-auth/react"

export default function ComprobantePagoPage() {
    const params = useParams()
    const { data: session } = useSession()
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

    if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-slate-400">CARGANDO COMPROBANTE...</div>
    if (!check) return <div className="p-20 text-center font-black text-rose-500 uppercase tracking-widest">Comprobante no encontrado</div>

    return (
        <DashboardLayout>
            <div className="animate-in fade-in duration-500">
                <PaymentVoucherView check={check} printerUser={session?.user} />
            </div>
        </DashboardLayout>
    )
}
