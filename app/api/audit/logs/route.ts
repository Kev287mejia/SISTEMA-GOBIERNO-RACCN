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

        // Only admins and auditors can view audit logs
        const allowedRoles = [
            "Admin", "Auditor", "ContadorGeneral",
            "CoordinadorGobierno", "ResponsableContabilidad"
        ]
        if (!allowedRoles.includes(session?.user?.role as any)) {
            return NextResponse.json({ error: "No tiene permisos para ver logs de auditoría" }, { status: 403 })
        }

        const searchParams = request.nextUrl.searchParams
        const entidad = searchParams.get("entidad")
        const accion = searchParams.get("accion")
        const usuarioId = searchParams.get("usuarioId")
        const startDate = searchParams.get("startDate")
        const endDate = searchParams.get("endDate")
        const limit = parseInt(searchParams.get("limit") || "100")

        const where: any = {}

        if (entidad) where.entidad = entidad
        if (accion) where.accion = accion
        if (usuarioId) where.usuarioId = usuarioId
        if (startDate || endDate) {
            where.fecha = {}
            if (startDate) where.fecha.gte = new Date(startDate)
            if (endDate) {
                // Ensure we cover the full end day
                const end = new Date(endDate)
                end.setHours(23, 59, 59, 999)
                where.fecha.lte = end
            }
        }

        const logs = await prisma.auditLog.findMany({
            where,
            include: {
                usuario: {
                    select: {
                        nombre: true,
                        apellido: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: { fecha: 'desc' },
            take: limit
        })

        const totalCount = await prisma.auditLog.count({ where })

        // Get statistics
        const stats = await prisma.auditLog.groupBy({
            by: ['accion'],
            _count: true,
            where: startDate || endDate ? {
                fecha: {
                    ...(startDate && { gte: new Date(startDate) }),
                    ...(endDate && { lte: new Date(endDate) })
                }
            } : undefined
        })

        return NextResponse.json({
            logs,
            totalCount,
            stats: stats.map(s => ({ accion: s.accion, count: s._count }))
        })

    } catch (error) {
        console.error("[AUDIT_LOGS] Error:", error)
        return NextResponse.json({ error: "Error al obtener logs de auditoría" }, { status: 500 })
    }
}

