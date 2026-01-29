import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Get all petty cash boxes
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const pettyCashes = await (prisma as any).pettyCash.findMany({
            include: {
                usuario: {
                    select: { nombre: true, apellido: true }
                }
            },
            orderBy: { nombre: 'asc' }
        })

        return NextResponse.json(pettyCashes)
    } catch (error: any) {
        console.error("Error fetching petty cashes:", error)
        return NextResponse.json({ error: "Error al obtener cajas chicas" }, { status: 500 })
    }
}

// Create a new petty cash box (Opening Balance registration)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        if ((session.user.role as any) !== "Admin" && (session.user.role as any) !== "ResponsableCredito") {
            return NextResponse.json({ error: "No tiene permisos para crear cajas chicas" }, { status: 403 })
        }

        const body = await request.json()
        const { nombre, montoInicial, institution } = body

        if (!nombre || !montoInicial) {
            return NextResponse.json({ error: "Nombre y monto inicial son requeridos" }, { status: 400 })
        }

        const pettyCash = await (prisma as any).pettyCash.create({
            data: {
                nombre,
                montoInicial: Number(montoInicial),
                montoActual: Number(montoInicial),
                institution: institution || "GOBIERNO",
                usuarioId: session.user.id
            }
        })

        // Log Audit
        await prisma.auditLog.create({
            data: {
                accion: 'CREATE',
                entidad: 'PettyCash',
                entidadId: pettyCash.id,
                descripcion: `${session.user.name} registró apertura de caja chica: ${nombre} con monto inicial ${montoInicial}`,
                usuarioId: session.user.id,
                datosNuevos: pettyCash as any
            }
        })

        return NextResponse.json(pettyCash)
    } catch (error: any) {
        console.error("Error creating petty cash:", error)
        return NextResponse.json({ error: "Error al registrar apertura de caja chica" }, { status: 500 })
    }
}
