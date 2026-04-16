import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPayroll } from "@/lib/payroll"
import { Role } from "@prisma/client"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const payrolls = await prisma.payroll.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                creadoPor: {
                    select: { nombre: true, apellido: true }
                }
            }
        })

        return NextResponse.json({ data: payrolls })
    } catch (error) {
        console.error("[PAYROLL_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session?.user?.role !== Role.Admin && session?.user?.role !== Role.DirectoraRRHH && session?.user?.role !== Role.ContadorGeneral)) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const body = await req.json()
        const payroll = await createPayroll(body, session.user.id)

        return NextResponse.json(payroll, { status: 201 })
    } catch (error: any) {
        console.error("[PAYROLL_POST]", error)
        if (error.message?.includes("No se puede generar la nómina")) {
            return new NextResponse(error.message, { status: 400 })
        }
        return new NextResponse("Internal Error", { status: 500 })
    }
}
