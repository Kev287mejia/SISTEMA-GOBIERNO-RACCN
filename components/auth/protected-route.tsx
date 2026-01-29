"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { hasPermission } from "@/lib/rbac"
import { Role } from "@prisma/client"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: Role
  allowedRoles?: Role[]
}

export function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/login")
      return
    }

    const userRole = session.user.role

    if (requiredRole && userRole !== requiredRole) {
      router.push("/dashboard")
      return
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      router.push("/dashboard")
      return
    }
  }, [session, status, router, requiredRole, allowedRoles])

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const userRole = session.user.role

  if (requiredRole && userRole !== requiredRole) {
    return null
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return null
  }

  return <>{children}</>
}
