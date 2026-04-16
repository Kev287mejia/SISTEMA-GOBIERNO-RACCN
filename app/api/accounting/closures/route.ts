import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { auditCreate } from "@/lib/audit"
import { ClosureStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const closures = await prisma.accountingClosure.findMany({
            orderBy: [
                { anio: 'desc' },
                { mes: 'desc' }
            ],
            include: {
                usuario: {
                    select: { nombre: true, apellido: true }
                }
            }
        })

        return NextResponse.json(closures)
    } catch (error) {
        return NextResponse.json({ error: "Error al obtener cierres" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        // Only Admin, Auditor or ContadorGeneral can close periods
        const authorizedRoles = ["Admin", "Auditor", "ContadorGeneral", "ResponsableContabilidad"]
        if (!session?.user || !authorizedRoles.includes(session?.user?.role)) {
            return NextResponse.json({ error: "No tiene permisos para cerrar periodos" }, { status: 403 })
        }

        const body = await request.json()
        const { mes, anio, notas } = body
        console.log("DEBUG_CLOSURE_REQUEST:", { mes, anio, notas, userId: session.user.id })

        if (mes === undefined || anio === undefined) {
            return NextResponse.json({ error: "Mes y año son requeridos" }, { status: 400 })
        }

        const closure = await prisma.accountingClosure.create({
            data: {
                mes: parseInt(mes),
                anio: parseInt(anio),
                notas,
                usuarioId: session.user.id,
                estado: ClosureStatus.CERRADO
            }
        })

        await auditCreate(
            "AccountingClosure",
            closure.id,
            `Cierre mensual oficial: ${mes}/${anio}`,
            closure
        )

        return NextResponse.json(closure, { status: 201 })
    } catch (error: any) {
        console.error("DEBUG_CLOSURE_ERROR:", error)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Este periodo ya ha sido cerrado previamente." }, { status: 400 })
        }
        return NextResponse.json({
            error: "Error al procesar el cierre mensual",
            details: error.message,
            code: error.code
        }, { status: 500 })
    }
}
