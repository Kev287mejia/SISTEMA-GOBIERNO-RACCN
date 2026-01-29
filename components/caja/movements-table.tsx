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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { MovementForm } from "./movement-form"

export function MovementsTable() {
    const [movements, setMovements] = useState([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)

    const fetchMovements = async () => {
        try {
            const res = await fetch("/api/caja/movements")
            if (res.ok) {
                const data = await res.json()
                setMovements(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMovements()
    }, [])

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Historial de Movimientos</h3>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nuevo Movimiento
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Registrar Movimiento de Caja</DialogTitle>
                        </DialogHeader>
                        <MovementForm onSuccess={() => {
                            setIsOpen(false)
                            fetchMovements()
                        }} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Referencia</TableHead>
                            <TableHead>Responsable</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">Cargando...</TableCell>
                            </TableRow>
                        ) : movements.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">No hay movimientos registrados</TableCell>
                            </TableRow>
                        ) : (
                            movements.map((m: any) => (
                                <TableRow key={m.id}>
                                    <TableCell>{format(new Date(m.fecha), "dd MMM yyyy HH:mm", { locale: es })}</TableCell>
                                    <TableCell>
                                        <Badge variant={m.tipo === "INGRESO" ? "default" : "destructive"}>
                                            {m.tipo}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono">
                                        {Number(m.monto).toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })}
                                    </TableCell>
                                    <TableCell>{m.descripcion}</TableCell>
                                    <TableCell>{m.referencia || "-"}</TableCell>
                                    <TableCell>{m.usuario.nombre} {m.usuario.apellido}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
