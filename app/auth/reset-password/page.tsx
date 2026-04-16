"use client"

export const dynamic = "force-dynamic"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, ArrowRight, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token) {
            toast.error("Token inválido")
            return
        }

        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden")
            return
        }

        if (password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres")
            return
        }

        setLoading(true)

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(true)
                toast.success("Contraseña actualizada")
                setTimeout(() => {
                    router.push("/auth/login")
                }, 3000)
            } else {
                toast.error(data.error || "Error al actualizar contraseña")
            }
        } catch (error) {
            toast.error("Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="text-center text-red-400">
                Token inválido o faltante. Por favor, solicite un nuevo enlace de recuperación.
            </div>
        )
    }

    if (success) {
        return (
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-white">¡Contraseña Actualizada!</h3>
                <p className="text-slate-400">
                    Su contraseña ha sido cambiada exitosamente. Redirigiendo al login...
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
                <Label className="text-slate-200 text-xs uppercase tracking-wide">Nueva Contraseña</Label>
                <div className="relative group/input">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within/input:text-amber-400 transition-colors" />
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 h-12 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl transition-all"
                        placeholder="••••••••••••"
                        required
                        minLength={6}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-slate-200 text-xs uppercase tracking-wide">Confirmar Contraseña</Label>
                <div className="relative group/input">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within/input:text-amber-400 transition-colors" />
                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-12 h-12 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl transition-all"
                        placeholder="••••••••••••"
                        required
                        minLength={6}
                    />
                </div>
            </div>

            <Button
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
            >
                {loading ? 'Actualizando...' : (
                    <span className="flex items-center justify-center gap-2">
                        Cambiar Contraseña <ArrowRight className="h-4 w-4" />
                    </span>
                )}
            </Button>
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-900">
            {/* Background Image with Parallax effect */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 transform scale-105"
                style={{
                    backgroundImage: "url('https://www.el19digital.com/files/articulos/271833.jpg')",
                }}
            />

            <div className="absolute inset-0 z-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-indigo-950/80" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 z-50"></div>

            <div className="relative z-10 w-full max-w-md p-6">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 relative overflow-hidden group">

                    <div className="flex flex-col items-center mb-8 relative z-10">
                        <h3 className="text-2xl font-bold text-white text-center">Restablecer Contraseña</h3>
                        <p className="text-slate-400 text-sm text-center mt-1">Cree una nueva contraseña segura</p>
                    </div>

                    <Suspense fallback={<div className="text-white text-center">Cargando...</div>}>
                        <ResetPasswordForm />
                    </Suspense>

                </div>
            </div>
        </div>
    )
}
