import { prisma } from "./prisma"
import { emitPayrollEvent, PayrollEvent } from "./socket"

export async function createPayroll(data: any, userId: string) {
    // Backend Validation: Ensure all employees have a bank account number
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
            throw new Error(`No se puede generar la nómina: Los siguientes empleados no tienen número de cuenta: ${names}`)
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
