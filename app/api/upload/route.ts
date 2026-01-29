
import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File | null

        if (!file) {
            return NextResponse.json({ error: "No se ha subido ningún archivo" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Validate file type (basic)
        const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "Formato no soportado. Solo PDF y Imágenes (JPG, PNG, WebP)" }, { status: 400 })
        }

        // Validate size (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "El archivo excede el límite de 5MB" }, { status: 400 })
        }

        // Create specific folder for year/month to avoid clutter
        const date = new Date()
        const year = date.getFullYear().toString()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const relativeDir = `uploads/${year}/${month}`
        const uploadDir = join(process.cwd(), "public", relativeDir)

        await mkdir(uploadDir, { recursive: true })

        // Generate safe unique filename
        const ext = file.name.split('.').pop()
        const filename = `${randomUUID()}.${ext}`
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer)

        const publicUrl = `/${relativeDir}/${filename}`

        return NextResponse.json({
            url: publicUrl,
            filename: file.name,
            type: file.type
        })

    } catch (error) {
        console.error("Error al subir archivo:", error)
        return NextResponse.json({ error: "Error interno al procesar el archivo" }, { status: 500 })
    }
}
