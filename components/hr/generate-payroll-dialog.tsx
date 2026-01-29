"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import {
    Users,
    Calculator,
    AlertCircle,
    Loader2,
    CheckCircle2,
    FileText,
    AlertTriangle,
    XCircle
} from "lucide-react"
import { toast } from "sonner"

interface GeneratePayrollDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export function GeneratePayrollDialog({ open, onOpenChange, onSuccess }: GeneratePayrollDialogProps) {
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [employees, setEmployees] = useState<any[]>([])
    const [employeesMissingBank, setEmployeesMissingBank] = useState<any[]>([])
    const [configs, setConfigs] = useState<any>({ hr_ss_percent: 0, hr_patronal_percent: 0 })
    const [formData, setFormData] = useState({
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear(),
        descripcion: `Nómina Ordinaria ${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`
    })

    useEffect(() => {
        if (open) {
            fetchEligibleEmployees()
        }
    }, [open])

    const fetchEligibleEmployees = async () => {
        setFetching(true)
        try {
            const resSettings = await fetch("/api/settings")
            if (resSettings.ok) {
                const settingsData = await resSettings.json()
                const hrConfigs = settingsData.reduce((acc: any, s: any) => {
                    if (s.group === 'RRHH') acc[s.key] = Number(s.value)
                    return acc
                }, {})
                setConfigs(hrConfigs)
            }

            const res = await fetch("/api/hr/employees")
            if (res.ok) {
                const data = await res.json()
                const eligible = data.filter((emp: any) => emp.contratos && emp.contratos.length > 0)
                setEmployees(eligible)

                const missing = eligible.filter((emp: any) => !emp.numeroCuenta)
                setEmployeesMissingBank(missing)

                setFormData(prev => ({
                    ...prev,
                    descripcion: `Nómina Ordinaria ${MONTHS[prev.mes - 1]} ${prev.anio}`
                }))
            }
        } catch (error) {
            console.error("Error fetching employees or settings for payroll", error)
            toast.error("Error al cargar lista de empleados o configuración")
        } finally {
            setFetching(false)
        }
    }

    const calculateTotals = () => {
        return employees.reduce((sum, emp) => {
            const salarioBase = Number(emp.contratos[0].salarioBase)
            const ssPercent = configs.hr_ss_percent || 0
            const deducciones = salarioBase * (ssPercent / 100)
            const totalNeto = salarioBase - deducciones
            return sum + totalNeto
        }, 0)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (employees.length === 0) {
            toast.error("No hay empleados elegibles para generar la nómina")
            return
        }

        if (employeesMissingBank.length > 0) {
            toast.error("No se puede generar la nómina", {
                description: `Hay ${employeesMissingBank.length} funcionario(s) sin número de cuenta bancaria registrado.`,
                duration: 5000,
            })
            return
        }

        setLoading(true)
        try {
            const ssPercent = configs.hr_ss_percent || 0
            const items = employees.map(emp => {
                const salarioBase = Number(emp.contratos[0].salarioBase)
                const deducciones = salarioBase * (ssPercent / 100)
                const totalNeto = salarioBase - deducciones

                return {
                    empleadoId: emp.id,
                    salarioBase,
                    bonificaciones: 0,
                    deducciones,
                    totalNeto,
                    detalles: `Pago ordinario - Ded. SS (${ssPercent}%)`
                }
            })

            const totalMonto = items.reduce((sum, item) => sum + item.totalNeto, 0)

            const res = await fetch("/api/hr/payroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mes: Number(formData.mes),
                    anio: Number(formData.anio),
                    descripcion: formData.descripcion,
                    totalMonto,
                    items: {
                        create: items
                    }
                })
            })

            if (res.ok) {
                toast.success("Nómina generada exitosamente", {
                    description: `Se han procesado ${items.length} pagos para el periodo ${MONTHS[formData.mes - 1]} ${formData.anio}.`
                })
                onSuccess()
                onOpenChange(false)
            } else {
                throw new Error("Failed to create payroll")
            }
        } catch (error) {
            console.error("Error creating payroll", error)
            toast.error("Error al generar la nómina", {
                description: "Ocurrió un error técnico al intentar procesar los registros."
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl overflow-hidden p-0 gap-0 border-none rounded-2xl shadow-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="p-8 bg-indigo-600 text-white leading-relaxed">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <Calculator className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Generar Nueva Nómina</DialogTitle>
                                <p className="text-indigo-100/70 text-xs font-medium uppercase tracking-widest mt-1">Cálculo de haberes y deducciones fiscales</p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 bg-white space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-gray-400">Mes de Operación</Label>
                                <select
                                    className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
                                    value={formData.mes}
                                    onChange={(e) => {
                                        const m = Number(e.target.value)
                                        setFormData(prev => ({
                                            ...prev,
                                            mes: m,
                                            descripcion: `Nómina Ordinaria ${MONTHS[m - 1]} ${prev.anio}`
                                        }))
                                    }}
                                >
                                    {MONTHS.map((month, idx) => (
                                        <option key={month} value={idx + 1}>{month}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-gray-400">Año Fiscal</Label>
                                <Input
                                    type="number"
                                    className="h-11 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold"
                                    value={formData.anio}
                                    onChange={(e) => {
                                        const a = Number(e.target.value)
                                        setFormData(prev => ({
                                            ...prev,
                                            anio: a,
                                            descripcion: `Nómina Ordinaria ${MONTHS[prev.mes - 1]} ${a}`
                                        }))
                                    }}
                                />
                            </div>
                            <div className="md:col-span-1 space-y-2 flex flex-col justify-end">
                                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-3">
                                    <Users className="h-5 w-5 text-indigo-600" />
                                    <div>
                                        <p className="text-[9px] font-black text-indigo-700 uppercase">Personal Elegible</p>
                                        <p className="text-sm font-black text-indigo-900">{fetching ? "..." : employees.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-gray-400">Descripción de la Planilla</Label>
                            <Input
                                className="h-11 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold"
                                value={formData.descripcion}
                                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText className="h-3.5 w-3.5" /> Resumen de Pre-Cálculo
                                </h3>
                            </div>

                            {fetching ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                </div>
                            ) : employees.length === 0 ? (
                                <div className="p-8 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col items-center text-center gap-2">
                                    <AlertCircle className="h-8 w-8 text-amber-500" />
                                    <p className="text-sm font-bold text-amber-700">No se encontraron empleados con contratos activos</p>
                                    <p className="text-xs text-amber-600">Asegúrese de que el personal tenga cargos asignados antes de generar la nómina.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {employeesMissingBank.length > 0 && (
                                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex flex-col gap-3">
                                            <div className="flex items-center gap-2 text-red-700">
                                                <XCircle className="h-5 w-5" />
                                                <p className="text-xs font-black uppercase tracking-tight">Bloqueo de Seguridad: Datos Incompletos</p>
                                            </div>
                                            <p className="text-[11px] text-red-600 font-medium">
                                                Se han detectado <span className="font-black">{employeesMissingBank.length} funcionario(s)</span> sin número de cuenta bancaria. Es obligatorio para la dispersión de fondos.
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {employeesMissingBank.slice(0, 3).map((emp: any) => (
                                                    <Badge key={emp.id} variant="outline" className="bg-white border-red-200 text-red-600 text-[9px] font-bold">
                                                        {emp.nombre} {emp.apellido}
                                                    </Badge>
                                                ))}
                                                {employeesMissingBank.length > 3 && (
                                                    <Badge variant="outline" className="bg-white border-red-200 text-red-600 text-[9px] font-bold">
                                                        + {employeesMissingBank.length - 3} más
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className={`rounded-2xl p-6 text-white relative overflow-hidden transition-all ${employeesMissingBank.length > 0 ? 'bg-gray-400 grayscale' : 'bg-gray-900 shadow-xl shadow-indigo-100'}`}>
                                        <div className="absolute top-0 right-0 p-6 opacity-10">
                                            {employeesMissingBank.length > 0 ? <AlertTriangle className="h-24 w-24" /> : <CheckCircle2 className="h-24 w-24" />}
                                        </div>
                                        <div className="relative z-10 grid grid-cols-2 gap-8">
                                            <div>
                                                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Inversión Bruta Estimada</p>
                                                <p className="text-3xl font-black mt-1">{formatCurrency(calculateTotals())}</p>
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <Badge className={`w-fit border-none font-black text-[9px] uppercase tracking-widest mb-2 ${employeesMissingBank.length > 0 ? 'bg-gray-500' : 'bg-emerald-500 text-white'}`}>
                                                    {employeesMissingBank.length > 0 ? 'Validación Fallida' : 'Cálculo Automático'}
                                                </Badge>
                                                <p className="text-[10px] text-gray-400 font-medium">
                                                    {employeesMissingBank.length > 0
                                                        ? 'Corrija los expedientes de personal para habilitar la generación.'
                                                        : `Basado en ${employees.length} contratos con ${configs.hr_ss_percent}% de deducción SS.`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between sm:justify-between">
                        <div className="flex items-center gap-2 italic text-[10px] text-gray-400 font-black uppercase">
                            <AlertCircle className="h-3.5 w-3.5" /> Verificar configuración antes de procesar
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl font-black text-[10px] uppercase h-11 px-6 border-gray-200"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className={`rounded-xl font-black text-[10px] uppercase h-11 px-8 transition-all ${employeesMissingBank.length > 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100'}`}
                                disabled={loading || fetching || employees.length === 0 || employeesMissingBank.length > 0}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    "Confirmar y Generar"
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
