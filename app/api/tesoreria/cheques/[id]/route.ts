
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { id } = params
        const { estado, banco, cuentaBancaria, chequeEntregado, referencia } = body

        // Prepare data update
        const data: any = {}
        if (estado) data.estado = estado
        if (banco) data.banco = banco
        if (cuentaBancaria) data.cuentaBancaria = cuentaBancaria
        if (chequeEntregado !== undefined) data.chequeEntregado = chequeEntregado
        if (referencia) data.referencia = referencia

        const check = await prisma.check.update({
            where: { id },
            data
        })

        return NextResponse.json({
            success: true,
            message: "Cheque actualizado correctamente",
            data: check
        })

    } catch (error: any) {
        console.error("Error updating check:", error)
        return NextResponse.json(
            { error: error.message || "Error al actualizar cheque" },
            { status: 500 }
        )
    }
}
