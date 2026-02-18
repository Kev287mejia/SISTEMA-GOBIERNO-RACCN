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
  CreditCard,
  Package,
  Briefcase,
  ClipboardList,
  BookOpen,
  Landmark,
  TrendingUp,
  Target,
  ShoppingCart,
  Coins,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Contabilidad", href: "/contabilidad", icon: FileText },
  { name: "Inteligencia Financiera", href: "/contabilidad/reportes", icon: TrendingUp },
  { name: "Tesorería", href: "/tesoreria", icon: Coins },
  { name: "Bancos", href: "/contabilidad/bancos", icon: Landmark },
  { name: "Caja", href: "/caja", icon: Wallet },
  { name: "Caja Chica", href: "/caja-chica", icon: Wallet },
  { name: "Facturas", href: "/facturas", icon: Receipt },
  { name: "Presupuesto", href: "/presupuesto", icon: Target },
  { name: "Inventario", href: "/inventario", icon: Package },
  { name: "RRHH", href: "/rrhh", icon: Briefcase },
  { name: "Auditoría", href: "/auditoria", icon: ClipboardList },
  { name: "Reportes Auxiliares", href: "/reportes", icon: BarChart3 },
  { name: "Compras", href: "/compras", icon: ShoppingCart },
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
    <div className="flex h-full w-64 flex-col border-r bg-card dark:bg-black/40 dark:backdrop-blur-xl text-card-foreground transition-all duration-300">
      <div className="flex h-16 items-center border-b px-6 dark:border-white/5">
        <h1 className="text-xl font-bold tracking-tighter uppercase dark:text-primary">
          SISTEMA <span className="text-muted-foreground font-light italic">GOB</span>
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 group relative",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4 transition-transform duration-200 group-hover:scale-110", isActive ? "text-white" : "text-muted-foreground")} />
              {item.name}
              {isActive && (
                <span className="absolute left-0 h-4 w-1 rounded-r-full bg-white ml-[-12px]" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
