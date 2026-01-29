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
import { Search, Plus, Filter } from "lucide-react"
import { CheckForm } from "./check-form"

export function ChecksTable() {
    const [checks, setChecks] = useState([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)

    const fetchChecks = async () => {
        try {
            const res = await fetch("/api/caja/checks")
            if (res.ok) {
                const data = await res.json()
                setChecks(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchChecks()
    }, [])

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Registro de Cheques</h3>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Registrar Cheque
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Registrar Cheque Entrante/Saliente</DialogTitle>
                        </DialogHeader>
                        <CheckForm onSuccess={() => {
                            setIsOpen(false)
                            fetchChecks()
                        }} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Número</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Banco</TableHead>
                            <TableHead>Beneficiario/Proveedor</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">Cargando...</TableCell>
                            </TableRow>
                        ) : checks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">No hay cheques registrados</TableCell>
                            </TableRow>
                        ) : (
                            checks.map((c: any) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-bold">{c.numero}</TableCell>
                                    <TableCell>
                                        <Badge variant={c.tipo === "RECIBIDO" ? "default" : "outline"}>
                                            {c.tipo === "RECIBIDO" ? "Entrante" : "Emitido"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{c.banco}</TableCell>
                                    <TableCell>{c.provider?.nombre || c.beneficiario}</TableCell>
                                    <TableCell className="font-mono">
                                        {Number(c.monto).toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })}
                                    </TableCell>
                                    <TableCell>{format(new Date(c.fecha), "dd MMM yyyy", { locale: es })}</TableCell>
                                    <TableCell>
                                        <Badge variant={c.estado === "VALIDADO" ? "default" : "secondary"}>
                                            {c.estado === "PENDIENTE_VALIDACION" ? "Pendiente" : c.estado}
                                        </Badge>
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
