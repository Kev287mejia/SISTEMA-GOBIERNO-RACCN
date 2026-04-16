"use client"

export const dynamic = "force-dynamic";
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("Intentando login manual...")
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      console.log("Resultado login:", result)

      if (result?.error) {
        console.error("Login error:", result.error)
        setError(`Error de acceso: ${result.error}`)
        setLoading(false)
      } else if (result?.ok) {
        console.log("Login exitoso, redirigiendo manual a /dashboard...")
        router.push("/dashboard")
        router.refresh()
      } else {
        setError("Respuesta inesperada del servidor")
        setLoading(false)
      }

    } catch (error) {
      console.error("Login exception:", error)
      setError("Error de conexión al intentar ingresar")
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900 flex items-center justify-center p-4">

      {/* 1. Background Image Layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://www.el19digital.com/files/articulos/271833.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.5) blur(4px)"
        }}
      />

      {/* 2. Gradient Overlay Layer */}
      <div className="absolute inset-0 z-10 bg-gradient-to-tr from-slate-950/90 via-slate-900/80 to-transparent" />

      {/* 3. Content Layer */}
      <div className="relative z-20 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">

        {/* Branding Section (Left) */}
        <div className="hidden lg:flex flex-col space-y-8 pr-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 w-fit backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold tracking-wider text-white uppercase">Sistema Seguro Ver. 2.0</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white leading-tight drop-shadow-2xl">
              Gobierno Regional <br />
              <span className="text-amber-400">Autónomo</span>
            </h1>
            <h2 className="text-3xl font-light text-slate-200 tracking-[0.2em] uppercase border-l-4 border-amber-500 pl-6">
              Costa Caribe Norte
            </h2>
          </div>

          <div className="bg-black/40 backdrop-blur-sm p-6 rounded-2xl border-l-4 border-white/20 max-w-lg">
            <p className="text-lg text-slate-100 font-medium leading-relaxed">
              Plataforma Integral de Gestión Financiera, Administrativa y Auditoría Gubernamental.
            </p>
          </div>
        </div>

        {/* Login Form Section (Right) */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-10">

            <div className="flex flex-col items-center mb-8">
              <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Acceso Administrativo</h3>
              <p className="text-slate-400 text-sm mt-1">Identifíquese con sus credenciales oficiales</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Usuario Institucional</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400 focus:ring-amber-500/20 rounded-xl"
                    placeholder="usuario@graccnn.gob.ni"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Contraseña Segura</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-12 bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400 focus:ring-amber-500/20 rounded-xl"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose-500/20 border border-rose-500/50 rounded-lg p-3 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-sm font-medium text-rose-200">{error}</span>
                </div>
              )}

              <Button
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? 'Validando...' : (
                  <span className="flex items-center justify-center gap-2">
                    Ingresar al Portal <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-amber-500/50 text-amber-400 hover:bg-amber-500/10 font-bold rounded-xl transition-all"
                onClick={() => router.push("/contabilidad")}
              >
                Acceso Demo (Sin Contraseña)
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <Link href="/auth/forgot-password" className="text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors">
                ¿Olvidó su contraseña? Recupérela aquí
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
