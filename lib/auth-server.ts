import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

export async function requireRole(role: Role) {
  const user = await requireAuth()
  if (user.role !== role) {
    redirect("/dashboard")
  }
  return user
}

export async function requireAnyRole(roles: Role[]) {
  const user = await requireAuth()
  if (!roles.includes(user.role)) {
    redirect("/dashboard")
  }
  return user
}
