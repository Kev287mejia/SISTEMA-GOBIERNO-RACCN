"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { hasPermission } from "@/lib/rbac"
import { Role } from "@prisma/client"
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Settings,
  BarChart3,
  Building2,
  Wallet,
  Package,
  Briefcase,
  ClipboardList,
  BookOpen,
  Landmark,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Contabilidad", href: "/contabilidad", icon: FileText },
  { name: "Bancos", href: "/contabilidad/bancos", icon: Landmark },
  { name: "Caja", href: "/caja", icon: Wallet },
  { name: "Caja Chica", href: "/caja-chica", icon: Wallet },
  { name: "Facturas", href: "/facturas", icon: Receipt },
  { name: "Presupuesto", href: "/presupuesto", icon: Wallet },
  { name: "Inventario", href: "/inventario", icon: Package },
  { name: "RRHH", href: "/rrhh", icon: Briefcase },
  { name: "Auditoría", href: "/auditoria", icon: ClipboardList },
  { name: "Reportes", href: "/reportes", icon: BarChart3 },
  { name: "Entidades", href: "/entidades", icon: Building2 },
  { name: "Usuarios", href: "/usuarios", icon: Users },
  { name: "Configuración", href: "/configuracion", icon: Settings },
  { name: "Guía de Uso", href: "/documentacion", icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter((item) => {
    if (!session?.user?.role) return false
    const deniedModules = (session.user as any).deniedModules || []
    return hasPermission(session.user.role as Role, item.href, deniedModules)
  })

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card text-card-foreground">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-semibold tracking-tight">
          Sistema Contable
        </h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
