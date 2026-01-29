import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { hasPermission } from "@/lib/rbac"
import { Role } from "@prisma/client"
import { checkRateLimit } from "@/lib/rate-limit"
import type { NextRequest } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname
    const isApiRoute = pathname.startsWith("/api/")
    const isDebugRoute = pathname.startsWith("/debug")

    console.log(`[MIDDLEWARE] Checking path: ${pathname}`)
    console.log(`[MIDDLEWARE] Cookies: ${req.cookies.getAll().map(c => c.name).join(', ')}`)
    console.log(`[MIDDLEWARE] Has Token: ${!!token}`)

    if (isDebugRoute) {
      return NextResponse.next()
    }

    // If no token, handle unauthenticated access
    if (!token) {
      if (isApiRoute) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    // Check if user has permission for this route
    const userRole = token.role as Role
    const deniedModules = (token.deniedModules as string[]) || []
    const hasAccess = hasPermission(userRole, pathname, deniedModules)

    console.log(`[MIDDLEWARE] Path: ${pathname}, Role: ${userRole}, Denied: ${deniedModules}, HasAccess: ${hasAccess}`)

    if (!hasAccess) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Prohibido: No tiene permisos suficientes" }, { status: 403 })
      }
      // Redirect to dashboard if user doesn't have permission
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Agregar headers de seguridad
    const response = NextResponse.next()

    // Prevenir clickjacking
    response.headers.set('X-Frame-Options', 'DENY')

    // Prevenir MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff')

    // Habilitar XSS protection
    response.headers.set('X-XSS-Protection', '1; mode=block')

    // Referrer policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Content Security Policy
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    )

    // Permissions Policy
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    )

    return response
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function handle the logic
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/caja/:path*",
    "/caja-chica/:path*",
    "/contabilidad/:path*",
    "/facturas/:path*",
    "/presupuesto/:path*",
    "/inventario/:path*",
    "/rrhh/:path*",
    "/reportes/:path*",
    "/entidades/:path*",
    "/usuarios/:path*",
    "/documentacion/:path*",
    "/configuracion/:path*",
    "/api/:path*", // Incluir APIs para rate limiting
  ],
}
