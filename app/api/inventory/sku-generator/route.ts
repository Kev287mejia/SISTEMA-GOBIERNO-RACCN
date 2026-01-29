import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const category = searchParams.get('category')

        if (!category) {
            return NextResponse.json({ error: "Categoría es requerida" }, { status: 400 })
        }

        // 1. Generate prefix: First 3 letters of category, uppercase, clean of special chars
        const cleanCategory = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        const prefix = cleanCategory.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "X")

        // 2. Find last item with this prefix to determine sequence
        // We look for codes starting with "PRE-"
        const lastItems = await prisma.inventoryItem.findMany({
            where: {
                codigo: {
                    startsWith: `${prefix}-`
                }
            },
            select: { codigo: true },
            orderBy: { createdAt: 'desc' },
            take: 5 // Take a few to find the max number properly
        })

        let maxSequence = 0

        // Analyze existing codes to find max sequence
        lastItems.forEach(item => {
            const parts = item.codigo.split('-')
            // Assuming format AAA-0000
            if (parts.length === 2) {
                const num = parseInt(parts[1])
                if (!isNaN(num) && num > maxSequence) {
                    maxSequence = num
                }
            }
        })

        const nextSequence = maxSequence + 1
        const nextCode = `${prefix}-${nextSequence.toString().padStart(4, '0')}`

        return NextResponse.json({ code: nextCode })

    } catch (error) {
        console.error("SKU Gen Error:", error)
        return NextResponse.json({ error: "Error generando código" }, { status: 500 })
    }
}
