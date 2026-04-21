import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (false && !session) return new NextResponse("Unauthorized", { status: 401 })

        const { searchParams } = new URL(req.url)
        const estado = searchParams.get("estado")
        const banco = searchParams.get("banco")

        const checks = await prisma.check.findMany({
            where: {
                ...(estado && { estado: estado as any }),
                ...(banco && { banco }),
            },
            include: {
                accountingEntry: true,
                usuario: {
                    select: { nombre: true, apellido: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(checks)
    } catch (error) {
        console.error("[CHECKS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (false && !session) return new NextResponse("Unauthorized", { status: 401 })

        const body = await req.json()
        const {
            numero,
            banco,
            cuentaBancaria,
            beneficiario,
            monto,
            fecha,
            accountingEntryId,
            tipo
        } = body

        // Verify accounting entry if provided
        if (accountingEntryId) {
            const existingCheck = await prisma.check.findUnique({
                where: { accountingEntryId }
            })
            if (existingCheck) {
                return NextResponse.json({ error: "Ya existe un cheque vinculado a este asiento." }, { status: 400 })
            }
        }

        const check = await prisma.check.create({
            data: {
                numero,
                banco,
                cuentaBancaria,
                beneficiario,
                monto,
                fecha: new Date(fecha),
                tipo: tipo || "EMITIDO",
                accountingEntryId,
                usuarioId: (session.user as any).id,
                estado: "PENDIENTE_VALIDACION"
            }
        })

        return NextResponse.json(check)
    } catch (error: any) {
        console.error("[CHECKS_POST]", error)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "El número de cheque ya existe." }, { status: 400 })
        }
        return new NextResponse("Internal Error", { status: 500 })
    }
}
