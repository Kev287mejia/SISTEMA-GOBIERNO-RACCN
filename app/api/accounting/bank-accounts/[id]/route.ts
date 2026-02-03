import { NextResponse, NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role, AuditAction } from "@prisma/client"

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const { id } = params
        const account = await prisma.bankAccount.findUnique({
            where: { id }
        })

        if (!account) {
            return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 })
        }

        return NextResponse.json(account)
    } catch (error) {
        console.error("Error fetching bank account:", error)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const currentRole = session.user.role as Role
        console.log(`[PATCH BankAccount] User: ${session.user.email}, Role: ${currentRole}`)

        const allowedRoles: Role[] = [Role.Admin, Role.ResponsableContabilidad, Role.DirectoraDAF, Role.ContadorGeneral]

        if (!allowedRoles.includes(currentRole)) {
            console.log(`[PATCH BankAccount] DENIED. Role ${currentRole} not in ${allowedRoles.join(', ')}`)
            return NextResponse.json({ error: "No tiene permisos para activar cuentas" }, { status: 403 })
        }

        const { id } = params
        const body = await request.json()

        // Validate action
        if (body.action === "ACTIVATE") {
            const account = await prisma.bankAccount.update({
                where: { id },
                data: {
                    status: "ACTIVE",
                    isActive: true
                }
            })

            // Audit
            await prisma.auditLog.create({
                data: {
                    accion: "UPDATE",
                    entidad: "BankAccount",
                    entidadId: id,
                    descripcion: `Activación de cuenta bancaria (ID: ${id})`,
                    usuarioId: session.user.id,
                    datosNuevos: { status: "ACTIVE", isActive: true }
                }
            })

            return NextResponse.json(account)
        }

        if (body.action === "DEACTIVATE") {
            const account = await prisma.bankAccount.update({
                where: { id },
                data: {
                    status: "INACTIVE",
                    isActive: false
                }
            })

            await prisma.auditLog.create({
                data: {
                    accion: "UPDATE",
                    entidad: "BankAccount",
                    entidadId: id,
                    descripcion: `Desactivación de cuenta bancaria (ID: ${id})`,
                    usuarioId: session.user.id,
                    datosNuevos: { status: "INACTIVE", isActive: false }
                }
            })

            return NextResponse.json(account)
        }

        return NextResponse.json({ error: "Acción no válida" }, { status: 400 })

    } catch (error) {
        console.error("Error updating bank account:", error)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
