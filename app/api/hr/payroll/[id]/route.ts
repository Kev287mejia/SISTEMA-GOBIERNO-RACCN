import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const payroll = await prisma.payroll.findUnique({
            where: { id: params.id },
            include: {
                creadoPor: {
                    select: { nombre: true, apellido: true, email: true }
                },
                items: {
                    include: {
                        empleado: {
                            select: {
                                nombre: true,
                                apellido: true,
                                cedula: true,
                                contratos: {
                                    where: { estado: "ACTIVO" },
                                    include: { cargo: true },
                                    take: 1
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!payroll) {
            return new NextResponse("Not Found", { status: 404 })
        }

        return NextResponse.json({ data: payroll })
    } catch (error) {
        console.error("[PAYROLL_ID_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
