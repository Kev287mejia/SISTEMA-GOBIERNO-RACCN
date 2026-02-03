import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

// Configuración de límites
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "evidencias")

/**
 * POST /api/accounting-entries/[id]/evidencias
 * Upload evidence files for an accounting entry
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            )
        }

        // Only certain roles can upload evidence
        const allowedRoles: Role[] = [
            Role.Admin,
            Role.ContadorGeneral,
            Role.AuxiliarContable,
            Role.ResponsableContabilidad,
        ]

        if (!allowedRoles.includes(session.user.role as Role)) {
            return NextResponse.json(
                { error: "No tiene permisos para subir evidencias" },
                { status: 403 }
            )
        }

        // Verify entry exists
        const entry = await prisma.accountingEntry.findUnique({
            where: { id: params.id, deletedAt: null },
        })

        if (!entry) {
            return NextResponse.json(
                { error: "Asiento contable no encontrado" },
                { status: 404 }
            )
        }

        // Parse form data
        const formData = await request.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json(
                { error: "No se proporcionó ningún archivo" },
                { status: 400 }
            )
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Tipo de archivo no permitido. Solo se aceptan PDF, JPG y PNG" },
                { status: 400 }
            )
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "El archivo excede el tamaño máximo permitido (10MB)" },
                { status: 400 }
            )
        }

        // Create upload directory if it doesn't exist
        if (!existsSync(UPLOAD_DIR)) {
            await mkdir(UPLOAD_DIR, { recursive: true })
        }

        // Generate unique filename
        const timestamp = Date.now()
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
        const extension = path.extname(sanitizedFilename)
        const filename = `${entry.numero}_${timestamp}${extension}`
        const filepath = path.join(UPLOAD_DIR, filename)

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filepath, buffer)

        // Generate public URL
        const fileUrl = `/uploads/evidencias/${filename}`

        // Update entry with new evidence URL
        const updatedEntry = await prisma.accountingEntry.update({
            where: { id: params.id },
            data: {
                evidenciaUrls: {
                    push: fileUrl,
                },
            },
        })

        // Create audit log
        await prisma.auditLog.create({
            data: {
                usuarioId: session.user.id,
                accion: "CREATE",
                entidad: "EvidenciaDocumental",
                entidadId: params.id,
                descripcion: `Evidencia subida: ${sanitizedFilename} para asiento ${entry.numero}`,
                datosNuevos: {
                    filename: sanitizedFilename,
                    fileUrl,
                    fileSize: file.size,
                    fileType: file.type,
                    entryNumber: entry.numero,
                },
            },
        })

        return NextResponse.json({
            message: "Evidencia subida exitosamente",
            fileUrl,
            entry: updatedEntry,
        })
    } catch (error: any) {
        console.error("Error uploading evidence:", error)
        return NextResponse.json(
            { error: error.message || "Error al subir evidencia" },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/accounting-entries/[id]/evidencias
 * Remove an evidence file from an accounting entry
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            )
        }

        // Only certain roles can delete evidence
        const allowedRoles: Role[] = [
            Role.Admin,
            Role.ContadorGeneral,
            Role.ResponsableContabilidad,
        ]

        if (!allowedRoles.includes(session.user.role as Role)) {
            return NextResponse.json(
                { error: "No tiene permisos para eliminar evidencias" },
                { status: 403 }
            )
        }

        const { fileUrl } = await request.json()

        if (!fileUrl) {
            return NextResponse.json(
                { error: "URL de archivo no proporcionada" },
                { status: 400 }
            )
        }

        // Verify entry exists
        const entry = await prisma.accountingEntry.findUnique({
            where: { id: params.id, deletedAt: null },
        })

        if (!entry) {
            return NextResponse.json(
                { error: "Asiento contable no encontrado" },
                { status: 404 }
            )
        }

        // Remove URL from array
        const updatedUrls = entry.evidenciaUrls.filter((url) => url !== fileUrl)

        const updatedEntry = await prisma.accountingEntry.update({
            where: { id: params.id },
            data: {
                evidenciaUrls: updatedUrls,
            },
        })

        // Create audit log
        await prisma.auditLog.create({
            data: {
                usuarioId: session.user.id,
                accion: "DELETE",
                entidad: "EvidenciaDocumental",
                entidadId: params.id,
                descripcion: `Evidencia eliminada del asiento ${entry.numero}`,
                datosAnteriores: {
                    fileUrl,
                    entryNumber: entry.numero,
                },
            },
        })

        return NextResponse.json({
            message: "Evidencia eliminada exitosamente",
            entry: updatedEntry,
        })
    } catch (error: any) {
        console.error("Error deleting evidence:", error)
        return NextResponse.json(
            { error: error.message || "Error al eliminar evidencia" },
            { status: 500 }
        )
    }
}
