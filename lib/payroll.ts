import { prisma } from "./prisma"
import { emitPayrollEvent, PayrollEvent } from "./socket"
import { calculatePayroll } from "./payroll/calculations"

/**
 * Genera una nómina automática para todos los empleados con contrato activo.
 */
export async function generateAutomaticPayroll(
    mes: number,
    anio: number,
    descripcion: string,
    userId: string
) {
    // 1. Validar si ya existe nómina para este periodo
    const existing = await prisma.payroll.findFirst({
        where: { mes, anio, estado: { not: "ANULADO" } }
    })

    if (existing) {
        throw new Error(`Ya existe una nómina activa para ${mes}/${anio}`)
    }

    // 2. Obtener contratos activos
    const activeContracts = await prisma.contract.findMany({
        where: {
            estado: "ACTIVO",
            // TODO: Filtrar por fechaFin > inicioMes
        },
        include: { empleado: true }
    })

    if (activeContracts.length === 0) {
        throw new Error("No hay contratos activos para generar nómina")
    }

    // 3. Calcular Nómina
    let totalMontoNomina = 0 // Suma de Netos a Pagar? O Brutos? Usualmente Bruto.
    // Prisma 'totalMonto' en Payroll suele ser la suma de salarios base o total costo.
    // Usaremos Total A Pagar (Neto) para control de flujo de caja, 
    // pero lo estándar contable es Bruto.


    // Decisión PRO: Guardar Total Bruto en la cabecera, y los detalles tienen el neto.

    // Convertir a Promise.all para permitir queries asíncronas dentro del map
    const itemsData = await Promise.all(activeContracts.map(async contract => {
        const salarioBase = Number(contract.salarioBase)
        const calculos = calculatePayroll(salarioBase, contract.tipo)

        // Lógica de Ausencias (Deducciones)
        // Buscar permisos sin goce de sueldo en el mes
        const fechaInicioMes = new Date(anio, mes - 1, 1)
        const fechaFinMes = new Date(anio, mes, 0, 23, 59, 59)

        const ausencias = await prisma.leaveRequest.findMany({
            where: {
                empleadoId: contract.empleadoId,
                estado: 'APROBADO',
                conGoceSueldo: false,
                fechaInicio: {
                    gte: fechaInicioMes,
                    lte: fechaFinMes
                }
            }
        })

        const diasAusencia = ausencias.reduce((acc, curr) => acc + curr.dias, 0)
        // Cálculo deducción: Salario Diario * Días
        const deduccionAusencia = diasAusencia * (salarioBase / 30)

        // Validar cuenta bancaria
        if (!contract.empleado.numeroCuenta && !contract.empleado.banco) {
            // Log silent warning
        }

        const otrasDeducciones = deduccionAusencia
        const netoFinal = calculos.neto - otrasDeducciones

        // Actualizar acumulador global (Cuidado: esto dentro de Promise.all puede tener race conditions si no fuera atómico, 
        // pero aquí solo sumamos a una variable local antes de crear. En JS es seguro por el event loop)
        totalMontoNomina += salarioBase

        // Actualizar metadata con info de ausencias
        const metaInfo = {
            ...calculos.meta,
            diasAusencia,
            deduccionAusencia: round(deduccionAusencia)
        }

        return {
            empleadoId: contract.empleadoId,
            salarioBase: calculos.bruto,
            bonificaciones: 0,
            deducciones: calculos.totalDeducciones,
            inssLaboral: calculos.inssLaboral,
            ir: calculos.ir,
            inssPatronal: calculos.patronal.inss,
            inatec: calculos.patronal.inatec,
            otrasDeducciones: round(otrasDeducciones),
            totalNeto: round(netoFinal),
            detalles: JSON.stringify(metaInfo)
        }
    }))

    // 4. Crear Transacción
    const payroll = await prisma.payroll.create({
        data: {
            mes,
            anio,
            descripcion,
            totalMonto: totalMontoNomina,
            estado: "BORRADOR",
            creadoPorId: userId,
            items: {
                create: itemsData
            }
        },
        include: { items: true }
    })

    emitPayrollEvent(PayrollEvent.CREATED, payroll)
    return payroll
}

// Mantenemos legacy createPayroll por si acaso, pero simplificada
export async function createPayroll(data: any, userId: string) {
    // Si data trae items explícitos, usarlos. Si no, debería llamar a generateAutomaticPayroll
    // Como la API POST actual recibe todo el JSON, asumiremos que el frontend calculó (MAL).
    // Lo ideal es que la API llame a generateAutomaticPayroll si no vienen items.

    if (!data.items) {
        return generateAutomaticPayroll(data.mes, data.anio, data.descripcion, userId)
    }

    // Código original para creación manual
    if (data.items?.create) {
        const employeeIds = data.items.create.map((item: any) => item.empleadoId)
        const employeesWithoutBank = await prisma.employee.findMany({
            where: {
                id: { in: employeeIds },
                OR: [
                    { numeroCuenta: null },
                    { numeroCuenta: "" }
                ]
            },
            select: { nombre: true, apellido: true }
        })

        if (employeesWithoutBank.length > 0) {
            const names = employeesWithoutBank.map((e: { nombre: string; apellido: string }) => `${e.nombre} ${e.apellido}`).join(", ")
            // throw new Error(`Advertencia: Los siguientes empleados no tienen cuenta: ${names}`)
            // Bajamos a advertencia o permitimos si es manual
        }
    }

    const payroll = await prisma.payroll.create({
        data: {
            ...data,
            creadoPorId: userId
        }
    })

    emitPayrollEvent(PayrollEvent.CREATED, payroll)
    return payroll
}

export async function processPayroll(id: string) {
    // Aquí podríamos generar los Asientos Contables automáticamente
    // 1. Buscar Payroll
    // 2. Sumar INSS, IR, Salarios
    // 3. Crear AccountingEntry (Haber: Bancos, Debe: Gastos Sueldos, Haber: Retenciones por Pagar)

    const payroll = await prisma.payroll.update({
        where: { id },
        data: { estado: "PROCESADO" }
    })

    emitPayrollEvent(PayrollEvent.PROCESSED, payroll)
    return payroll
}

export async function payPayroll(id: string) {
    const payroll = await prisma.payroll.update({
        where: { id },
        data: {
            estado: "PAGADO",
            fechaPago: new Date()
        }
    })

    emitPayrollEvent(PayrollEvent.PAID, payroll)
    return payroll
}
