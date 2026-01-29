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

        const searchParams = request.nextUrl.searchParams
        const startDate = searchParams.get("startDate")
        const endDate = searchParams.get("endDate")
        const region = searchParams.get("region")

        // Fetch budget items
        const where: any = { deletedAt: null }
        if (region && region !== 'all') {
            where.centroRegional = region
        }

        const budgetItems = await prisma.budgetItem.findMany({
            where,
            orderBy: { codigo: 'asc' },
            include: {
                creadoPor: {
                    select: {
                        nombre: true,
                        apellido: true
                    }
                }
            }
        })

        // Calculate totals
        const totalAsignado = budgetItems.reduce((sum, item) => sum + Number(item.montoAsignado), 0)
        const totalEjecutado = budgetItems.reduce((sum, item) => sum + Number(item.montoEjecutado), 0)
        const totalDisponible = budgetItems.reduce((sum, item) => sum + Number(item.montoDisponible), 0)
        const porcentajeEjecucion = totalAsignado > 0 ? (totalEjecutado / totalAsignado) * 100 : 0

        // Generate HTML report
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reporte de Ejecución Presupuestaria</title>
    <style>
        @page { margin: 2cm; }
        body { 
            font-family: Arial, sans-serif; 
            font-size: 10pt;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #059669;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #059669;
            margin: 0;
            font-size: 24pt;
        }
        .header p {
            margin: 5px 0;
            color: #64748b;
        }
        .summary {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
        }
        .summary-item {
            text-align: center;
        }
        .summary-label {
            font-size: 9pt;
            color: #64748b;
            text-transform: uppercase;
            font-weight: bold;
        }
        .summary-value {
            font-size: 16pt;
            font-weight: bold;
            color: #0f172a;
            margin-top: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background: #059669;
            color: white;
            padding: 10px;
            text-align: left;
            font-size: 9pt;
            text-transform: uppercase;
        }
        td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
        }
        tr:hover {
            background: #f8fafc;
        }
        .text-right {
            text-align: right;
        }
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 8pt;
            font-weight: bold;
        }
        .badge-success {
            background: #d1fae5;
            color: #065f46;
        }
        .badge-warning {
            background: #fef3c7;
            color: #92400e;
        }
        .badge-danger {
            background: #fee2e2;
            color: #991b1b;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 8pt;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>GOBIERNO REGIONAL AUTÓNOMO</h1>
        <h1>COSTA CARIBE NORTE</h1>
        <p style="font-size: 14pt; font-weight: bold; margin-top: 15px;">REPORTE DE EJECUCIÓN PRESUPUESTARIA</p>
        <p>Período: ${startDate || 'Inicio'} - ${endDate || 'Actual'}</p>
        <p>Generado: ${new Date().toLocaleString('es-NI')}</p>
        ${region && region !== 'all' ? `<p>Centro Regional: <strong>${region}</strong></p>` : ''}
    </div>

    <div class="summary">
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Presupuesto Asignado</div>
                <div class="summary-value">C$ ${totalAsignado.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Ejecutado</div>
                <div class="summary-value" style="color: #2563eb;">C$ ${totalEjecutado.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Disponible</div>
                <div class="summary-value" style="color: #059669;">C$ ${totalDisponible.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
        </div>
        <div style="text-align: center; margin-top: 15px;">
            <span class="summary-label">Porcentaje de Ejecución: </span>
            <span style="font-size: 18pt; font-weight: bold; color: ${porcentajeEjecucion > 90 ? '#dc2626' : porcentajeEjecucion > 70 ? '#f59e0b' : '#059669'};">
                ${porcentajeEjecucion.toFixed(2)}%
            </span>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Partida</th>
                <th>Tipo</th>
                <th>Centro</th>
                <th class="text-right">Asignado</th>
                <th class="text-right">Ejecutado</th>
                <th class="text-right">Disponible</th>
                <th class="text-right">%</th>
            </tr>
        </thead>
        <tbody>
            ${budgetItems.map(item => {
            const porcentaje = Number(item.montoAsignado) > 0
                ? (Number(item.montoEjecutado) / Number(item.montoAsignado)) * 100
                : 0
            const badgeClass = porcentaje > 90 ? 'badge-danger' : porcentaje > 70 ? 'badge-warning' : 'badge-success'

            return `
                <tr>
                    <td><strong>${item.codigo}</strong></td>
                    <td>${item.nombre}</td>
                    <td><span class="badge badge-success">${item.tipoGasto}</span></td>
                    <td>${item.centroRegional}</td>
                    <td class="text-right">C$ ${Number(item.montoAsignado).toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                    <td class="text-right">C$ ${Number(item.montoEjecutado).toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                    <td class="text-right">C$ ${Number(item.montoDisponible).toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                    <td class="text-right"><span class="badge ${badgeClass}">${porcentaje.toFixed(1)}%</span></td>
                </tr>
                `
        }).join('')}
        </tbody>
    </table>

    <div class="footer">
        <p><strong>Gobierno Regional Autónomo Costa Caribe Norte (GRACCNN)</strong></p>
        <p>Sistema de Gestión Financiera y Administrativa</p>
        <p>Este documento fue generado electrónicamente y es válido sin firma autógrafa</p>
    </div>
</body>
</html>
        `

        // Return HTML for now (PDF generation would require additional library)
        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `attachment; filename="reporte-presupuesto-${new Date().toISOString().split('T')[0]}.html"`
            }
        })

    } catch (error) {
        console.error("[REPORT_BUDGET] Error:", error)
        return NextResponse.json({ error: "Error al generar el reporte" }, { status: 500 })
    }
}
