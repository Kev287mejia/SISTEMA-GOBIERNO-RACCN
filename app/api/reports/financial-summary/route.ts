import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Resumen Financiero</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #7c3aed; }
    </style>
</head>
<body>
    <h1>Resumen Financiero Consolidado</h1>
    <p>Este reporte está en desarrollo.</p>
    <p>Generado: ${new Date().toLocaleString('es-NI')}</p>
</body>
</html>
        `

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `attachment; filename="resumen-financiero-${new Date().toISOString().split('T')[0]}.html"`
            }
        })

    } catch (error) {
        console.error("[REPORT_FINANCIAL] Error:", error)
        return NextResponse.json({ error: "Error al generar el reporte" }, { status: 500 })
    }
}
