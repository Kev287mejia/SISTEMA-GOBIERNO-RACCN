"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PettyCashWorkflow } from "./petty-cash-workflow"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    FileText,
    Activity,
    User,
    Calendar,
    DollarSign,
    ShieldCheck,
    Ban
} from "lucide-react"

interface PettyMovementDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    movement: any
    onUpdate?: () => void
}

export function PettyMovementDetailDialog({
    open,
    onOpenChange,
    movement,
    onUpdate
}: PettyMovementDetailDialogProps) {
    if (!movement) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                Movimiento #{movement.id.slice(-6).toUpperCase()}
                                <Badge variant={movement.tipo === 'INGRESO' ? 'default' : 'secondary'} className="ml-2">
                                    {movement.tipo}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription>
                                Detalle completo del ciclo de aprobación y liquidación
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="workflow" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="workflow">Ciclo de Aprobación</TabsTrigger>
                        <TabsTrigger value="details">Detalles del Gasto</TabsTrigger>
                    </TabsList>

                    <TabsContent value="workflow" className="mt-4 p-1">
                        <PettyCashWorkflow
                            movementId={movement.id}
                            currentStatus={movement.estado}
                            amount={Number(movement.monto)}
                            onUpdate={() => {
                                if (onUpdate) onUpdate()
                                // Keep dialog open to see changes is okay, or close it? 
                                // Usually better to see the updated state.
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="details" className="space-y-6 mt-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold uppercase">Descripción</label>
                                    <p className="text-sm font-medium border p-3 rounded-md bg-slate-50 min-h-[60px]">
                                        {movement.descripcion}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-500 font-bold uppercase">Referencia</label>
                                        <p className="flex items-center gap-2 text-sm">
                                            <FileText className="h-4 w-4 text-slate-400" />
                                            {movement.referencia || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-500 font-bold uppercase">Fecha</label>
                                        <p className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            {format(new Date(movement.fecha), "PPP", { locale: es })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold uppercase">Solicitante</label>
                                    <div className="flex items-center gap-3 p-3 border rounded-md">
                                        <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{movement.usuario?.nombre} {movement.usuario?.apellido}</p>
                                            <p className="text-xs text-slate-500">{movement.usuario?.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold uppercase">Monto Total</label>
                                    <div className="flex items-center gap-2 text-2xl font-black text-slate-800">
                                        <DollarSign className="h-6 w-6 text-emerald-500" />
                                        {Number(movement.monto).toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-amber-500" /> Firmas de Auditoría
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                <div className="p-2 border rounded bg-slate-50">
                                    <span className="block text-slate-400 mb-1">Solicitado por</span>
                                    <span className="font-medium truncate block">{movement.usuario?.nombre || '-'}</span>
                                </div>
                                <div className="p-2 border rounded bg-slate-50">
                                    <span className="block text-slate-400 mb-1">Aprobado por</span>
                                    <span className="font-medium truncate block">{movement.approvedBy?.nombre || 'Pendiente'}</span>
                                </div>
                                <div className="p-2 border rounded bg-slate-50">
                                    <span className="block text-slate-400 mb-1">Autorizado por</span>
                                    <span className="font-medium truncate block">{movement.authorizedBy?.nombre || 'Pendiente'}</span>
                                </div>
                                <div className="p-2 border rounded bg-slate-50">
                                    <span className="block text-slate-400 mb-1">Liquidado por</span>
                                    <span className="font-medium truncate block">{movement.liquidatedBy?.nombre || 'Pendiente'}</span>
                                </div>
                            </div>
                        </div>

                        {movement.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 p-3 rounded-md flex gap-3 text-red-800">
                                <Ban className="h-5 w-5 shrink-0" />
                                <div>
                                    <p className="font-bold text-sm">Motivo de Rechazo</p>
                                    <p className="text-sm">{movement.rejectionReason}</p>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
