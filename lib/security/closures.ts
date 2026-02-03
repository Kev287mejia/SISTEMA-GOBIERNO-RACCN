import { prisma } from "@/lib/prisma"

/**
 * Checks if a specific date falls within a closed accounting period.
 * @param date The date to check
 * @returns Promise<boolean> True if the period is closed
 */
export async function isPeriodLocked(date: Date | string): Promise<boolean> {
    const checkDate = typeof date === 'string' ? new Date(date) : date
    const mes = checkDate.getMonth() + 1 // JS months are 0-indexed
    const anio = checkDate.getFullYear()

    const closure = await prisma.accountingClosure.findUnique({
        where: {
            mes_anio: {
                mes,
                anio
            }
        }
    })

    return !!closure && closure.estado === 'CERRADO'
}

/**
 * Validates that an operation can be performed on a specific date.
 * Throws an error if the period is closed.
 */
export async function validatePeriodOrThrow(date: Date | string) {
    const locked = await isPeriodLocked(date)
    if (locked) {
        const checkDate = typeof date === 'string' ? new Date(date) : date
        const monthName = checkDate.toLocaleString('es-NI', { month: 'long' })
        const year = checkDate.getFullYear()
        throw new Error(`Operación denegada: El periodo contable de ${monthName} ${year} ya ha sido cerrado oficialmente.`)
    }
}
