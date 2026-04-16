export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ReconciliationPrintView } from "@/components/accounting/reconciliation-print-view"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function ReconciliationPrintPage({ params }: { params: { id: string } }) {
    const reconciliation = await prisma.bankReconciliation.findUnique({
        where: { id: params.id },
        include: {
            bankAccount: true,
            user: true,
        }
    })

    if (!reconciliation) return notFound()

    const session = (await getServerSession(authOptions)) || { user: { id: "demo", name: "Demo User", role: "Admin", nombre: "Julio", email: "demo@example.com" } }

    return <ReconciliationPrintView reconciliation={reconciliation} printerUser={session?.user} />
}
