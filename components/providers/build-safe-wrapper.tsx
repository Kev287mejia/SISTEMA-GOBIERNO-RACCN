"use client"

import React, { useEffect, useState } from "react"

export function BuildSafeWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        // During SSR and the very first hydration, we render a minimal shell
        // to avoid crashes that happen when components access session/data
        // that isn't ready or present during the build's static generation.
        return <div id="app-loading-shell" className="min-h-screen bg-background" />
    }

    return <>{children}</>
}
