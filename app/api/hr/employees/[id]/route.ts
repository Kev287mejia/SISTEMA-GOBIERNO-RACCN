import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user.role !== Role.Admin && session.user.role !== Role.RRHH)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const employee = await prisma.employee.findUnique({
            where: { id: params.id },
            include: {
                contratos: {
                    include: { cargo: true },
                    orderBy: { fechaInicio: 'desc' }
                },
                hrRecords: {
                    orderBy: { fecha: 'desc' }
                }
            }
        })

        if (!employee) {
            return new NextResponse("Employee not found", { status: 404 })
        }

        return NextResponse.json(employee)
    } catch (error) {
        console.error("[EMPLOYEE_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user.role !== Role.Admin && session.user.role !== Role.RRHH)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { nombre, apellido, email, telefono, direccion, estado } = body

        const currentEmployee = await prisma.employee.findUnique({
            where: { id: params.id }
        })

        if (!currentEmployee) {
            return new NextResponse("Employee not found", { status: 404 })
        }

        const updatedEmployee = await prisma.employee.update({
            where: { id: params.id },
            data: {
                nombre,
                apellido,
                email,
                telefono,
                direccion,
                estado
            }
        })

        // Audit log
        await prisma.auditLog.create({
            data: {
                accion: 'UPDATE',
                entidad: 'Employee',
                entidadId: updatedEmployee.id,
                descripcion: `Updated employee ${updatedEmployee.nombre} ${updatedEmployee.apellido}`,
                datosAnteriores: JSON.parse(JSON.stringify(currentEmployee)),
                datosNuevos: JSON.parse(JSON.stringify(updatedEmployee)),
                usuarioId: session.user.id
            }
        })

        return NextResponse.json(updatedEmployee)
    } catch (error) {
        console.error("[EMPLOYEE_PUT]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
