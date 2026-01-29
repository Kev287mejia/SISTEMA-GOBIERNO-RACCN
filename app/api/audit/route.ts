import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        // Only Admin and Auditor can view logs
        if (!session || (session.user.role !== Role.Admin && session.user.role !== Role.Auditor)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get("limit") || "50")
        const offset = parseInt(searchParams.get("offset") || "0")
        const entity = searchParams.get("entity")
        const action = searchParams.get("action")
        const userId = searchParams.get("userId")

        const where: any = {}
        if (entity) where.entidad = entity
        if (action) where.accion = action
        if (userId) where.usuarioId = userId

        const [logs, total] = await prisma.$transaction([
            prisma.auditLog.findMany({
                where,
                take: limit,
                skip: offset,
                orderBy: { fecha: 'desc' },
                include: {
                    usuario: {
                        select: {
                            nombre: true,
                            apellido: true,
                            email: true,
                            role: true
                        }
                    }
                }
            }),
            prisma.auditLog.count({ where })
        ])

        return NextResponse.json({
            data: logs,
            pagination: {
                total,
                limit,
                offset,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { accion, entidad, entidadId, descripcion, datosAnteriores, datosNuevos } = body

        if (!accion || !entidad || !descripcion) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        const log = await prisma.auditLog.create({
            data: {
                accion,
                entidad,
                entidadId: entidadId || "N/A",
                descripcion,
                datosAnteriores,
                datosNuevos,
                usuarioId: session.user.id
            }
        })

        return NextResponse.json(log)
    } catch (error) {
        console.error("[AUDIT_LOG_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
