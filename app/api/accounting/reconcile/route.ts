import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function PATCH(
    request: Request
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const allowedRoles: Role[] = [
            Role.Admin,
            Role.ContadorGeneral,
            Role.ResponsableContabilidad
        ]

        if (!allowedRoles.includes(session?.user?.role as Role)) {
            return NextResponse.json({ error: "Prohibido" }, { status: 403 })
        }

        const body = await request.json()
        const { checkId, isReconciled } = body

        if (!checkId) {
            return NextResponse.json({ error: "Falta checkId" }, { status: 400 })
        }

        // Update with Raw SQL fallback support
        let updatedCheck;
        try {
            updatedCheck = await prisma.check.update({
                where: { id: checkId },
                data: {
                    conciliado: isReconciled,
                    fechaConciliacion: isReconciled ? new Date() : null
                }
            })
        } catch (modelError) {
            // Fallback
            await prisma.$executeRawUnsafe(
                `UPDATE checks SET conciliado = $1, "fechaConciliacion" = $2 WHERE id = $3`,
                isReconciled,
                isReconciled ? new Date() : null,
                checkId
            )
            updatedCheck = { id: checkId, conciliado: isReconciled }
        }

        // Audit Log? Maybe excessive for every check toggle, but good for tracking.
        // Let's Skip for speed unless critical. Reconcilation is usually bulk work.

        return NextResponse.json({ success: true, check: updatedCheck })

    } catch (error) {
        console.error("Error reconiciling check:", error)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
