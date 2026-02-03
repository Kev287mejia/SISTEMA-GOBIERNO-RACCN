/**
 * Evidence Requirements Configuration
 * Defines thresholds and rules for when evidence documents are required
 */

export const EVIDENCE_CONFIG = {
    // Minimum amount that requires evidence (in Córdobas)
    THRESHOLD_AMOUNT: 5000,

    // Maximum file size in bytes (10MB)
    MAX_FILE_SIZE: 10 * 1024 * 1024,

    // Allowed MIME types
    ALLOWED_TYPES: [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
    ],

    // Allowed file extensions
    ALLOWED_EXTENSIONS: [".pdf", ".jpg", ".jpeg", ".png"],

    // Minimum number of evidence files required
    MIN_EVIDENCE_COUNT: 1,
}

/**
 * Check if an accounting entry requires evidence based on its amount
 */
export function requiresEvidence(amount: number): boolean {
    return amount >= EVIDENCE_CONFIG.THRESHOLD_AMOUNT
}

/**
 * Check if an entry has sufficient evidence
 */
export function hasSufficientEvidence(
    amount: number,
    evidenceUrls: string[]
): boolean {
    if (!requiresEvidence(amount)) {
        return true // No evidence required
    }

    return evidenceUrls.length >= EVIDENCE_CONFIG.MIN_EVIDENCE_COUNT
}

/**
 * Validate if an entry can be approved based on evidence requirements
 */
export function canApproveEntry(
    amount: number,
    evidenceUrls: string[],
    currentStatus: string
): {
    canApprove: boolean
    reason?: string
} {
    // If already approved or rejected, don't check
    if (currentStatus !== "BORRADOR" && currentStatus !== "PENDIENTE") {
        return { canApprove: true }
    }

    if (!requiresEvidence(amount)) {
        return { canApprove: true }
    }

    if (!hasSufficientEvidence(amount, evidenceUrls)) {
        return {
            canApprove: false,
            reason: `Este asiento requiere al menos ${EVIDENCE_CONFIG.MIN_EVIDENCE_COUNT} documento(s) de evidencia antes de ser aprobado (monto ≥ C$ ${EVIDENCE_CONFIG.THRESHOLD_AMOUNT.toLocaleString()})`,
        }
    }

    return { canApprove: true }
}

/**
 * Get file type icon name
 */
export function getFileTypeIcon(filename: string): string {
    const ext = filename.toLowerCase().split(".").pop()

    switch (ext) {
        case "pdf":
            return "file-pdf"
        case "jpg":
        case "jpeg":
        case "png":
            return "file-image"
        default:
            return "file"
    }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): {
    valid: boolean
    error?: string
} {
    // Check file size
    if (file.size > EVIDENCE_CONFIG.MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `El archivo excede el tamaño máximo permitido (${formatFileSize(EVIDENCE_CONFIG.MAX_FILE_SIZE)})`,
        }
    }

    // Check file type
    if (!EVIDENCE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: "Tipo de archivo no permitido. Solo se aceptan PDF, JPG y PNG",
        }
    }

    return { valid: true }
}
