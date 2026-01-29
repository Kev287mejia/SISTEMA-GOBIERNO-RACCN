import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const providers = await prisma.entity.findMany({
            where: {
                tipo: 'PROVEEDOR',
                activo: true
            },
            orderBy: { nombre: 'asc' }
        })
        return NextResponse.json(providers)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        const body = await req.json()
        const { nombre, ruc, email, telefono, direccion } = body

        if (!nombre) return new NextResponse("Nombre es requerido", { status: 400 })

        const provider = await prisma.entity.create({
            data: {
                nombre,
                ruc,
                email,
                telefono,
                direccion,
                tipo: 'PROVEEDOR'
            }
        })

        return NextResponse.json(provider)
    } catch (error) {
        console.error("[PROVIDERS_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
