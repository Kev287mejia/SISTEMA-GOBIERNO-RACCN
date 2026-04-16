"use client"

export const dynamic = "force-dynamic";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            if (res.ok) {
                setSuccess(true)
                toast.success("Correo enviado", {
                    description: "Revisa tu bandeja de entrada para restablecer tu contraseña.",
                })
            } else {
                toast.error("Error", {
                    description: "No se pudo enviar el correo. Intenta nuevamente.",
                })
            }
        } catch (error) {
            toast.error("Error de conexión")
        } finally {
            setLoading(false)
        }
    }

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
                        <h3 className="text-2xl font-bold text-white text-center">Recuperar Contraseña</h3>
                        <p className="text-slate-400 text-sm text-center mt-1">
                            {success
                                ? "Hemos enviado las instrucciones a su correo electrónico."
                                : "Ingrese su correo institucional para recibir instrucciones."
                            }
                        </p>
                    </div>

                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <Label className="text-slate-200 text-xs uppercase tracking-wide">Correo Institucional</Label>
                                <div className="relative group/input">
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within/input:text-amber-400 transition-colors" />
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-12 h-12 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl transition-all"
                                        placeholder="usuario@graccnn.gob.ni"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-900/50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                disabled={loading}
                            >
                                {loading ? 'Enviando...' : (
                                    <span className="flex items-center justify-center gap-2">
                                        Enviar Instrucciones <ArrowRight className="h-4 w-4" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-200 text-sm">
                                Correo enviado correctamente a <strong>{email}</strong>
                            </div>
                            <p className="text-slate-400 text-sm">
                                Si no lo recibe en unos minutos, revise su carpeta de spam o contacte a soporte.
                            </p>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <Link href="/auth/login" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                            <ArrowLeft className="h-4 w-4" /> Volver al Inicio de Sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
