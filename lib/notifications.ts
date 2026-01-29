import { prisma } from "./prisma"
import { NotificationType, Role } from "@prisma/client"
import { getIO } from "./socket"

interface CreateNotificationParams {
  userId?: string
  roles?: Role[]
  type: NotificationType
  title: string
  message: string
  link?: string
}

/**
 * Crea una notificación en la base de datos y la emite vía Socket.IO
 */
export async function createNotification({
  userId,
  roles,
  type,
  title,
  message,
  link
}: CreateNotificationParams) {
  try {
    const io = getIO()
    
    // Si se especifica un userId, enviar solo a ese usuario
    if (userId) {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          link
        }
      })
      
      if (io) {
        io.to(userId).emit("new-notification", notification)
      }
      return [notification]
    }
    
    // Si se especifican roles, enviar a todos los usuarios con esos roles
    if (roles && roles.length > 0) {
      const users = await prisma.user.findMany({
        where: {
          role: { in: roles },
          activo: true
        },
        select: { id: true, role: true }
      })
      
      const notifications = await Promise.all(
        users.map(user => 
          prisma.notification.create({
            data: {
              userId: user.id,
              type,
              title,
              message,
              link
            }
          })
        )
      )
      
      if (io) {
        // Enviar a las salas de roles si están definidas en socket.ts
        // O simplemente emitir individualmente
        notifications.forEach(n => {
          io.to(n.userId).emit("new-notification", n)
        })
      }
      
      return notifications
    }
    
    // Si no hay userId ni roles, notificar a los administradores por defecto
    const admins = await prisma.user.findMany({
      where: { role: Role.Admin, activo: true },
      select: { id: true }
    })
    
    return await Promise.all(
      admins.map(admin => 
        prisma.notification.create({
          data: {
            userId: admin.id,
            type,
            title,
            message,
            link
          }
        })
      )
    )
    
  } catch (error) {
    console.error("[CREATE_NOTIFICATION] Error:", error)
    return []
  }
}

/**
 * Helper para notificar a todo el equipo administrativo/financiero
 */
export async function notifyFinancialTeam(params: Omit<CreateNotificationParams, "roles" | "userId">) {
  return createNotification({
    ...params,
    roles: [
      Role.Admin,
      Role.DirectoraDAF,
      Role.ContadorGeneral,
      Role.ResponsableContabilidad,
      Role.Auditor,
      Role.CoordinadorGobierno
    ]
  })
}

/**
 * Notificar a RRHH
 */
export async function notifyHRTeam(params: Omit<CreateNotificationParams, "roles" | "userId">) {
  return createNotification({
    ...params,
    roles: [Role.Admin, Role.DirectoraRRHH, Role.ResponsableRRHH]
  })
}

/**
 * Notificar a Caja/Tesorería
 */
export async function notifyCashTeam(params: Omit<CreateNotificationParams, "roles" | "userId">) {
  return createNotification({
    ...params,
    roles: [Role.Admin, Role.ResponsableCaja, Role.ContadorGeneral]
  })
}
