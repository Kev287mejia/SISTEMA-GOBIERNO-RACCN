"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSocket } from "@/hooks/useSocket"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function NotificationListener() {
    const { data: session } = useSession()
    const { socket } = useSocket()
    const router = useRouter()

    useEffect(() => {
        if (!socket || !session?.user?.id) return

        const handleNewNotification = (notification: any) => {
            console.log("🔔 New real-time notification:", notification)

            // Show toast notification
            toast(notification.title, {
                description: notification.message,
                action: notification.link ? {
                    label: "Ver",
                    onClick: () => router.push(notification.link)
                } : undefined,
                duration: 5000,
            })

            // Dispatch a custom event to notify NotificationCenter to refresh
            window.dispatchEvent(new CustomEvent("refresh-notifications"))
        }

        socket.on("new-notification", handleNewNotification)

        return () => {
            socket.off("new-notification", handleNewNotification)
        }
    }, [socket, session?.user?.id, router])

    return null
}
