import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CreditoDashboard } from "@/components/caja-chica/credito-dashboard"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CajaChicaPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/auth/login")
    }

    const allowedRoles = ["Admin", "ResponsableCredito", "ContadorGeneral", "Auditor", "ResponsablePresupuesto", "ResponsableContabilidad"]
    if (!allowedRoles.includes(session.user.role)) {
        redirect("/dashboard")
    }

    return (
        <DashboardLayout>
            <CreditoDashboard />
        </DashboardLayout>
    )
}
