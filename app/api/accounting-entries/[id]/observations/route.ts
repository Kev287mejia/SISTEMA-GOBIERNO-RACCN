import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { AuditAction } from "@prisma/client"
import { getRoleDisplayName } from "@/lib/rbac"

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const id = params.id

        const observations = await prisma.accountingObservation.findMany({
            where: { asientoContableId: id },
            include: {
                creadoPor: {
                    select: { nombre: true, apellido: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json({ data: observations })
    } catch (error: any) {
        return NextResponse.json({ error: "Error al obtener observaciones" }, { status: 500 })
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        const allowedRoles = ["CoordinadorGobierno", "DirectoraDAF"]
        if (!session?.user || !allowedRoles.includes(session?.user?.role)) {
            return NextResponse.json({ error: "No tiene permisos para agregar observaciones" }, { status: 403 })
        }

        const { id } = params
        const body = await request.json()
        const { observacion, tipo } = body

        if (!observacion) {
            return NextResponse.json({ error: "La observación es requerida" }, { status: 400 })
        }

        const result = await prisma.$transaction(async (tx) => {
            const observation = await tx.accountingObservation.create({
                data: {
                    asientoContableId: id,
                    observacion,
                    tipo: tipo || "COMENTARIO",
                    creadoPorId: session.user.id
                }
            })

            // Add to audit log
            await createAuditLog({
                accion: (AuditAction as any).CREATE,
                entidad: "AccountingObservation",
                entidadId: observation.id,
                descripcion: `${getRoleDisplayName(session?.user?.role)} agregó observación al asiento ${id}: ${observacion.substring(0, 50)}...`,
                datosNuevos: observation,
            })

            return observation
        })

        return NextResponse.json({ data: result }, { status: 201 })
    } catch (error: any) {
        console.error("Error creating observation:", error)
        return NextResponse.json({ error: "Error al crear observación" }, { status: 500 })
    }
}
