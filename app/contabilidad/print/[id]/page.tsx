import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { EntryPrintView } from "@/components/accounting/entry-print-view"

export default async function PrintEntryPage({ params }: { params: { id: string } }) {
    const entry = await prisma.accountingEntry.findUnique({
        where: { id: params.id },
        include: {
            creadoPor: true,
            aprobadoPor: true,
        }
    })

    if (!entry) return notFound()

    return <EntryPrintView entry={entry} />
}
