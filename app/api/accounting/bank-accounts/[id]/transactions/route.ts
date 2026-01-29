import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TransactionType } from "@prisma/client"

export async function POST(
    request: Request, // NextRequest also works but Request is standard
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const body = await request.json()
        const { type, amount, description, reference, date } = body
        const { id } = params // BankAccount ID

        if (!amount || !description || !type) {
            return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
        }

        // Create transaction
        // Since we are using an Enum for Type, ensure body.type matches
        const transaction = await prisma.bankTransaction.create({
            data: {
                bankAccountId: id,
                type: type as TransactionType,
                amount: Number(amount),
                description,
                reference,
                date: date ? new Date(date) : new Date(),
                createdBy: session.user.id
            }
        })

        // Audit? Maybe later. The transaction itself is a record.

        return NextResponse.json(transaction)

    } catch (error) {
        console.error("Error creating bank transaction:", error)
        return NextResponse.json({ error: "Error al registrar movimiento" }, { status: 500 })
    }
}
