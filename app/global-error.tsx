"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
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
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
                        <h2 className="text-2xl font-black text-slate-900">Algo salió mal</h2>
                        <p className="text-slate-500">Se produjo un error crítico en la aplicación.</p>
                        <Button
                            onClick={() => reset()}
                            className="w-full font-bold bg-slate-900 text-white"
                        >
                            Intentar de nuevo
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    )
}
