import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Obtener notificaciones del usuario
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const unreadOnly = searchParams.get("unreadOnly") === "true"
        const limit = parseInt(searchParams.get("limit") || "50")

        const where: any = { userId: session.user.id }
        if (unreadOnly) {
            where.read = false
        }

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit
        })

        const unreadCount = await prisma.notification.count({
            where: {
                userId: session.user.id,
                read: false
            }
        })

        return NextResponse.json({
            notifications,
            unreadCount
        })

    } catch (error) {
        console.error("[NOTIFICATIONS_GET] Error:", error)
        return NextResponse.json({ error: "Error al obtener notificaciones" }, { status: 500 })
    }
}

// POST - Crear notificación
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const body = await request.json()
        const { userId, type, title, message, link } = body

        const notification = await prisma.notification.create({
            data: {
                userId: userId || session.user.id,
                type,
                title,
                message,
                link
            }
        })

        return NextResponse.json(notification)

    } catch (error) {
        console.error("[NOTIFICATIONS_POST] Error:", error)
        return NextResponse.json({ error: "Error al crear notificación" }, { status: 500 })
    }
}

// PATCH - Marcar como leída
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const body = await request.json()
        const { notificationId, markAllAsRead } = body

        if (markAllAsRead) {
            await prisma.notification.updateMany({
                where: {
                    userId: session.user.id,
                    read: false
                },
                data: {
                    read: true,
                    readAt: new Date()
                }
            })

            return NextResponse.json({ success: true, message: "Todas las notificaciones marcadas como leídas" })
        }

        if (notificationId) {
            const notification = await prisma.notification.update({
                where: {
                    id: notificationId,
                    userId: session.user.id // Security: only update own notifications
                },
                data: {
                    read: true,
                    readAt: new Date()
                }
            })

            return NextResponse.json(notification)
        }

        return NextResponse.json({ error: "Se requiere notificationId o markAllAsRead" }, { status: 400 })

    } catch (error) {
        console.error("[NOTIFICATIONS_PATCH] Error:", error)
        return NextResponse.json({ error: "Error al actualizar notificación" }, { status: 500 })
    }
}

// DELETE - Eliminar notificación
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const notificationId = searchParams.get("id")

        if (!notificationId) {
            return NextResponse.json({ error: "Se requiere ID de notificación" }, { status: 400 })
        }

        await prisma.notification.delete({
            where: {
                id: notificationId,
                userId: session.user.id // Security: only delete own notifications
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("[NOTIFICATIONS_DELETE] Error:", error)
        return NextResponse.json({ error: "Error al eliminar notificación" }, { status: 500 })
    }
}
