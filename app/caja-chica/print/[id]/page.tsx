export const dynamic = "force-dynamic";
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PettyCashPrintView } from "@/components/caja-chica/petty-cash-print-view"

export default async function PrintPettyCashPage({ params }: { params: { id: string } }) {
    const movement = await (prisma as any).pettyCashMovement.findUnique({
        where: { id: params.id },
        include: {
            usuario: {
                select: { nombre: true, apellido: true, cargo: true }
            },
            pettyCash: {
                select: { nombre: true, institution: true }
            }
        }
    })

    if (!movement) {
        notFound()
    }

    return <PettyCashPrintView movement={movement} />
}
