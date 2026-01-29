"use client"

import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Lock, Unlock, FileBarChart } from "lucide-react"
import { toast } from "sonner"

export function ClosuresTable() {
    const [closures, setClosures] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeClosure, setActiveClosure] = useState<any>(null)

    const fetchClosures = async () => {
        try {
            const res = await fetch("/api/caja/closures")
            if (res.ok) {
                const data = await res.json()
                setClosures(data)
                setActiveClosure(data.find((c: any) => c.estado === "ABIERTO"))
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClosures()
    }, [])

    const handleOpenClosure = async () => {
        const monto = prompt("Ingrese el monto inicial de caja (C$):", "0")
        if (monto === null) return

        try {
            const res = await fetch("/api/caja/closures", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: 'open', montoInicial: Number(monto) })
            })
            if (res.ok) {
                toast.success("Caja abierta correctamente")
                fetchClosures()
            } else {
                const err = await res.text()
                toast.error(err)
            }
        } catch (error) {
            toast.error("Error al abrir caja")
        }
    }

    const handleCloseClosure = async () => {
        if (!confirm("¿Está seguro de realizar el cierre de caja? Se bloquearán los movimientos.")) return

        try {
            const res = await fetch("/api/caja/closures", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: 'close' })
            })
            if (res.ok) {
                toast.success("Cierre de caja realizado correctamente")
                fetchClosures()
            } else {
                const err = await res.text()
                toast.error(err)
            }
        } catch (error) {
            toast.error("Error al cerrar caja")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Historial de Cierres</h3>
                <div className="flex gap-2">
                    {activeClosure ? (
                        <Button variant="destructive" className="gap-2" onClick={handleCloseClosure}>
                            <Lock className="h-4 w-4" />
                            Cerrar Caja Actual
                        </Button>
                    ) : (
                        <Button className="gap-2" onClick={handleOpenClosure}>
                            <Unlock className="h-4 w-4" />
                            Abrir Nueva Caja
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha Inicio</TableHead>
                            <TableHead>Fecha Fin</TableHead>
                            <TableHead>Monto Inicial</TableHead>
                            <TableHead>Ingresos</TableHead>
                            <TableHead>Egresos</TableHead>
                            <TableHead>Monto Final</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">Cargando...</TableCell>
                            </TableRow>
                        ) : closures.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">No hay cierres registrados</TableCell>
                            </TableRow>
                        ) : (
                            closures.map((c: any) => (
                                <TableRow key={c.id}>
                                    <TableCell>{format(new Date(c.fechaInicio), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                                    <TableCell>{c.estado === "CERRADO" ? format(new Date(c.fechaFin), "dd/MM/yyyy HH:mm", { locale: es }) : "-"}</TableCell>
                                    <TableCell className="font-mono">{Number(c.montoInicial).toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })}</TableCell>
                                    <TableCell className="font-mono text-green-600">+{Number(c.totalIngresos).toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })}</TableCell>
                                    <TableCell className="font-mono text-red-600">-{Number(c.totalEgresos).toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })}</TableCell>
                                    <TableCell className="font-mono font-bold">{Number(c.montoFinal).toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })}</TableCell>
                                    <TableCell>
                                        <Badge variant={c.estado === "CERRADO" ? "default" : "outline"}>
                                            {c.estado === "CERRADO" ? "Completado" : "Abierto"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <FileBarChart className="h-4 w-4" />
                                            Reporte
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
