import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Store para rate limiting (en producción usar Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

// Configuración de límites por ruta
const RATE_LIMITS = {
    '/api/auth/signin': { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 intentos cada 15 min
    '/api/auth/signup': { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 intentos cada hora
    '/api/users/create': { maxRequests: 10, windowMs: 60 * 1000 }, // 10 usuarios por minuto
    '/api/users/reset-password': { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 resets por hora
    default: { maxRequests: 100, windowMs: 60 * 1000 } // 100 requests por minuto (default)
}

export function getRateLimit(pathname: string) {
    // Buscar configuración específica
    for (const [route, config] of Object.entries(RATE_LIMITS)) {
        if (pathname.startsWith(route)) {
            return config
        }
    }
    return RATE_LIMITS.default
}

export function checkRateLimit(request: NextRequest): NextResponse | null {
    const pathname = request.nextUrl.pathname

    // Solo aplicar rate limiting a rutas de API
    if (!pathname.startsWith('/api/')) {
        return null
    }

    // Obtener IP del cliente
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const key = `${ip}:${pathname}`

    const limit = getRateLimit(pathname)
    const now = Date.now()

    // Obtener o crear contador
    let record = requestCounts.get(key)

    if (!record || now > record.resetTime) {
        // Crear nuevo contador
        record = {
            count: 1,
            resetTime: now + limit.windowMs
        }
        requestCounts.set(key, record)
        return null
    }

    // Incrementar contador
    record.count++

    // Verificar si excede el límite
    if (record.count > limit.maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000)

        return NextResponse.json(
            {
                error: 'Demasiadas solicitudes. Por favor, intente más tarde.',
                retryAfter: retryAfter
            },
            {
                status: 429,
                headers: {
                    'Retry-After': retryAfter.toString(),
                    'X-RateLimit-Limit': limit.maxRequests.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': record.resetTime.toString()
                }
            }
        )
    }

    return null
}

// Limpiar registros antiguos cada 10 minutos
setInterval(() => {
    const now = Date.now()
    for (const [key, record] of requestCounts.entries()) {
        if (now > record.resetTime) {
            requestCounts.delete(key)
        }
    }
}, 10 * 60 * 1000)
