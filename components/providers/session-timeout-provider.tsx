"use client"

import { useEffect, useRef } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutos en milisegundos
const WARNING_TIME = 5 * 60 * 1000 // Advertir 5 minutos antes

export function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const timeoutRef = useRef<NodeJS.Timeout>()
    const warningRef = useRef<NodeJS.Timeout>()
    const lastActivityRef = useRef<number>(Date.now())

    const resetTimer = () => {
        lastActivityRef.current = Date.now()

        // Limpiar timers existentes
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (warningRef.current) clearTimeout(warningRef.current)

        // Solo configurar si hay sesión activa
        if (status === 'authenticated') {
            // Timer de advertencia (25 minutos)
            warningRef.current = setTimeout(() => {
                toast.warning('Su sesión expirará en 5 minutos por inactividad', {
                    duration: 10000,
                    action: {
                        label: 'Mantener Sesión',
                        onClick: () => resetTimer()
                    }
                })
            }, INACTIVITY_TIMEOUT - WARNING_TIME)

            // Timer de logout (30 minutos)
            timeoutRef.current = setTimeout(async () => {
                toast.error('Sesión cerrada por inactividad')
                await signOut({ redirect: false })
                router.push('/auth/login?timeout=true')
            }, INACTIVITY_TIMEOUT)
        }
    }

    useEffect(() => {
        if (status !== 'authenticated') return

        // Eventos que indican actividad del usuario
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ]

        // Throttle para no resetear en cada movimiento
        let throttleTimeout: NodeJS.Timeout
        const handleActivity = () => {
            if (throttleTimeout) return

            throttleTimeout = setTimeout(() => {
                resetTimer()
                throttleTimeout = null as any
            }, 1000) // Throttle de 1 segundo
        }

        // Agregar listeners
        events.forEach(event => {
            document.addEventListener(event, handleActivity)
        })

        // Iniciar timer
        resetTimer()

        // Cleanup
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity)
            })
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (warningRef.current) clearTimeout(warningRef.current)
            if (throttleTimeout) clearTimeout(throttleTimeout)
        }
    }, [status])

    return <>{children}</>
}
