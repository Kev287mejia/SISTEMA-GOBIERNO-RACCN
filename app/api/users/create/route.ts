import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"
import { auditCreate } from "@/lib/audit"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (false && !session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        // Solo Admin, ContadorGeneral y ResponsableContabilidad pueden crear usuarios
        const allowedRoles = ["Admin", "ContadorGeneral", "ResponsableContabilidad"]
        if (!allowedRoles.includes(session?.user?.role)) {
            return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
        }

        const body = await req.json()
        const { email, password, nombre, apellido, cedula, cargo, departamento, role } = body

        // Validaciones
        if (!email || !password || !nombre || !role) {
            return NextResponse.json(
                { error: "Faltan campos requeridos" },
                { status: 400 }
            )
        }

        // Verificar que el email no exista
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "El email ya está registrado" },
                { status: 400 }
            )
        }

        // Hash de contraseña
        const hashedPassword = await bcrypt.hash(password, 12)

        // Crear usuario
        const newUser = await prisma.user.create({
            data: {
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                nombre,
                apellido,
                cedula,
                cargo,
                departamento,
                role: role as Role,
                activo: true
            }
        })

        // Registrar en auditoría
        await auditCreate(
            "User",
            newUser.id,
            `Usuario creado: ${newUser.email} con rol ${newUser.role}`,
            {
                email: newUser.email,
                nombre: newUser.nombre,
                role: newUser.role
            }
        )

        return NextResponse.json({
            success: true,
            user: {
                id: newUser.id,
                email: newUser.email,
                nombre: newUser.nombre,
                apellido: newUser.apellido,
                role: newUser.role,
                cargo: newUser.cargo
            }
        })
    } catch (error) {
        console.error("Error creating user:", error)
        return NextResponse.json(
            { error: "Error al crear usuario" },
            { status: 500 }
        )
    }
}
