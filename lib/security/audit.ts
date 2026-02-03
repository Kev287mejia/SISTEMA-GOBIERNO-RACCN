import { prisma } from "@/lib/prisma";
import { Role, NotificationType } from "@prisma/client";
import { createNotification } from "@/lib/notifications";

export class SecurityAudit {
    /**
     * Analiza una operación contable en busca de anomalías
     */
    static async analyzeEntry(entry: any, userId: string, userName: string) {
        const alerts: string[] = [];
        const amount = Number(entry.monto);
        const now = new Date();
        const hour = now.getHours();

        // 1. Alerta por Montos Elevados (Umbral Institucional: > 500k C$)
        if (amount > 500000) {
            alerts.push(`Monto inusualmente elevado: ${amount.toLocaleString('es-NI')} C$`);
        }

        // 2. Alerta por Horario No Laboral (Fuera de 7 AM - 6 PM)
        if (hour < 7 || hour > 18) {
            alerts.push(`Operación registrada en horario no laboral (${hour}:00 hrs)`);
        }

        // 3. Alerta por ráfaga de transacciones (Más de 5 en 1 minuto por el mismo usuario)
        const oneMinuteAgo = new Date(now.getTime() - 60000);
        const recentCount = await prisma.accountingEntry.count({
            where: {
                creadoPorId: userId,
                createdAt: { gte: oneMinuteAgo }
            }
        });

        if (recentCount > 5) {
            alerts.push(`Detección de ráfaga de transacciones (${recentCount} en el último minuto)`);
        }

        // Si hay alertas, disparar notificaciones de seguridad
        if (alerts.length > 0) {
            console.warn(`[SECURITY_ALERT] Anomalía detectada para usuario ${userName}:`, alerts);

            await createNotification({
                type: NotificationType.WARNING,
                title: "⚠️ Alerta de Seguridad Contable",
                message: `El usuario ${userName} registró el asiento ${entry.numero} con posibles anomalías: ${alerts.join(". ")}`,
                link: `/contabilidad`,
                roles: [Role.Admin, Role.Auditor, Role.DirectoraDAF]
            });

            return { suspicious: true, alerts };
        }

        return { suspicious: false, alerts: [] };
    }
}
