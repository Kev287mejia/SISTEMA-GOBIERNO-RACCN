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

        const [resolved, pending, critical] = await Promise.all([
            prisma.accountingObservation.count({ where: { estado: 'RESUELTA' } }),
            prisma.accountingObservation.count({ where: { estado: 'PENDIENTE' } }),
            prisma.accountingObservation.count({ where: { estado: 'PENDIENTE', tipo: 'URGENTE' } })
        ])

        return NextResponse.json({
            resolved,
            pending,
            critical
        })
    } catch (error: any) {
        console.error("Error fetching observations summary:", error)
        return NextResponse.json({ error: "Error al obtener resumen de observaciones" }, { status: 500 })
    }
}
