
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Role, EntryStatus } from "@prisma/client"
import { createAuditLog } from "@/lib/audit"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Only Coordinators, DAF, or specific roles should approve
        // Assuming strict rule: Only CoordinadorGobierno or DirectoraDAF or ResponsableContabilidad (maybe) can approve
        const allowedRoles: Role[] = [Role.CoordinadorGobierno, Role.DirectoraDAF, Role.ResponsableContabilidad, Role.Admin]
        if (!allowedRoles.includes(session.user.role as Role)) {
            return new NextResponse("Forbidden: Insufficient privileges", { status: 403 })
        }

        const body = await req.json()
        const { ids } = body

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return new NextResponse("Invalid request: No IDs provided", { status: 400 })
        }

        // Transactional update
        const approvals = await prisma.$transaction(async (tx) => {
            const results = []

            for (const id of ids) {
                // Check if exists and not already approved
                const entry = await tx.accountingEntry.findUnique({
                    where: { id }
                })

                if (!entry) continue
                if (entry.estado === EntryStatus.APROBADO) continue

                const updated = await tx.accountingEntry.update({
                    where: { id },
                    data: {
                        estado: EntryStatus.APROBADO,
                        aprobadoPorId: session.user.id,
                        updatedAt: new Date()
                    }
                })

                // Create Audit Log (using our unified helper)
                await createAuditLog({
                    usuarioId: session.user.id,
                    accion: "UPDATE",
                    entidad: "AccountingEntry",
                    entidadId: id,
                    descripcion: `Aprobación por Lote (Batch) de Asiento ${entry.numero}`,
                    datosNuevos: { estado: "APROBADO", batchAction: true }
                })

                results.push(updated)
            }
            return results
        })

        return NextResponse.json({
            success: true,
            count: approvals.length,
            message: `Se han aprobado correctamente ${approvals.length} asientos.`
        })

    } catch (error) {
        console.error("[BATCH_APPROVE_ERROR]", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
