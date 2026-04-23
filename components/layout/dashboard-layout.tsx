"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/ui/sidebar"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut, User, Wallet } from "lucide-react"
import { getRoleDisplayName } from "@/lib/rbac"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { NotificationListener } from "@/components/notifications/notification-listener"
import { ThemeToggle } from "@/components/theme-toggle"
import { GlobalSearch } from "@/components/global-search"

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const [instName, setInstName] = useState("Sistema de Gobierno")

  const currentUser = session?.user

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings")
        if (res.ok) {
          const data = await res.json()
          const nameSetting = data.find((s: any) => s.key === 'inst_name')
          if (nameSetting) setInstName(nameSetting.value)
        }
      } catch (error) {
        console.error("Error fetching institution name", error)
      }
    }
    fetchSettings()
  }, [])

  return (
    <div className="flex h-screen bg-[#f1f5f9] dark:bg-slate-900 overflow-hidden font-sans">
      <NotificationListener />
      <Sidebar />
      <div className="flex flex-1 flex-col relative overflow-hidden">
        
        <header className="flex h-[70px] items-center justify-between px-8 sticky top-0 z-30 transition-all text-white shadow-xl relative border-b border-sisgob-yellow/20 overflow-hidden">
          {/* Capa Base: Degradado Azul a Magenta */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#005C9E] via-[#58335E] to-[#B02F7C]" />
          
          {/* Capa Textura: Granulada con efecto de mezcla */}
          <div 
             className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-overlay pointer-events-none" 
             style={{ backgroundImage: "url('/design-assets/sidebar-pattern.png')" }} 
          />
          
          <div className="flex items-center gap-6 flex-1 relative z-10">
            <div className="flex items-center gap-2 font-bold text-lg tracking-widest uppercase">
               <Wallet className="h-5 w-5 text-[#FDB913]" />
               <span className="drop-shadow-md">CAJA</span>
            </div>

            <div className="relative w-full max-w-xl mx-4">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <span className="text-slate-400 font-bold text-xs uppercase tracking-tighter">Buscar...</span>
              </div>
              <input
                type="text"
                className="block w-full h-10 rounded-full border-0 py-1.5 pl-24 pr-12 text-slate-100 ring-1 ring-inset ring-slate-400/30 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-sisgob-greenLight sm:text-sm bg-white/10 backdrop-blur-sm transition-all focus:bg-white/20"
                placeholder=""
                onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <div className="h-8 w-8 rounded-full bg-slate-500/20 flex items-center justify-center border border-white/10">
                   <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                </div>
              </div>
            </div>
          </div>

          {currentUser && (
            <div className="flex items-center gap-6 text-white text-[13px]">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-slate-400" />
                <span className="font-medium text-slate-100">{currentUser.name}</span>
                <span className="text-slate-400 text-xs font-normal">
                  ({getRoleDisplayName(currentUser.role)})
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <button className="text-slate-300 hover:text-white transition-colors relative">
                    <NotificationCenter />
                </button>
                <div className="h-4 w-[1px] bg-white/10" />
                <ThemeToggle />
                <div className="h-4 w-[1px] bg-white/10" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="gap-2 hover:bg-red-500/20 hover:text-red-400 text-white font-bold uppercase text-[11px] tracking-widest px-4 border border-white/10 rounded-full transition-all"
                >
                  <LogOut className="h-4 w-4 text-red-400" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </Button>

              </div>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto bg-[#eef2f6]/50">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
      <GlobalSearch />
    </div>
  )
}

