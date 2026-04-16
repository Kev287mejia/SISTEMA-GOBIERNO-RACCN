import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const allowedRoles = ["Admin", "ResponsableCredito", "ContadorGeneral", "Auditor", "ResponsableContabilidad"]
        if (!allowedRoles.includes(session?.user?.role as any)) {
            return NextResponse.json({ error: "No tiene permisos para ver estas estadísticas" }, { status: 403 })
        }

        const [pettyCashes, totalBalance, inconsistenciesCount] = await Promise.all([
            (prisma as any).pettyCash.findMany({
                include: {
                    _count: {
                        select: { movements: { where: { estado: 'PENDIENTE_VALIDACION' } } }
                    }
                }
            }),
            (prisma as any).pettyCash.aggregate({
                _sum: { montoActual: true }
            }),
            (prisma as any).pettyCashMovement.count({
                where: { inconsistente: true }
            })
        ])

        const stats = {
            totalBoxes: pettyCashes.length,
            totalBalance: Number(totalBalance._sum.montoActual || 0),
            inconsistencies: inconsistenciesCount,
            boxes: pettyCashes.map((pc: any) => ({
                id: pc.id,
                nombre: pc.nombre,
                montoActual: Number(pc.montoActual),
                estado: pc.estado,
                pendingValidations: pc._count.movements
            }))
        }

        return NextResponse.json(stats)
    } catch (error: any) {
        console.error("Error fetching petty cash statistics:", error)
        return NextResponse.json({ error: "Error al obtener estadísticas de caja chica" }, { status: 500 })
    }
}
