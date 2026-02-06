"use client"

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
        window.location.href = "/dashboard"
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
    <div id="login-page" className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Background Image with Parallax effect */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 transform scale-105"
        style={{
          backgroundImage: "url('https://www.el19digital.com/files/articulos/271833.jpg')", // Puente Wawa Boom / Infraestructura Costa Caribe
          // Alternative: "url('https://jpmas.com.ni/wp-content/uploads/2020/10/Bluefields-Nicaragua.jpg')"
        }}
      />

      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-indigo-950/80" />

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 z-50"></div>

      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 p-6 lg:p-0 items-center">

        {/* Left Side: Branding Monumental */}
        <div className="hidden lg:flex flex-col space-y-8 text-white pr-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 w-fit backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-medium tracking-wide text-emerald-100 uppercase">Sistema Seguro Ver. 2.0</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl font-black leading-tight tracking-tight drop-shadow-xl font-serif">
              Gobierno Regional <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                Autónomo
              </span>
            </h1>
            <h2 className="text-3xl font-light tracking-widest uppercase text-slate-300 border-l-4 border-amber-500 pl-4">
              Costa Caribe Norte
            </h2>
          </div>

          <p className="text-lg text-slate-300 leading-relaxed max-w-lg drop-shadow bg-black/30 p-4 rounded-lg border-l-0 border-white/10">
            Plataforma Integral de Gestión Financiera, Administrativa y Auditoría Gubernamental.
          </p>


        </div>


        {/* Right Side: Login Card Glassmorphism */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 lg:p-10 relative overflow-hidden group">

            {/* Shine Effect Animation */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

            <div className="flex flex-col items-center mb-8 relative z-10">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-4 transform rotate-3 hover:rotate-0 transition-all duration-300">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white text-center">Acceso Administrativo</h3>
              <p className="text-slate-400 text-sm text-center mt-1">Identifíquese con sus credenciales oficiales</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <Label className="text-slate-200 text-xs uppercase tracking-wide">Usuario Institucional</Label>
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

              <div className="space-y-2">
                <Label className="text-slate-200 text-xs uppercase tracking-wide">Contraseña Segura</Label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within/input:text-amber-400 transition-colors" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-12 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl transition-all"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-sm font-medium text-red-200">{error}</span>
                </div>
              )}

              <Button
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? 'Validando...' : (
                  <span className="flex items-center justify-center gap-2">
                    Ingresar al Portal <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <Link href="/auth/forgot-password" className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                ¿Olvidó su contraseña? Recupérela aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}
