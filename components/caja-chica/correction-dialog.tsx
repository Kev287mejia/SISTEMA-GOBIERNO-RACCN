"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"

export function PettyCorrectionDialog({
    open,
    onOpenChange,
    movement,
    onSuccess
}: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    movement: any,
    onSuccess: () => void
}) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        descripcion: movement?.descripcion || "",
        referencia: movement?.referencia || "",
        monto: movement?.monto?.toString() || "",
        observaciones: movement?.observaciones || ""
    })

    const handleUpdate = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/caja-chica/movements/${movement.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    monto: Number(formData.monto),
                    inconsistente: false // Clear inconsistency flag upon correction
                })
            })

            if (res.ok) {
                toast.success("Registro corregido satisfactoriamente")
                onSuccess()
                onOpenChange(false)
            } else {
                toast.error("Error al actualizar registro")
            }
        } catch (error) {
            toast.error("Error de red")
        } finally {
            setLoading(false)
        }
    }

    if (!movement) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        Corregir Registro de Caja Chica
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Concepto / Descripción</Label>
                        <Input
                            value={formData.descripcion}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, descripcion: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Referencia</Label>
                            <Input
                                value={formData.referencia}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, referencia: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Monto (C$)</Label>
                            <Input
                                type="number"
                                value={formData.monto}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, monto: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Observaciones de Corrección</Label>
                        <Textarea
                            placeholder="Describa el cambio realizado..."
                            value={formData.observaciones}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, observaciones: e.target.value })}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button className="bg-slate-900" onClick={handleUpdate} disabled={loading}>
                        {loading ? "Guardando..." : "Guardar Corrección"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
