import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (false && !session) return new NextResponse("Unauthorized", { status: 401 })

        const check = await prisma.check.findUnique({
            where: { id: params.id },
            include: {
                accountingEntry: true,
                usuario: {
                    select: { nombre: true, apellido: true }
                }
            }
        })

        if (!check) return new NextResponse("Not Found", { status: 404 })

        return NextResponse.json(check)
    } catch (error) {
        console.error("[CHECK_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (false && !session) return new NextResponse("Unauthorized", { status: 401 })

        const body = await req.json()
        const { estado } = body

        const check = await prisma.check.update({
            where: { id: params.id },
            data: {
                estado,
                ...(estado === "PAGADO" ? { paidAt: new Date(), paidById: (session.user as any).id } : {}),
                ...(estado === "APROBADO_CONTABILIDAD" ? { accountedAt: new Date(), accountedById: (session.user as any).id } : {}),
            }
        })

        return NextResponse.json(check)
    } catch (error) {
        console.error("[CHECK_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
