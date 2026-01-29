import { prisma } from './prisma'

export interface SuspiciousActivity {
    type: 'MULTIPLE_FAILED_LOGINS' | 'ACCOUNT_LOCKED' | 'UNUSUAL_LOCATION' | 'MULTIPLE_SESSIONS' | 'PERMISSION_ESCALATION' | 'BULK_OPERATIONS'
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    userId: string
    description: string
    metadata?: Record<string, any>
}

/**
 * Detecta y registra actividades sospechosas
 */
export async function detectSuspiciousActivity(activity: SuspiciousActivity): Promise<void> {
    // Registrar en auditoría
    await prisma.auditLog.create({
        data: {
            accion: 'CREATE',
            entidad: 'SecurityAlert',
            entidadId: activity.userId,
            descripcion: `[${activity.severity}] ${activity.type}: ${activity.description}`,
            usuarioId: activity.userId,
            datosNuevos: {
                type: activity.type,
                severity: activity.severity,
                metadata: activity.metadata
            }
        }
    })

    // Si es crítico, enviar notificación inmediata
    if (activity.severity === 'CRITICAL' || activity.severity === 'HIGH') {
        await sendSecurityAlert(activity)
    }
}

/**
 * Envía alerta de seguridad a administradores
 */
async function sendSecurityAlert(activity: SuspiciousActivity): Promise<void> {
    // Obtener usuario
    const user = await prisma.user.findUnique({
        where: { id: activity.userId },
        select: { email: true, nombre: true, apellido: true, role: true }
    })

    if (!user) return

    // Obtener administradores
    const admins = await prisma.user.findMany({
        where: {
            role: { in: ['Admin', 'ContadorGeneral'] },
            activo: true
        },
        select: { email: true }
    })

    const alertMessage = `
🚨 ALERTA DE SEGURIDAD - ${activity.severity}

Tipo: ${activity.type}
Usuario: ${user.nombre} ${user.apellido} (${user.email})
Rol: ${user.role}
Descripción: ${activity.description}
Fecha: ${new Date().toLocaleString('es-NI')}

${activity.metadata ? `Detalles: ${JSON.stringify(activity.metadata, null, 2)}` : ''}

---
Sistema de Contabilidad GRACCNN
  `.trim()

    console.log('🚨 ALERTA DE SEGURIDAD:', alertMessage)

    // TODO: Integrar con servicio de email
    // await sendEmail({
    //   to: admins.map(a => a.email),
    //   subject: `[SEGURIDAD ${activity.severity}] ${activity.type}`,
    //   body: alertMessage
    // })
}

/**
 * Monitorea intentos de login fallidos
 */
export async function monitorFailedLogins(userId: string, attempts: number): Promise<void> {
    if (attempts >= 3) {
        await detectSuspiciousActivity({
            type: 'MULTIPLE_FAILED_LOGINS',
            severity: attempts >= 5 ? 'HIGH' : 'MEDIUM',
            userId,
            description: `${attempts} intentos de login fallidos`,
            metadata: { attempts }
        })
    }
}

/**
 * Monitorea bloqueos de cuenta
 */
export async function monitorAccountLock(userId: string, duration: number): Promise<void> {
    await detectSuspiciousActivity({
        type: 'ACCOUNT_LOCKED',
        severity: 'HIGH',
        userId,
        description: `Cuenta bloqueada por ${duration} minutos`,
        metadata: { durationMinutes: duration }
    })
}

/**
 * Monitorea operaciones en masa
 */
export async function monitorBulkOperations(
    userId: string,
    operation: string,
    count: number,
    threshold: number = 10
): Promise<void> {
    if (count >= threshold) {
        await detectSuspiciousActivity({
            type: 'BULK_OPERATIONS',
            severity: count >= threshold * 2 ? 'HIGH' : 'MEDIUM',
            userId,
            description: `${count} operaciones de ${operation} en corto tiempo`,
            metadata: { operation, count, threshold }
        })
    }
}

/**
 * Monitorea cambios de permisos
 */
export async function monitorPermissionChange(
    userId: string,
    targetUserId: string,
    oldRole: string,
    newRole: string
): Promise<void> {
    const privilegedRoles = ['Admin', 'ContadorGeneral', 'Auditor']

    if (privilegedRoles.includes(newRole) && !privilegedRoles.includes(oldRole)) {
        await detectSuspiciousActivity({
            type: 'PERMISSION_ESCALATION',
            severity: 'CRITICAL',
            userId,
            description: `Elevación de privilegios: ${oldRole} → ${newRole}`,
            metadata: { targetUserId, oldRole, newRole }
        })
    }
}

/**
 * Obtiene alertas recientes
 */
export async function getRecentAlerts(hours: number = 24): Promise<any[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    return await prisma.auditLog.findMany({
        where: {
            entidad: 'SecurityAlert',
            fecha: { gte: since }
        },
        orderBy: { fecha: 'desc' },
        take: 100,
        include: {
            usuario: {
                select: {
                    email: true,
                    nombre: true,
                    apellido: true,
                    role: true
                }
            }
        }
    })
}

/**
 * Obtiene estadísticas de seguridad
 */
export async function getSecurityStats(days: number = 7): Promise<{
    totalAlerts: number
    criticalAlerts: number
    highAlerts: number
    failedLogins: number
    lockedAccounts: number
    alertsByType: Record<string, number>
}> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const alerts = await prisma.auditLog.findMany({
        where: {
            entidad: 'SecurityAlert',
            fecha: { gte: since }
        }
    })

    const stats = {
        totalAlerts: alerts.length,
        criticalAlerts: 0,
        highAlerts: 0,
        failedLogins: 0,
        lockedAccounts: 0,
        alertsByType: {} as Record<string, number>
    }

    alerts.forEach(alert => {
        const data = alert.datosNuevos as any

        if (data.severity === 'CRITICAL') stats.criticalAlerts++
        if (data.severity === 'HIGH') stats.highAlerts++

        if (data.type === 'MULTIPLE_FAILED_LOGINS') stats.failedLogins++
        if (data.type === 'ACCOUNT_LOCKED') stats.lockedAccounts++

        stats.alertsByType[data.type] = (stats.alertsByType[data.type] || 0) + 1
    })

    return stats
}
