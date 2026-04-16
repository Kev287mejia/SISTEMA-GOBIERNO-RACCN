import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AuditAction } from "@prisma/client"

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const allowedRoles = ["Admin", "ContadorGeneral", "Auditor", "ResponsableContabilidad"]
        if (!allowedRoles.includes(session?.user?.role)) {
            return NextResponse.json({ error: "Permisos insuficientes para realizar arqueos" }, { status: 403 })
        }

        const body = await request.json()
        const { boxId, expected, counted, observations } = body

        if (!boxId || expected === undefined || counted === undefined) {
            return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
        }

        const difference = parseFloat(counted) - parseFloat(expected)

        // Crear el registro de Auditoría de Caja
        const audit = await prisma.pettyCashAudit.create({
            data: {
                pettyCashId: boxId,
                auditorId: session.user.id,
                expectedBalance: parseFloat(expected),
                countedBalance: parseFloat(counted),
                difference: difference,
                observations: observations || ""
            }
        })

        // También registrar en el Log General de Auditoría del Sistema
        await prisma.auditLog.create({
            data: {
                accion: AuditAction.ARQUEO_CAJA_CHICA,
                entidad: "PettyCash",
                entidadId: boxId,
                descripcion: `Arqueo realizado. Sistema: ${expected}, Físico: ${counted}, Dif: ${difference}`,
                usuarioId: session.user.id,
                datosNuevos: { auditId: audit.id, difference, observations }
            }
        })

        // Si hay una diferencia significativa, se podría cambiar el estado de la caja o notificar
        // Por ahora solo guardamos el registro

        return NextResponse.json(audit)
    } catch (error) {
        console.error("Error creating audit:", error)
        return NextResponse.json({ error: "Error interno al guardar arqueo" }, { status: 500 })
    }
}
