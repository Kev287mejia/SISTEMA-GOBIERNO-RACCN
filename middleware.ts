import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // 1. Excluir rutas públicas y archivos estáticos
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/public") ||
    pathname.includes(".") // Archivos con extensión
  ) {
    return NextResponse.next()
  }

  // 2. Verificar Sesión (DESACTIVADO PARA MODO DEMO)
  /*
  const token = await getToken({ req })

  // Si no hay token, redirigir a login
  if (!token) {
    // Si es una llamada API, devolver 401 JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Si es pagina, redirigir
    const url = new URL("/auth/login", req.url)
    url.searchParams.set("callbackUrl", encodeURI(req.url))
    return NextResponse.redirect(url)
  }
  */

  // 3. Pasar la solicitud
  const response = NextResponse.next()

  // Añadir cabeceras de seguridad o info de usuario si es necesario
  // response.headers.set("x-user-role", token.role as string)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
