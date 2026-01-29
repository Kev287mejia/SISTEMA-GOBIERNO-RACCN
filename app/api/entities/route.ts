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

        const entities = await prisma.entity.findMany({
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(entities)
    } catch (error: any) {
        console.error("Error fetching entities:", error)
        return NextResponse.json({ error: "Error al obtener entidades" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const body = await request.json()
        const { nombre, ruc, tipo, direccion, telefono, email, contacto } = body

        if (!nombre) {
            return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
        }

        const newEntity = await prisma.entity.create({
            data: {
                nombre,
                ruc,
                tipo,
                direccion,
                telefono,
                email,
                contacto,
                activo: true
            }
        })

        return NextResponse.json(newEntity, { status: 201 })
    } catch (error: any) {
        console.error("Error creating entity:", error)
        return NextResponse.json({ error: "Error al crear entidad" }, { status: 500 })
    }
}
