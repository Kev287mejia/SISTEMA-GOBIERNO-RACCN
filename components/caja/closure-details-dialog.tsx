
"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Loader2, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ClosureDetailsDialogProps {
    closure: any
    isOpen: boolean
    onClose: () => void
}

export function ClosureDetailsDialog({ closure, isOpen, onClose }: ClosureDetailsDialogProps) {
    const [movements, setMovements] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isOpen && closure?.id) {
            setLoading(true)
            fetch(`/api/caja/movements?closureId=${closure.id}`)
                .then(res => res.json())
                .then(data => setMovements(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false))
        }
    }, [isOpen, closure])

    if (!closure) return null

    const handlePrint = () => {
        window.print()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center">
                        <span>Reporte de Cierre de Caja</span>
                        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 print:hidden">
                            <Printer className="h-4 w-4" />
                            Imprimir
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 print:space-y-4">
                    {/* Header Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Responsable</p>
                            <p className="font-medium">{closure.usuario?.nombre} {closure.usuario?.apellido}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Fecha Apertura</p>
                            <p className="font-medium">{format(new Date(closure.fechaInicio), "dd/MM/yyyy HH:mm", { locale: es })}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Fecha Cierre</p>
                            <p className="font-medium">
                                {closure.fechaFin ? format(new Date(closure.fechaFin), "dd/MM/yyyy HH:mm", { locale: es }) : "En Curso"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Estado</p>
                            <Badge variant={closure.estado === "CERRADO" ? "default" : "secondary"}>
                                {closure.estado}
                            </Badge>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Saldo Inicial</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-700">
                                    {Number(closure.montoInicial).toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Total Ingresos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-600">
                                    +{Number(closure.totalIngresos).toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Total Egresos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-rose-600">
                                    -{Number(closure.totalEgresos).toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900 text-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-medium uppercase text-slate-400">Saldo Final</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {Number(closure.montoFinal).toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Movements Detail */}
                    <div>
                        <h4 className="text-sm font-bold uppercase mb-4 flex items-center gap-2">
                            <Loader2 className={`h-4 w-4 animate-spin ${loading ? 'block' : 'hidden'}`} />
                            Detalle de Movimientos
                        </h4>
                        <div className="rounded-md border bg-white">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Hora</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead className="text-right">Monto</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {movements.length === 0 && !loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                No se registraron movimientos en este turno.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        movements.map((m: any) => (
                                            <TableRow key={m.id}>
                                                <TableCell className="font-mono text-xs">
                                                    {format(new Date(m.fecha), "HH:mm", { locale: es })}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={m.tipo === "INGRESO" ? "outline" : "destructive"} className="text-[10px]">
                                                        {m.tipo}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">{m.descripcion}</TableCell>
                                                <TableCell className={`text-right font-mono font-bold ${m.tipo === "INGRESO" ? "text-emerald-600" : "text-rose-600"}`}>
                                                    {m.tipo === "INGRESO" ? "+" : "-"}
                                                    {Number(m.monto).toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
