export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ReportContent } from "./report-content"

export default async function ReportPreviewPage({ searchParams }: { searchParams: { startDate: string, endDate: string, boxId: string } }) {
    const session = (await getServerSession(authOptions)) || { user: { id: "demo", name: "Demo User", role: "Admin", nombre: "Julio", email: "demo@example.com" } }
    if (false && !session) redirect("/auth/login")

    const { startDate, endDate, boxId } = searchParams

    // Fetch data logic (same as before)
    let whereClause: any = {
        fecha: {
            gte: new Date(startDate),
            lte: new Date(new Date(endDate).setHours(23, 59, 59))
        }
    }

    if (boxId !== "all") {
        whereClause.pettyCashId = boxId
    }

    const box = boxId !== "all"
        ? await prisma.pettyCash.findUnique({ where: { id: boxId }, include: { usuario: true } })
        : null

    const movements = await prisma.pettyCashMovement.findMany({
        where: whereClause,
        orderBy: { fecha: 'asc' },
        include: { usuario: true }
    })

    const totalIngresos = movements
        .filter(m => m.tipo === 'INGRESO' || m.tipo === 'AJUSTE')
        .reduce((acc, curr) => acc + Number(curr.monto), 0)

    const totalEgresos = movements
        .filter(m => m.tipo === 'EGRESO')
        .reduce((acc, curr) => acc + Number(curr.monto), 0)

    return (
        <ReportContent
            startDate={startDate}
            endDate={endDate}
            box={box}
            movements={movements}
            totalIngresos={totalIngresos}
            totalEgresos={totalEgresos}
        />
    )
}
