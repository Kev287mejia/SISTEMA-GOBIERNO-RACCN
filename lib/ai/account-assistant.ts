import { prisma } from "@/lib/prisma";

/**
 * Mapeo Base de Cuentas Institucionales (GRACCNN)
 * Basado en el Clasificador Presupuestario y Contable Gubernamental
 */
const BASE_MAPPING: Record<string, { code: string; name: string }> = {
    "servicio basico": { code: "2-1-01-001", name: "Servicios Básicos" },
    "energia": { code: "2-1-01-002", name: "Servicio de Energía Eléctrica" },
    "luz": { code: "2-1-01-002", name: "Servicio de Energía Eléctrica" },
    "agua": { code: "2-1-01-003", name: "Servicio de Agua" },
    "telefono": { code: "2-1-01-004", name: "Servicio de Telefonía" },
    "internet": { code: "2-1-01-005", name: "Servicio de Internet" },
    "combustible": { code: "2-1-02-001", name: "Combustibles y Lubricantes" },
    "gasolina": { code: "2-1-02-001", name: "Combustibles y Lubricantes" },
    "papeleria": { code: "2-1-02-005", name: "Suministros de Oficina" },
    "oficina": { code: "2-1-02-005", name: "Suministros de Oficina" },
    "viatico": { code: "2-1-03-001", name: "Viáticos y Gastos de Viaje" },
    "transporte": { code: "2-1-03-002", name: "Pasajes y Gastos de Transporte" },
    "reparacion": { code: "2-1-04-001", name: "Mantenimiento y Reparaciones" },
    "limpieza": { code: "2-1-02-008", name: "Productos de Limpieza" },
    "alquiler": { code: "2-1-01-008", name: "Alquiler de Inmuebles" },
    "honorario": { code: "2-1-05-001", name: "Servicios Profesionales" },
    "nomina": { code: "2-1-06-001", name: "Sueldos y Salarios" },
    "planilla": { code: "2-1-06-001", name: "Sueldos y Salarios" },
    "seguro": { code: "2-1-07-001", name: "Seguros y Fianzas" },
    "publicidad": { code: "2-1-08-001", name: "Servicios de Publicidad" },
    "capacitacion": { code: "2-1-05-002", name: "Servicios de Capacitación" },
    "mantenimiento": { code: "2-1-04-001", name: "Mantenimiento y Reparaciones" },
    "compra": { code: "2-1-02-005", name: "Suministros de Oficina" },
};

export class AccountAssistant {
    /**
     * Sugiere una cuenta contable basada en la descripción
     */
    static async suggestAccount(description: string) {
        if (!description || description.length < 3) return null;

        const query = description.toLowerCase().trim();

        // 1. Prioridad: Búsqueda por Historial Real (Aprendizaje del Sistema)
        const history = await prisma.accountingEntry.findMany({
            where: {
                descripcion: {
                    contains: query,
                    mode: 'insensitive'
                }
            },
            take: 10,
            select: {
                cuentaContable: true
            }
        });

        if (history.length > 0) {
            // Contar frecuencias
            const counts: Record<string, number> = {};
            history.forEach(h => {
                counts[h.cuentaContable] = (counts[h.cuentaContable] || 0) + 1;
            });

            // Obtener la más frecuente
            const suggestedCode = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];

            // Intentar buscar el nombre en nuestro mapeo base o retornar el código
            const baseInfo = Object.values(BASE_MAPPING).find(m => m.code === suggestedCode);

            return {
                code: suggestedCode,
                name: baseInfo?.name || "Cuenta según historial",
                confidence: "high",
                source: "history"
            };
        }

        // 2. Fallback: Búsqueda por Palabras Clave (Mapping Estático)
        for (const [keyword, info] of Object.entries(BASE_MAPPING)) {
            if (query.includes(keyword)) {
                return {
                    ...info,
                    confidence: "medium",
                    source: "rules"
                };
            }
        }

        return null;
    }
}
