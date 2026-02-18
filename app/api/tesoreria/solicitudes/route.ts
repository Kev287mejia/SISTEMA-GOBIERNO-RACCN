
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')

        const checks = await prisma.check.findMany({
            where: status ? { estado: status as any } : {},
            orderBy: { fecha: 'desc' },
            include: {
                purchaseOrder: {
                    select: {
                        numero: true,
                        proveedor: { select: { nombre: true, ruc: true } },
                        budgetItem: { select: { codigo: true, nombre: true } }
                    }
                },
                entity: { select: { nombre: true } } // Provider/Beneficiary
            }
        })

        return NextResponse.json({ data: checks })

    } catch (error: any) {
        console.error("Error fetching check requests:", error)
        return NextResponse.json(
            { error: error.message || "Error al obtener solicitudes" },
            { status: 500 }
        )
    }
}
