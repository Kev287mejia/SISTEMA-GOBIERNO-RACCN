"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/ui/sidebar"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
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
    <div className="flex h-screen bg-muted/40 dark:bg-muted/40">
      <NotificationListener />
      <Sidebar />
      <div className="flex flex-1 flex-col relative overflow-hidden">
        {/* Glow effect for background */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <header className="flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-6 sticky top-0 z-30 transition-all dark:border-white/5">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
              {instName}
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="ml-4 hidden h-9 w-64 justify-start text-sm text-muted-foreground sm:flex md:w-80 lg:w-96"
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            >
              <span className="inline-flex">Buscar...</span>
              <kbd className="pointer-events-none ml-auto h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>
          {session?.user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium text-foreground">{session.user.name}</span>
                <span className="text-muted-foreground">
                  ({getRoleDisplayName(session.user.role)})
                </span>
              </div>
              <NotificationCenter />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          )}
        </header>
        <main className="flex-1 overflow-y-auto bg-background/50">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
      <GlobalSearch />
    </div>
  )
}
