"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Home,
    FileText,
    DollarSign,
    Building2,
    Users,
    BarChart3,
    Shield,
    Settings,
    Wallet,
    Package
} from "lucide-react"

const searchablePages = [
    { name: "Dashboard", href: "/dashboard", icon: Home, category: "General", keywords: ["inicio", "home", "principal"] },
    { name: "Contabilidad", href: "/contabilidad", icon: FileText, category: "Módulos", keywords: ["asientos", "accounting", "contable"] },
    { name: "Presupuesto", href: "/presupuesto", icon: DollarSign, category: "Módulos", keywords: ["budget", "partidas", "ejecucion"] },
    { name: "Bancos", href: "/contabilidad/bancos", icon: Building2, category: "Finanzas", keywords: ["cuentas", "bancarias", "bank"] },
    { name: "Caja", href: "/caja", icon: Wallet, category: "Finanzas", keywords: ["cash", "efectivo", "movimientos"] },
    { name: "Caja Chica", href: "/caja-chica", icon: Wallet, category: "Finanzas", keywords: ["minor", "caja chica", "gastos"] },
    { name: "Reportes", href: "/reportes", icon: BarChart3, category: "Informes", keywords: ["reports", "informes", "estadisticas"] },
    { name: "Auditoría", href: "/auditoria", icon: Shield, category: "Sistema", keywords: ["audit", "logs", "trazabilidad"] },
    { name: "Usuarios", href: "/usuarios", icon: Users, category: "Sistema", keywords: ["users", "permisos", "roles"] },
    { name: "Configuración", href: "/configuracion", icon: Settings, category: "Sistema", keywords: ["settings", "ajustes", "config"] },
    { name: "Inventario", href: "/inventario", icon: Package, category: "Módulos", keywords: ["inventory", "stock", "almacen"] },
]

export function GlobalSearch() {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const handleSelect = useCallback((href: string) => {
        setOpen(false)
        router.push(href)
    }, [router])

    const quickAccess = searchablePages.filter(p => ["Dashboard", "Presupuesto", "Reportes"].includes(p.name))

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Buscar páginas, funciones..." />
            <CommandList>
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>

                <CommandGroup heading="Accesos Rápidos">
                    {quickAccess.map((page) => {
                        const Icon = page.icon
                        return (
                            <CommandItem
                                key={`quick-${page.href}`}
                                value={`quick ${page.name}`}
                                onSelect={() => handleSelect(page.href)}
                            >
                                <Icon className="mr-2 h-4 w-4 text-primary" />
                                <span>{page.name}</span>
                                <span className="ml-auto text-xs text-muted-foreground">Ir</span>
                            </CommandItem>
                        )
                    })}
                </CommandGroup>

                <CommandGroup heading="Módulos y Páginas">
                    {searchablePages.map((page) => {
                        const Icon = page.icon
                        return (
                            <CommandItem
                                key={page.href}
                                value={`${page.name} ${page.keywords.join(" ")}`}
                                onSelect={() => handleSelect(page.href)}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                <span>{page.name}</span>
                            </CommandItem>
                        )
                    })}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
