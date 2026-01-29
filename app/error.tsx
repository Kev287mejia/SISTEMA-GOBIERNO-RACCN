"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <div className="p-4 rounded-full bg-red-50">
                <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Algo salió mal</h2>
            <div className="bg-red-50 p-4 rounded-md border border-red-200 max-w-lg overflow-auto">
                <p className="font-mono text-xs text-red-800">
                    Error Técnico: {error.message || "Error desconocido"}
                </p>
                {error.digest && (
                    <p className="font-mono text-[10px] text-red-600 mt-1">Digest: {error.digest}</p>
                )}
            </div>
            <p className="text-slate-500 max-w-sm text-center">
                Se produjo un error crítico en la aplicación.
            </p>
            <Button
                variant="outline"
                onClick={() => reset()}
                className="font-bold border-red-200 text-red-600 hover:bg-red-50"
            >
                Reintentar
            </Button>
        </div>
    )
}
