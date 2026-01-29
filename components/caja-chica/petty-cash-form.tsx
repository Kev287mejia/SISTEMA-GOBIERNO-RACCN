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
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    montoInicial: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Monto debe ser un número positivo"),
    institution: z.enum(["GOBIERNO", "CONCEJO"]),
})

export function PettyCashForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: "",
            montoInicial: "0",
            institution: "GOBIERNO",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const res = await fetch("/api/caja-chica", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    montoInicial: Number(values.montoInicial)
                }),
            })

            if (res.ok) {
                toast.success("Caja Chica aperturada correctamente")
                onSuccess()
            } else {
                const err = await res.text()
                toast.error(err || "Error al registrar apertura")
            }
        } catch (error) {
            toast.error("Error de conexión al servidor")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre Manual de la Caja</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Caja Chica DAF Central" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="montoInicial"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Saldo de Apertura (C$)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="institution"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Institución</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="GOBIERNO">GRACCNN</SelectItem>
                                        <SelectItem value="CONCEJO">Concejo Regional</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                    {loading ? "Registrando..." : "Confirmar Apertura"}
                </Button>
            </form>
        </Form>
    )
}
