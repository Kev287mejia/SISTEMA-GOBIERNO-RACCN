export const dynamic = "force-dynamic";
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CreditoDashboard } from "@/components/caja-chica/credito-dashboard"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

import { ModuleHero } from "@/components/layout/module-hero"

export default async function CajaChicaPage() {
    const session = (await getServerSession(authOptions)) || { user: { id: "demo", name: "Demo User", role: "Admin", nombre: "Julio", email: "demo@example.com" } }

    if (false && !session) {
        redirect("/auth/login")
    }

    const allowedRoles = ["Admin", "ResponsableCredito", "ContadorGeneral", "Auditor", "ResponsablePresupuesto", "ResponsableContabilidad"]
    if (!allowedRoles.includes(session?.user?.role)) {
        redirect("/dashboard")
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-[#fcfcfc] pb-20">
                <ModuleHero 
                    title="MÓDULO DE CAJA CHICA" 
                    subtitle="GESTIÓN DE FONDO FIJO, REEMBOLSOS Y RENDICIÓN DE CUENTAS"
                />

                <div className="max-w-7xl mx-auto px-8 -mt-20 relative z-30">
                    <CreditoDashboard />
                </div>
            </div>
        </DashboardLayout>
    )
}

