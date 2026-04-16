import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session?.user?.role !== Role.Admin && session?.user?.role !== Role.RRHH && session?.user?.role !== Role.ContadorGeneral && session?.user?.role !== Role.DirectoraRRHH)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { empleadoId, tipo, fechaInicio, fechaFin, motivo, conGoceSueldo } = body

        if (!empleadoId || !fechaInicio || !fechaFin) {
            return new NextResponse("Faltan datos obligatorios (Empleado o Fechas)", { status: 400 })
        }

        // Calcular días
        const start = new Date(fechaInicio)
        const end = new Date(fechaFin)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

        // Lógica de goce de sueldo automática si no se especifica
        // Vacaciones y Maternidad siempre pagado
        // Enfermedad pagado (suele ser subsidio INSS, aquí asumiremos empresa paga 100% o completa)
        // Permiso Personal -> Usuario decide. Por defecto False si es > 1 día? Mejor dejar que frontend envíe.

        const isPaid = conGoceSueldo !== undefined ? conGoceSueldo : (tipo !== 'PERMISO_PERSONAL')

        const request = await prisma.leaveRequest.create({
            data: {
                empleadoId,
                tipo,
                fechaInicio: start,
                fechaFin: end,
                dias,
                motivo,
                estado: 'APROBADO', // Auto-aprobar si lo ingresa RRHH directamente como registro histórico
                aprobadoPorId: session.user.id,
                conGoceSueldo: isPaid,
                fechaAprobacion: new Date()
            }
        })

        return NextResponse.json(request)
    } catch (error: any) {
        console.error("Error creating leave request:", error)
        return new NextResponse(error.message || "Internal Error", { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        const leaves = await prisma.leaveRequest.findMany({
            include: {
                empleado: {
                    select: { nombre: true, apellido: true, cedula: true }
                }
            },
            orderBy: { fechaInicio: 'desc' }
        })
        return NextResponse.json(leaves)
    } catch (error) {
        console.error("Error fetching leaves:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
