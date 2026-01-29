import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EntryType, EntryStatus } from "@prisma/client"

/**
 * GET /api/accounting-entries/statistics
 * Get accounting statistics for dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const fechaDesde = searchParams.get("fechaDesde")
    const fechaHasta = searchParams.get("fechaHasta")
    const institucion = searchParams.get("institucion")

    const where: any = {
      deletedAt: null,
      estado: EntryStatus.APROBADO, // Only count approved entries
    }

    if (fechaDesde || fechaHasta) {
      where.fecha = {}
      if (fechaDesde) {
        where.fecha.gte = new Date(fechaDesde)
      }
      if (fechaHasta) {
        where.fecha.lte = new Date(fechaHasta)
      }
    }

    if (institucion) {
      where.institucion = institucion
    }

    // Get totals
    const [ingresos, egresos, entries] = await Promise.all([
      prisma.accountingEntry.aggregate({
        where: {
          ...where,
          tipo: EntryType.INGRESO,
        },
        _sum: {
          monto: true,
        },
        _count: {
          id: true,
        },
      }),
      prisma.accountingEntry.aggregate({
        where: {
          ...where,
          tipo: EntryType.EGRESO,
        },
        _sum: {
          monto: true,
        },
        _count: {
          id: true,
        },
      }),
      prisma.accountingEntry.findMany({
        where,
        orderBy: {
          fecha: "desc",
        },
        take: 50,
        include: {
          creadoPor: {
            select: {
              nombre: true,
              apellido: true,
            },
          },
          aprobadoPor: {
            select: {
              nombre: true,
              apellido: true,
            },
          },
        },
      }),
    ])

    const totalIngresos = Number(ingresos._sum.monto || 0)
    const totalEgresos = Number(egresos._sum.monto || 0)
    const balance = totalIngresos - totalEgresos

    // Get monthly data for chart
    // Fetch all entries and group by month in JavaScript for better compatibility
    const allEntries = await prisma.accountingEntry.findMany({
      where,
      select: {
        fecha: true,
        tipo: true,
        monto: true,
      },
      orderBy: {
        fecha: "desc",
      },
    })

    // Group by month
    const monthlyMap = new Map<string, { ingresos: number; egresos: number }>()
    
    allEntries.forEach((entry) => {
      const month = entry.fecha.toISOString().substring(0, 7) // YYYY-MM
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { ingresos: 0, egresos: 0 })
      }
      const monthData = monthlyMap.get(month)!
      if (entry.tipo === EntryType.INGRESO) {
        monthData.ingresos += Number(entry.monto)
      } else {
        monthData.egresos += Number(entry.monto)
      }
    })

    // Convert to array and sort
    const monthlyData = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        ingresos: data.ingresos,
        egresos: data.egresos,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12) // Last 12 months

    // Get data by institution
    const byInstitution = await prisma.accountingEntry.groupBy({
      by: ["institucion"],
      where,
      _sum: {
        monto: true,
      },
      _count: {
        id: true,
      },
    })

    // Get data by status
    const byStatus = await prisma.accountingEntry.groupBy({
      by: ["estado"],
      where: {
        ...where,
        estado: undefined, // Remove status filter for this query
      },
      _count: {
        id: true,
      },
    })

    return NextResponse.json({
      totals: {
        ingresos: totalIngresos,
        egresos: totalEgresos,
        balance,
        countIngresos: ingresos._count.id,
        countEgresos: egresos._count.id,
      },
      monthly: monthlyData.map((item) => ({
        month: item.month,
        ingresos: Number(item.ingresos),
        egresos: Number(item.egresos),
        balance: Number(item.ingresos) - Number(item.egresos),
      })),
      byInstitution: byInstitution.map((item) => ({
        institucion: item.institucion,
        total: Number(item._sum.monto || 0),
        count: item._count.id,
      })),
      byStatus: byStatus.map((item) => ({
        estado: item.estado,
        count: item._count.id,
      })),
      recentEntries: entries.map((entry) => ({
        id: entry.id,
        numero: entry.numero,
        tipo: entry.tipo,
        fecha: entry.fecha,
        monto: Number(entry.monto),
        descripcion: entry.descripcion,
        institucion: entry.institucion,
        estado: entry.estado,
        cuentaContable: entry.cuentaContable,
        creadoPor: entry.creadoPor
          ? `${entry.creadoPor.nombre} ${entry.creadoPor.apellido || ""}`.trim()
          : null,
        aprobadoPor: entry.aprobadoPor
          ? `${entry.aprobadoPor.nombre} ${entry.aprobadoPor.apellido || ""}`.trim()
          : null,
      })),
    })
  } catch (error: any) {
    console.error("Error getting statistics:", error)
    return NextResponse.json(
      { error: "Error al obtener las estadísticas" },
      { status: 500 }
    )
  }
}
