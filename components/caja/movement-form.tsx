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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { toast } from "sonner"

const formSchema = z.object({
    tipo: z.enum(["INGRESO", "EGRESO"]),
    monto: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Monto debe ser mayor a 0"),
    descripcion: z.string().min(3, "Descripción es requerida"),
    referencia: z.string().optional(),
    institucion: z.enum(["GOBIERNO", "CONCEJO"]),
})

export function MovementForm({
    onSuccess,
    defaultValues
}: {
    onSuccess: () => void,
    defaultValues?: Partial<z.infer<typeof formSchema>>
}) {
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tipo: "INGRESO",
            monto: "",
            descripcion: "",
            referencia: "",
            institucion: "GOBIERNO",
            ...defaultValues
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const res = await fetch("/api/caja/movements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    monto: Number(values.monto)
                }),
            })

            if (res.ok) {
                toast.success("Movimiento registrado correctamente")
                onSuccess()
            } else {
                const err = await res.text()
                toast.error(err || "Error al registrar movimiento")
            }
        } catch (error) {
            toast.error("Error de conexión")
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
                                <FormLabel>Tipo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="INGRESO">Ingreso (+)</SelectItem>
                                        <SelectItem value="EGRESO">Egreso (-)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="institucion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Institución</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Institución" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="GOBIERNO">Gobierno (GRACCNN)</SelectItem>
                                        <SelectItem value="CONCEJO">Concejo</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="monto"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monto (C$)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Pago de viáticos, Cobro servicios..." {...field} />
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
                            <FormLabel>Referencia (Opcional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Recibo #, Factura #..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Registrando..." : "Registrar Movimiento"}
                </Button>
            </form>
        </Form>
    )
}
