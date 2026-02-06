
import { Decimal } from "@prisma/client/runtime/library"

// --- CONFIGURACIÓN FISCAL NICARAGUA ---

export const TAX_RATES = {
    INSS_LABORAL: 0.07,      // 7.00%
    INSS_PATRONAL: 0.225,    // 22.5% (Régimen General, varía a 21.5% si <50 empleados)
    INATEC_PATRONAL: 0.02    // 2.00%
}

// Tabla Progresiva IR Anual (Fuente: DGI Nicaragua)
// De 0 a 100,000 -> 0%
// De 100,000.01 a 200,000 -> 15% (Base: 0, Exceso de: 100,000)
// De 200,000.01 a 350,000 -> 20% (Base: 15,000, Exceso de: 200,000)
// De 350,000.01 a 500,000 -> 25% (Base: 45,000, Exceso de: 350,000)
// De 500,000.01 en adelante -> 30% (Base: 82,500, Exceso de: 500,000)

type IRBracket = {
    desde: number
    hasta: number
    porcentaje: number
    impuestoBase: number
    sobreExceso: number
}

const IR_TABLE_ANNUAL: IRBracket[] = [
    { desde: 0, hasta: 100000, porcentaje: 0, impuestoBase: 0, sobreExceso: 0 },
    { desde: 100000.01, hasta: 200000, porcentaje: 0.15, impuestoBase: 0, sobreExceso: 100000 },
    { desde: 200000.01, hasta: 350000, porcentaje: 0.20, impuestoBase: 15000, sobreExceso: 200000 },
    { desde: 350000.01, hasta: 500000, porcentaje: 0.25, impuestoBase: 45000, sobreExceso: 350000 },
    { desde: 500000.01, hasta: 999999999, porcentaje: 0.30, impuestoBase: 82500, sobreExceso: 500000 },
]

// --- UTILIDADES ---

const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100

// --- MOTOR DE CÁLCULO ---

export function calculatePayroll(salarioMensual: number, tipoContrato: string = "INDEFINIDO") {
    // 1. Validaciones
    if (salarioMensual < 0) throw new Error("Salario no puede ser negativo")

    let inssLaboral = 0
    let irMensual = 0
    let inssPatronal = 0
    let inatec = 0
    let rentaNetaAnual = 0
    let bracketDesc = "0%"

    if (tipoContrato === "SERVICIOS") {
        // Servicios Profesionales: Retención IR 10% (Simplificado)
        // No aplica INSS
        irMensual = round(salarioMensual * 0.10)
        bracketDesc = "10% (Servicios)"
    } else if (tipoContrato === "PASANTIA") {
        // Pasantía: Usualmente exento o subsidio
        // Dejamos en 0 por defecto
    } else {
        // Régimen Laboral Standard (INDEFINIDO, FIJO)

        // 2. INSS Laboral
        inssLaboral = round(salarioMensual * TAX_RATES.INSS_LABORAL)

        // 3. Renta Neta Gravable Mensual (Salario - INSS)
        const rentaNetaMensual = salarioMensual - inssLaboral

        // 4. Proyección Anual IR
        rentaNetaAnual = rentaNetaMensual * 12

        // 5. Cálculo IR Anual
        let irAnual = 0
        // Buscar estrato
        const bracket = IR_TABLE_ANNUAL.find(b => rentaNetaAnual >= b.desde && rentaNetaAnual <= b.hasta)

        if (bracket && bracket.porcentaje > 0) {
            const excedente = rentaNetaAnual - bracket.sobreExceso
            const impuestoExcedente = excedente * bracket.porcentaje
            irAnual = impuestoExcedente + bracket.impuestoBase
            bracketDesc = `${bracket.porcentaje * 100}%`
        }

        // 6. IR Mensual
        irMensual = round(irAnual / 12)

        // 7. Cargas Patronales (No se deducen al empleado, pero se calculan)
        inssPatronal = round(salarioMensual * TAX_RATES.INSS_PATRONAL)
        inatec = round(salarioMensual * TAX_RATES.INATEC_PATRONAL)
    }

    // 8. Totales
    const totalDeduccionesEmpleado = round(inssLaboral + irMensual)
    const netoRecibir = round(salarioMensual - totalDeduccionesEmpleado)
    const costoTotalEmpresa = round(salarioMensual + inssPatronal + inatec)

    return {
        bruto: salarioMensual,
        inssLaboral,
        ir: irMensual,
        totalDeducciones: totalDeduccionesEmpleado,
        neto: netoRecibir,
        patronal: {
            inss: inssPatronal,
            inatec: inatec,
            costoTotal: costoTotalEmpresa
        },
        meta: {
            tipoContrato,
            rentaNetaAnualProyectada: round(rentaNetaAnual),
            tasaInss: inssLaboral > 0 ? TAX_RATES.INSS_LABORAL : 0,
            estratoIr: bracketDesc
        }
    }
}
