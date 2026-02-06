"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Loader2, CheckCircle2 } from "lucide-react"

export function LeaveRequestDialog({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)
    const [employees, setEmployees] = useState<any[]>([])

    // Form Data
    const [empleadoId, setEmpleadoId] = useState("")
    const [error, setError] = useState("")
    const [tipo, setTipo] = useState("VACACIONES")
    const [fechaInicio, setFechaInicio] = useState("")
    const [fechaFin, setFechaFin] = useState("")
    const [motivo, setMotivo] = useState("")
    const [conGoce, setConGoce] = useState("true")

    useEffect(() => {
        if (open) {
            setError("")
            // Load employees (simple list)
            fetch("/api/hr/employees").then(res => res.json()).then(setEmployees)
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            const res = await fetch("/api/hr/leaves", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    empleadoId,
                    tipo,
                    fechaInicio,
                    fechaFin,
                    motivo,
                    conGoceSueldo: conGoce === "true"
                })
            })

            if (res.ok) {
                onSuccess()
                onOpenChange(false)
                // Reset form
                setEmpleadoId("")
                setMotivo("")
            } else {
                const txt = await res.text()
                setError(txt || "Error al procesar la solicitud. Verifica los datos.")
            }
        } catch (error) {
            console.error(error)
            setError("Error de conexión con el servidor")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-800">Registrar Ausencia / Permiso</DialogTitle>
                </DialogHeader>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-bold flex items-center gap-2 mt-2">
                        <span className="flex-1">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="space-y-1">
                        <Label>Colaborador</Label>
                        <Select value={empleadoId} onValueChange={setEmpleadoId} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione colaborador..." />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((emp: any) => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.nombre} {emp.apellido} ({emp.cedula})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Tipo de Ausencia</Label>
                            <Select value={tipo} onValueChange={setTipo}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="VACACIONES">Vacaciones</SelectItem>
                                    <SelectItem value="PERMISO_PERSONAL">Permiso Personal</SelectItem>
                                    <SelectItem value="ENFERMEDAD">Enfermedad / Subsidio</SelectItem>
                                    <SelectItem value="MATERNIDAD">Maternidad</SelectItem>
                                    <SelectItem value="OTROS">Otros</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Remuneración</Label>
                            <Select value={conGoce} onValueChange={setConGoce}>
                                <SelectTrigger className={conGoce === "false" ? "border-red-200 bg-red-50 text-red-700 font-bold" : "border-emerald-200 bg-emerald-50 text-emerald-700 font-bold"}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Con Goce de Sueldo</SelectItem>
                                    <SelectItem value="false">Sin Goce (Deducible)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Desde</Label>
                            <Input type="date" required value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Hasta</Label>
                            <Input type="date" required value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Motivo / Observaciones</Label>
                        <Textarea
                            placeholder="Describa la justificación..."
                            value={motivo}
                            onChange={e => setMotivo(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar Ausencia"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
