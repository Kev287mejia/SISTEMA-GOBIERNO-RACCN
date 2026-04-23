"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, CreditCard, Sun } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // Redirigir al dashboard si ya hay sesión activa
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        toast.success("Acceso concedido")
        router.push("/dashboard")
      } else {
        toast.error("Credenciales inválidas")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex overflow-hidden font-sans">
      
      {/* 1. SECCIÓN IZQUIERDA (PORTADA LOGIN) */}
      <div className="hidden lg:flex lg:w-[60%] relative flex-col justify-between overflow-hidden border-r-[6px] border-[#FDB913]">
        
        {/* IMAGEN DE PORTADA (DEL RECURSO INDICADO) */}
        <img 
          src="/design-assets/portada-login.png" 
          alt="Portada Regional"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        
        {/* LOGOS SUPERIORES */}
        <div className="relative z-10 flex justify-between items-start p-10">
           <img src="/design-assets/gob-logo.png" className="h-20 w-auto drop-shadow-xl" alt="Logo Gobierno" />
           <img src="/design-assets/escudo-raccn.png" className="h-24 w-auto drop-shadow-2xl" alt="Escudo RACCN" />
        </div>

        {/* ONDAS Y TEXTO (RÉPLICA EXACTA) */}
        <div className="relative z-10 mt-auto w-full">
          {/* ONDAS PERSONALIZADAS (TEAL Y VERDE) */}
          <div className="absolute bottom-0 left-0 w-full h-[320px] z-0 pointer-events-none">
             <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 400V180C150 130 300 280 500 180C700 100 850 180 1000 120V400H0Z" fill="#00A3A3" fillOpacity="0.9" />
                <path d="M0 400V240C120 210 350 350 550 240C750 140 880 230 1000 180V400H0Z" fill="#4D8C2B" />
             </svg>
          </div>

          <div className="relative z-10 px-16 pb-2 max-w-5xl">
             <div className="flex gap-6 items-end">
               <div className="w-[8px] h-20 bg-[#FDB913] shrink-0 mb-4" />
               <div className="space-y-1">
                 <h1 className="text-[2.6rem] font-extrabold text-white leading-[0.9] uppercase tracking-tighter drop-shadow-2xl">
                   GOBIERNO REGIONAL AUTÓNOMO <br />
                   <span className="text-[#FDB913]">DE LA COSTA CARIBE NORTE</span>
                 </h1>
                 <p className="text-lg font-normal text-white leading-tight opacity-85 drop-shadow-md">
                   Plataforma Integral de Gestión Financiera, <br /> Administrativa y Auditoría Gubernamental.
                 </p>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN DERECHA (MAGENTA / LOGIN PANEL) */}
      <div className="w-full lg:w-[40%] bg-gradient-to-b from-[#B02F7C] to-[#8E2463] relative flex flex-col items-center justify-center p-8 overflow-hidden">
        
        {/* LOGOS MINI SUPERIORES (DERECHA) */}
        <div className="absolute top-8 left-8 flex items-center gap-4 opacity-70 scale-90 origin-left">
           <img src="/design-assets/gob-logo.png" className="h-10 w-auto brightness-0 invert" alt="mini-logo" />
           <img src="/design-assets/escudo-raccn.png" className="h-12 w-auto brightness-0 invert" alt="mini-escudo" />
        </div>

        {/* SOL DECORATIVO (ESQUINA SUPERIOR DERECHA) */}
        <div className="absolute -top-4 -right-4 opacity-30 select-none">
           <svg className="w-56 h-56 text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="50" cy="50" r="18" />
              {[...Array(12)].map((_, i) => (
                <line key={i} x1="50" y1="5" x2="50" y2="22" transform={`rotate(${i * 30} 50 50)`} />
              ))}
              <g opacity="0.5">
                <circle cx="20" cy="20" r="2" fill="currentColor" stroke="none" />
                <circle cx="85" cy="85" r="3" fill="currentColor" stroke="none" />
                <circle cx="15" cy="80" r="1.5" fill="currentColor" stroke="none" />
              </g>
           </svg>
        </div>

        {/* MARCAS DE AGUA REGIONALES (INFERIOR DERECHA) */}
        <div className="absolute -bottom-20 -right-20 opacity-20 pointer-events-none rotate-45 scale-150">
           <svg className="w-80 h-80 text-white" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 10 Q70 30 50 50 Q30 30 50 10" />
              <path d="M50 50 Q70 70 50 90 Q30 70 50 50" />
              <path d="M10 50 Q30 30 50 50 Q30 70 10 50" />
              <path d="M50 50 Q70 30 90 50 Q70 70 50 50" />
           </svg>
        </div>

        {/* MARCA DE AGUA TORTUGA (INFERIOR IZQUIERDA) */}
        <div className="absolute -bottom-10 -left-10 opacity-10 pointer-events-none scale-125">
           <svg className="w-72 h-72 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M12 2C9.5 2 7.5 3.5 7 5.5C5.5 6 4 7.5 4 9.5C4 11 5.5 12 7 12.5C7.5 14.5 9.5 16 12 16C14.5 16 16.5 14.5 17 12.5C18.5 12 20 11 20 9.5C20 7.5 18.5 6 17 5.5C16.5 3.5 14.5 2 12 2Z" />
              <path d="M7 16V18C7 20 9 22 12 22C15 22 17 20 17 18V16" />
           </svg>
        </div>

        {/* LOGO SISGOB (ESTILO 3D RENDERIZADO) */}
        <div className="relative mb-10 z-10 transform scale-[1.3] filter drop-shadow-xl">
          <h1 
            className="text-8xl font-[Impact] font-black italic uppercase tracking-tighter"
            style={{ 
              color: '#FDB913',
              WebkitTextStroke: '4px #005C9E',
              filter: 'drop-shadow(6px 6px 0px #F97316)',
              letterSpacing: '-2px'
            }}
          >
            SISGOB
          </h1>
        </div>

        {/* CAJA DE ACCESO (DARK GLASS) */}
        <div className="w-full max-w-sm bg-[#58335E]/90 backdrop-blur-2xl p-10 rounded-[1.8rem] border border-white/20 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] z-20">
          <div className="flex flex-col items-center mb-8">
            {/* Icono de Credencial */}
            <div className="w-24 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-inner">
               <CreditCard className="w-12 h-12 text-white/90" strokeWidth={0.8} />
            </div>
            <h2 className="text-[2.2rem] font-bold text-white text-center leading-none tracking-tight">Acceso Administrativo</h2>
            <p className="text-white/70 text-[12px] uppercase font-semibold tracking-[0.15em] mt-3">Identifíquese con sus credenciales oficiales</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-4 top-4.5 h-6 w-6 text-white/50 group-focus-within:text-[#FDB913] transition-colors" />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Usuario Institucional"
                className="h-14 pl-14 bg-[#2D162B]/50 border-[#FDB913]/40 text-white placeholder:text-white/40 rounded-none focus:border-[#FDB913] focus:ring-4 focus:ring-[#FDB913]/10 transition-all border-2 text-lg"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-4.5 h-6 w-6 text-white/50 group-focus-within:text-[#FDB913] transition-colors" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña Segura"
                className="h-14 pl-14 bg-[#2D162B]/50 border-[#FDB913]/40 text-white placeholder:text-white/40 rounded-none focus:border-[#FDB913] focus:ring-4 focus:ring-[#FDB913]/10 transition-all border-2 text-lg"
              />
            </div>

            <Button 
                className="w-full h-14 bg-transparent border-2 border-[#8EED5B] text-[#8EED5B] hover:bg-[#8EED5B] hover:text-[#2D162B] font-black uppercase text-[13px] tracking-[0.25em] rounded-none shadow-none mt-4 transition-all active:scale-[0.98]"
                disabled={loading}
            >
              {loading ? "VERIFICANDO..." : "INGRESAR AL SISTEMA"}
            </Button>

            <Button 
                type="button"
                className="w-full h-14 bg-[#FDB913] hover:bg-white text-[#421A3B] font-black uppercase text-[13px] tracking-[0.25em] rounded-none shadow-[0_10px_30px_rgba(253,185,19,0.3)] transition-all active:scale-[0.98]"
                disabled={loading}
                onClick={async () => {
                  setLoading(true)
                  try {
                    toast.info("Ingresando con credenciales de demostración...")
                    const result = await signIn("credentials", {
                      email: "admin@test.com",
                      password: "admin123",
                      redirect: false,
                    })
                    
                    if (result?.ok) {
                      toast.success("Demo concedido")
                      router.push("/dashboard")
                    } else {
                      toast.error("Fallo de autenticación demo")
                    }
                  } catch (err) {
                    toast.error("Error de conexión")
                  } finally {
                    setLoading(false)
                  }
                }}
            >
              ACCESO DEMO
            </Button>

            <div className="flex justify-between items-center pt-6 px-1 text-[12px]">
               <label className="flex items-center gap-3 cursor-pointer group text-white/70">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" className="w-5 h-5 appearance-none border-2 border-white/50 checked:bg-[#FDB913] checked:border-[#FDB913] rounded-md transition-all cursor-pointer" />
                    <svg className="w-3 h-3 absolute hidden peer-checked:block text-[#2D162B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="group-hover:text-white transition-colors">Recordar datos</span>
               </label>
               <button type="button" className="text-white/50 hover:text-white transition-all underline underline-offset-8 decoration-white/20">¿Olvidó su contraseña?</button>
            </div>
          </form>
        </div>

        {/* FOOTER TEXT */}
        <div className="absolute bottom-6 opacity-30">
           <p className="text-[11px] text-white tracking-[1.5em] font-light uppercase">GRACCN - SISTEMA DE GESTIÓN</p>
        </div>

      </div>
    </div>
  )
}
