import { authenticator } from 'otplib'
import QRCode from 'qrcode'

/**
 * Genera un secreto para 2FA
 */
export function generate2FASecret(): string {
    return authenticator.generateSecret()
}

/**
 * Genera códigos de respaldo
 */
export function generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase()
        codes.push(code)
    }
    return codes
}

/**
 * Genera URL para QR code
 */
export function generate2FAURL(email: string, secret: string): string {
    const issuer = 'GRACCNN Sistema Contable'
    return authenticator.keyuri(email, issuer, secret)
}

/**
 * Genera imagen QR code como Data URL
 */
export async function generateQRCode(otpauth: string): Promise<string> {
    try {
        return await QRCode.toDataURL(otpauth)
    } catch (error) {
        throw new Error('Error generando código QR')
    }
}

/**
 * Verifica un código 2FA
 */
export function verify2FAToken(token: string, secret: string): boolean {
    try {
        // Permitir ventana de 1 paso (30 segundos antes/después)
        authenticator.options = { window: 1 }
        return authenticator.check(token, secret)
    } catch (error) {
        return false
    }
}

/**
 * Verifica un código de respaldo
 */
export function verifyBackupCode(code: string, backupCodes: string[]): {
    isValid: boolean
    remainingCodes?: string[]
} {
    const normalizedCode = code.toUpperCase().trim()
    const index = backupCodes.indexOf(normalizedCode)

    if (index === -1) {
        return { isValid: false }
    }

    // Remover el código usado
    const remainingCodes = [...backupCodes]
    remainingCodes.splice(index, 1)

    return {
        isValid: true,
        remainingCodes
    }
}

/**
 * Formatea códigos de respaldo para mostrar
 */
export function formatBackupCodes(codes: string[]): string {
    return codes.map((code, index) => {
        const formatted = code.match(/.{1,4}/g)?.join('-') || code
        return `${(index + 1).toString().padStart(2, '0')}. ${formatted}`
    }).join('\n')
}

/**
 * Valida formato de código 2FA
 */
export function isValid2FAFormat(token: string): boolean {
    return /^\d{6}$/.test(token)
}
