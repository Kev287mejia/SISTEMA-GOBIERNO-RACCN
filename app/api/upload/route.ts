import { NextRequest, NextResponse } from "next/server"
import { StorageService } from "@/lib/storage"

/**
 * API de Carga de Evidencias
 * Refactorizada para Object Storage (S3/MinIO) por Analista Senior
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File | null

        if (!file) {
            return NextResponse.json({ error: "No se ha subido ningún archivo" }, { status: 400 })
        }

        // Validaciones de Seguridad
        const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "Formato no soportado. Requerido: PDF o Imágenes." }, { status: 400 })
        }

        if (file.size > 10 * 1024 * 1024) { // Aumentado a 10MB para comprobantes pesados
            return NextResponse.json({ error: "Archivo demasiado grande (Máx 10MB)" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Delegar carga al servicio de almacenamiento unificado
        const result = await StorageService.uploadFile(buffer, file.name, file.type)

        console.log(`[UPLOAD_SUCCESS] Archivo procesado: ${result.key}`)

        return NextResponse.json({
            url: result.url,
            filename: file.name,
            type: file.type,
            key: result.key
        })

    } catch (error) {
        console.error("[UPLOAD_ERROR] Error crítico en API:", error)
        return NextResponse.json({
            error: "Error interno al procesar el archivo",
            details: error instanceof Error ? error.message : "Desconocido"
        }, { status: 500 })
    }
}
