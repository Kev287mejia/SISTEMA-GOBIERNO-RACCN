import { Role } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: Role
      deniedModules?: string[]
      twoFactorEnabled?: boolean
      sessionVersion?: number
    }
  }

  interface User {
    role: Role
    id: string
    deniedModules?: string[]
    twoFactorEnabled?: boolean
    sessionVersion?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    id: string
    deniedModules?: string[]
    twoFactorEnabled?: boolean
    sessionVersion?: number
  }
}
