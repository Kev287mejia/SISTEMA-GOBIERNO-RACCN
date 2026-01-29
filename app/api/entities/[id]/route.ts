import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const entity = await prisma.entity.findUnique({
            where: { id: params.id }
        })

        if (!entity) {
            return NextResponse.json({ error: "Entidad no encontrada" }, { status: 404 })
        }

        return NextResponse.json(entity)
    } catch (error: any) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const body = await request.json()
        const updatedEntity = await prisma.entity.update({
            where: { id: params.id },
            data: body
        })

        return NextResponse.json(updatedEntity)
    } catch (error: any) {
        console.error("Error updating entity:", error)
        return NextResponse.json({
            error: error.message || "Error al actualizar",
            details: error.meta
        }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        await prisma.entity.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: "Eliminado exitosamente" })
    } catch (error: any) {
        console.error("Error deleting entity:", error)
        return NextResponse.json({ error: "Error al eliminar" }, { status: 500 })
    }
}
