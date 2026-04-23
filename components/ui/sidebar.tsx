"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { hasPermission } from "@/lib/rbac"
import { Role } from "@prisma/client"
import { ChevronDown, ChevronRight, Settings, Users, PieChart, HardHat, FileText, Landmark, Wallet, Coins, Briefcase, ChevronUp } from "lucide-react"

const groupedNavigation = [
  {
    group: "Gestión Financiera",
    icon: Landmark,
    items: [
      { name: "Bancos", href: "/contabilidad/bancos", icon: Landmark },
      { name: "Caja", href: "/caja", icon: Wallet },
      { name: "Caja Chica", href: "/caja-chica", icon: Wallet },
      { name: "Tesorería", href: "/tesoreria", icon: Coins },
    ]
  },
  {
    group: "Control y Análisis",
    icon: PieChart,
    items: [
      { name: "Operaciones Contables", href: "/contabilidad", icon: FileText },
      { name: "Reportes Auxiliares", href: "/reportes", icon: PieChart },
      { name: "Presupuesto", href: "/presupuesto", icon: Briefcase },
    ]
  },
  {
    group: "Gestión Operativa",
    icon: HardHat,
    items: [
      { name: "Inventario", href: "/inventario", icon: HardHat },
    ]
  },
  {
    group: "Gestión Organizacional",
    icon: Users,
    items: [
      { name: "Recursos Humanos", href: "/rrhh", icon: Users },
      { name: "Entidades", href: "/entidades", icon: Landmark },
      { name: "Usuarios", href: "/usuarios", icon: Users },
    ]
  },
  {
    group: "Configuración",
    icon: Settings,
    items: [
      { name: "Ajustes", href: "/configuracion", icon: Settings },
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  // Set default expanded group based on current pathname
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>(["Gestión Financiera"])

  React.useEffect(() => {
    groupedNavigation.forEach(navGroup => {
      if (navGroup.items.some(item => pathname === item.href || pathname?.startsWith(item.href + "/"))) {
        if (!expandedGroups.includes(navGroup.group)) {
          setExpandedGroups(prev => [...prev, navGroup.group])
        }
      }
    })
  }, [pathname])

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    )
  }

  return (
    <div className="flex relative h-full w-[280px] flex-col bg-sisgob-magenta border-r-[4px] border-sisgob-yellow z-40 overflow-hidden shadow-2xl">
      {/* Sidebar background pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-40 mix-blend-overlay bg-cover bg-center" 
        style={{ backgroundImage: "url('/design-assets/sidebar-pattern.png')" }}
      />
      
      <div className="relative z-10 flex flex-col pt-6 pb-2 px-4 shrink-0">
        <Link href="/dashboard" className="flex justify-center w-full mb-6 transition-transform hover:scale-105 active:scale-95">
          <img 
            src="/design-assets/sisgob-logo.png" 
            alt="SISGOB Logo Oficial" 
            className="w-[220px] object-contain drop-shadow-2xl filter brightness-110"
          />
        </Link>
      </div>

      <nav className="relative z-10 flex-1 space-y-3 px-4 py-6 overflow-y-auto custom-scrollbar">
        {groupedNavigation.map((navGroup) => {
          const isExpanded = expandedGroups.includes(navGroup.group)
          const hasActiveItem = navGroup.items.some(item => pathname === item.href || pathname?.startsWith(item.href + "/"))
          
          return (
            <div key={navGroup.group} className="flex flex-col mb-1">
              <button 
                onClick={() => toggleGroup(navGroup.group)}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-4 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.15em] transition-all text-left group relative overflow-hidden",
                  isExpanded || hasActiveItem 
                    ? "bg-white/10 ring-1 ring-white/20 shadow-[0_10px_20px_rgba(0,0,0,0.1)] backdrop-blur-md" 
                    : "hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center transition-all",
                    isExpanded || hasActiveItem ? "bg-sisgob-yellow text-sisgob-magenta shadow-lg" : "bg-white/10 text-white/70"
                  )}>
                    <navGroup.icon className="h-4 w-4" />
                  </div>
                  <span>{navGroup.group}</span>
                </div>
                <div className="relative z-10">
                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-white/50" /> : <ChevronRight className="h-3.5 w-3.5 text-white/30" />}
                </div>
                
                {(isExpanded || hasActiveItem) && (
                   <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent z-0" />
                )}
              </button>
              
              <div 
                className={cn(
                  "flex flex-col space-y-1 overflow-hidden transition-all duration-500 ease-out",
                  isExpanded ? "max-h-[500px] opacity-100 mt-2 ml-4 border-l border-white/10" : "max-h-0 opacity-0"
                )}
              >
                {navGroup.items.map(item => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-4 px-6 py-3 text-[10px] text-white uppercase tracking-widest font-black transition-all rounded-r-xl relative group/item",
                        isActive 
                          ? "text-sisgob-yellow" 
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-sisgob-yellow rounded-full shadow-[0_0_10px_rgba(253,185,19,0.5)]" />
                      )}
                      <item.icon className={cn("h-3.5 w-3.5 transition-transform group-hover/item:scale-110", isActive ? "text-sisgob-yellow" : "opacity-40")} />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* People collage image at the bottom */}
      <div className="relative z-10 shrink-0 mt-auto p-0">
        <img 
            src="/design-assets/sidebar-people.png" 
            className="w-full h-auto object-cover opacity-100" 
            alt="Comunidad" 
        />
      </div>
    </div>
  )
}

