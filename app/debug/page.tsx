"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default function DebugPage() {
    const { data: session, status } = useSession()
    const [cookieInfo, setCookieInfo] = useState<string>("")
    const [timeInfo, setTimeInfo] = useState<string>("")

    useEffect(() => {
        setCookieInfo(document.cookie)
        setTimeInfo(new Date().toISOString())
    }, [])

    return (
        <div className="p-8 font-mono text-sm bg-slate-900 text-green-400 min-h-screen">
            <h1 className="text-2xl font-bold mb-4 text-white">🕵️ Ficha de Diagnóstico de Sesión</h1>

            <div className="grid gap-6">
                <section className="border p-4 rounded border-green-800 bg-slate-800/50">
                    <h2 className="text-lg font-bold text-white mb-2">1. Estado de Sessión (NextAuth)</h2>
                    <p>Status: <span className="text-yellow-400 font-bold">{status}</span></p>
                    <pre className="mt-2 bg-black p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(session, null, 2)}
                    </pre>
                </section>

                <section className="border p-4 rounded border-green-800 bg-slate-800/50">
                    <h2 className="text-lg font-bold text-white mb-2">2. Cookies Detectadas</h2>
                    <p className="mb-2 text-slate-400">Si está vacío, no se están guardando las cookies.</p>
                    <div className="bg-black p-2 rounded break-all">
                        {cookieInfo || "(Ninguna cookie detectada)"}
                    </div>
                </section>

                <section className="border p-4 rounded border-green-800 bg-slate-800/50">
                    <h2 className="text-lg font-bold text-white mb-2">3. Sincronización de Tiempo</h2>
                    <p>Hora Cliente: {timeInfo}</p>
                </section>

                <div className="mt-4">
                    <a href="/auth/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-4">Ir a Login</a>
                    <a href="/dashboard" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Ir a Dashboard</a>
                </div>
            </div>
        </div>
    )
}
