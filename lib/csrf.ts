import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Genera un token CSRF único
 */
export function generateCSRFToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Middleware para validar tokens CSRF en peticiones mutantes
 */
export async function validateCSRF(request: NextRequest): Promise<NextResponse | null> {
    const method = request.method

    // Solo validar en métodos que modifican datos
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        return null
    }

    // Obtener token del header
    const csrfToken = request.headers.get('x-csrf-token')

    // Obtener token de la sesión
    const token = await getToken({ req: request as any })

    if (!token) {
        // No hay sesión, dejar que NextAuth maneje
        return null
    }

    // Validar que el token CSRF coincida
    const sessionCSRF = (token as any).csrfToken

    if (!csrfToken || csrfToken !== sessionCSRF) {
        return NextResponse.json(
            { error: 'Token CSRF inválido o faltante' },
            { status: 403 }
        )
    }

    return null
}

/**
 * Hook para obtener el token CSRF del cliente
 */
export function getCSRFToken(): string | null {
    if (typeof window === 'undefined') return null

    // Buscar en meta tag
    const metaTag = document.querySelector('meta[name="csrf-token"]')
    if (metaTag) {
        return metaTag.getAttribute('content')
    }

    // Buscar en cookie
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'csrf-token') {
            return decodeURIComponent(value)
        }
    }

    return null
}

/**
 * Fetch wrapper que incluye token CSRF automáticamente
 */
export async function fetchWithCSRF(url: string, options: RequestInit = {}): Promise<Response> {
    const csrfToken = getCSRFToken()

    const headers = new Headers(options.headers)
    if (csrfToken) {
        headers.set('x-csrf-token', csrfToken)
    }

    return fetch(url, {
        ...options,
        headers
    })
}
