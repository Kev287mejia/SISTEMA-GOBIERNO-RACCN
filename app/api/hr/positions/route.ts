import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user.role !== Role.Admin && session.user.role !== Role.RRHH && session.user.role !== Role.ContadorGeneral)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const positions = await prisma.position.findMany({
            where: {
                activo: true
            },
            orderBy: { titulo: 'asc' }
        })

        return NextResponse.json(positions)
    } catch (error) {
        console.error("[POSITIONS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user.role !== Role.Admin && session.user.role !== Role.RRHH)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { titulo, departamento, descripcion, salarioMin, salarioMax } = body

        if (!titulo || !departamento) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        const position = await prisma.position.create({
            data: {
                titulo,
                departamento,
                descripcion,
                salarioMin,
                salarioMax,
            }
        })

        // Audit log
        await prisma.auditLog.create({
            data: {
                accion: 'CREATE',
                entidad: 'Position',
                entidadId: position.id,
                descripcion: `Created position ${position.titulo}`,
                datosNuevos: JSON.parse(JSON.stringify(position)),
                usuarioId: session.user.id
            }
        })

        return NextResponse.json(position)
    } catch (error) {
        console.error("[POSITIONS_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
