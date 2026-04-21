import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (false && !session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        // Solo Admin, ContadorGeneral y RRHH pueden ver usuarios
        const allowedRoles = ["Admin", "ContadorGeneral", "RRHH", "DirectoraRRHH", "ResponsableContabilidad"]
        if (!allowedRoles.includes(session?.user?.role)) {
            return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
        }

        const users = await prisma.user.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                email: true,
                nombre: true,
                apellido: true,
                cedula: true,
                cargo: true,
                departamento: true,
                role: true,
                deniedModules: true,
                activo: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ users })
    } catch (error: any) {
        console.error("Error fetching users DETAILS:", error)
        return NextResponse.json(
            { error: `Error detallado: ${error.message || error}` },
            { status: 500 }
        )
    }
}
