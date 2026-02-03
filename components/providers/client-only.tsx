"use client"

import { useEffect, useState, ReactNode } from "react"

/**
 * Componente Wrapper para evitar errores de Hydration en Next.js.
 * Asegura que el contenido solo se renderice en el cliente, evitando discrepancias
 * con el HTML generado por el servidor (SSR). Especialmente útil para reportes
 * y componentes que usan 'window', 'document' o cálculos de fechas dinámicos.
 */
export function ClientOnly({ children }: { children: ReactNode }) {
    const [hasMounted, setHasMounted] = useState(false)

    useEffect(() => {
        setHasMounted(true)
    }, [])

    if (!hasMounted) {
        // Retornamos null o un esqueleto/spinner durante el SSR
        return null
    }

    return <>{children}</>
}
