"use client"

import { useState, useEffect } from "react"
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    link?: string
    read: boolean
    createdAt: string
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchNotifications()

        // Listen for real-time refresh requests
        const handleRefresh = () => fetchNotifications()
        window.addEventListener("refresh-notifications", handleRefresh)

        // Poll for new notifications every 60 seconds (as fallback)
        const interval = setInterval(fetchNotifications, 60000)

        return () => {
            window.removeEventListener("refresh-notifications", handleRefresh)
            clearInterval(interval)
        }
    }, [])

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications')
            if (response.ok) {
                const data = await response.json()
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    const markAsRead = async (notificationId: string) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId })
            })

            if (response.ok) {
                fetchNotifications()
            }
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    const markAllAsRead = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllAsRead: true })
            })

            if (response.ok) {
                fetchNotifications()
            }
        } catch (error) {
            console.error('Error marking all as read:', error)
        } finally {
            setLoading(false)
        }
    }

    const deleteNotification = async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications?id=${notificationId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                fetchNotifications()
            }
        } catch (error) {
            console.error('Error deleting notification:', error)
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'SUCCESS': return 'bg-emerald-100 text-emerald-700'
            case 'WARNING': return 'bg-amber-100 text-amber-700'
            case 'ERROR': return 'bg-red-100 text-red-700'
            case 'BUDGET_ALERT': return 'bg-purple-100 text-purple-700'
            case 'BANK_ALERT': return 'bg-blue-100 text-blue-700'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
                <div className="border-b p-4 flex items-center justify-between">
                    <h3 className="font-black text-sm uppercase tracking-widest">Notificaciones</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            disabled={loading}
                            className="text-xs"
                        >
                            <CheckCheck className="h-3 w-3 mr-1" />
                            Marcar todas
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-sm text-slate-500 font-medium">No hay notificaciones</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${getTypeColor(notification.type)}`}>
                                                    {notification.type}
                                                </span>
                                                {!notification.read && (
                                                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                                                )}
                                            </div>
                                            <h4 className="font-bold text-sm text-slate-900 mb-1">
                                                {notification.title}
                                            </h4>
                                            <p className="text-xs text-slate-600 mb-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                                        addSuffix: true,
                                                        locale: es
                                                    })}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {!notification.read && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="h-6 w-6 p-0"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {notification.link && (
                                                <Link
                                                    href={notification.link}
                                                    onClick={() => {
                                                        markAsRead(notification.id)
                                                        setOpen(false)
                                                    }}
                                                    className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                                                >
                                                    Ver detalles →
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
