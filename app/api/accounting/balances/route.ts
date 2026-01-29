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

        const { searchParams } = new URL(request.url)
        const institucion = searchParams.get("institucion") || "GOBIERNO"

        // In a real system, you would calculate these from accounting records
        // For this demonstration, we'll return some mock data based on existing entries
        // aggregate by account code

        // Optimized: Use database aggregation instead of fetching all records
        const aggregations = await prisma.accountingEntry.groupBy({
            by: ['cuentaContable', 'tipo'],
            where: {
                institucion: institucion as any,
                deletedAt: null,
                // Optional: Filter by 'APROBADO' if that's the business rule for "Balances"
                // estado: "APROBADO" 
            },
            _sum: {
                monto: true
            }
        })

        const balanceMap: Record<string, { balance: number, nombre: string }> = {
            "1.1.01.001": { balance: 0, nombre: "Caja y Bancos - Fondo Operativo" },
            "1.1.02.001": { balance: 0, nombre: "Cuentas por Cobrar Institucionales" },
            "2.1.01.001": { balance: 0, nombre: "Proveedores de Servicios" }
        }

        aggregations.forEach(agg => {
            const code = agg.cuentaContable
            const amount = Number(agg._sum.monto || 0)

            if (!balanceMap[code]) {
                balanceMap[code] = { balance: 0, nombre: `Cuenta ${code}` }
            }

            if (agg.tipo === "INGRESO") {
                balanceMap[code].balance += amount
            } else {
                balanceMap[code].balance -= amount
            }
        })

        const balances = Object.entries(balanceMap).map(([cuenta, data]) => ({
            cuenta,
            nombre: data.nombre,
            balance: data.balance
        }))

        return NextResponse.json({ balances })
    } catch (error: any) {
        console.error("Error fetching balances:", error)
        return NextResponse.json({ error: "Error al obtener saldos" }, { status: 500 })
    }
}
