"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const formSchema = z.object({
    tipo: z.enum(["INGRESO", "EGRESO", "AJUSTE"]),
    monto: z.string().min(1, "Monto es requerido"),
    descripcion: z.string().min(5, "Descripción debe ser detallada"),
    referencia: z.string().optional(),
    cuentaContable: z.string().optional(),
    centroCosto: z.string().optional(),
    crearAsiento: z.boolean(),
})

export function PettyMovementForm({ boxId, onSuccess }: { boxId: string, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tipo: "EGRESO",
            monto: "",
            descripcion: "",
            referencia: "",
            cuentaContable: "1102-01-01",
            centroCosto: "ADMINISTRACION",
            crearAsiento: true,
        },
    })

    async function onSubmit(values: any) {
        setLoading(true)
        try {
            const res = await fetch(`/api/caja-chica/${boxId}/movements`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    monto: Number(values.monto)
                }),
            })

            if (res.ok) {
                onSuccess()
            } else {
                const err = await res.text()
                toast.error(err || "Error al registrar movimiento")
            }
        } catch (error) {
            toast.error("Error de red")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="tipo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Operación</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="INGRESO">Reposición (Ingreso)</SelectItem>
                                        <SelectItem value="EGRESO">Gasto (Egreso)</SelectItem>
                                        <SelectItem value="AJUSTE">Ajuste de Saldo</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="monto"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Monto Transacción (C$)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción / Concepto</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Compra de papelería, Transporte..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="referencia"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Referencia de Documento (Factura/Recibo)</FormLabel>
                            <FormControl>
                                <Input placeholder="No. de documento" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <FormField
                        control={form.control}
                        name="cuentaContable"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs">Cuenta Contable</FormLabel>
                                <FormControl>
                                    <Input className="h-8 text-xs" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="centroCosto"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs">Centro de Costo</FormLabel>
                                <FormControl>
                                    <Input className="h-8 text-xs" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full bg-slate-900" disabled={loading}>
                    {loading ? "Procesando..." : "Registrar en Bitácora"}
                </Button>
            </form>
        </Form>
    )
}
