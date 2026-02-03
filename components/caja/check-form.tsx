"use client"

import { useState, useEffect } from "react"
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
    numero: z.string().min(1, "Número de cheque es requerido"),
    tipo: z.enum(["RECIBIDO", "EMITIDO"]),
    banco: z.string().min(1, "Banco es requerido"),
    cuentaBancaria: z.string().min(1, "Cuenta bancaria es requerida"),
    beneficiario: z.string().min(1, "Beneficiario es requerido"),
    monto: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Monto debe ser mayor a 0"),
    fecha: z.string().min(1, "Fecha es requerida"),
    referencia: z.string().optional(),
    providerId: z.string().optional(),
    budgetItemId: z.string().optional(),
})

export function CheckForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)
    const [providers, setProviders] = useState([])
    const [budgetItems, setBudgetItems] = useState([])

    useEffect(() => {
        const fetchInitialData = async () => {
            const [providersRes, budgetRes] = await Promise.all([
                fetch("/api/caja/providers"),
                fetch("/api/budget/items")
            ])

            if (providersRes.ok) {
                const data = await providersRes.json()
                setProviders(data)
            }
            if (budgetRes.ok) {
                const json = await budgetRes.json()
                setBudgetItems(json.data || [])
            }
        }
        fetchInitialData()
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tipo: "EMITIDO",
            banco: "",
            cuentaBancaria: "",
            beneficiario: "",
            monto: "",
            fecha: new Date().toISOString().split('T')[0],
            referencia: "",
            providerId: "none",
            budgetItemId: "none",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const res = await fetch("/api/caja/checks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    monto: Number(values.monto),
                    providerId: values.providerId === "none" ? undefined : values.providerId,
                    budgetItemId: values.budgetItemId === "none" ? undefined : values.budgetItemId
                }),
            })

            if (res.ok) {
                toast.success("Cheque registrado correctamente")
                onSuccess()
            } else {
                const err = await res.text()
                toast.error(err || "Error al registrar cheque")
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
                                <FormLabel>Tipo de Movimiento Bancario</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="RECIBIDO">Cheque Recibido (Entrada)</SelectItem>
                                        <SelectItem value="EMITIDO">Cheque Emitido (Pago/Salida)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="numero"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número de Cheque</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: 0012345" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="banco"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Banco</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: BANPRO, LAFISE..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="cuentaBancaria"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cuenta Bancaria</FormLabel>
                                <FormControl>
                                    <Input placeholder="No. de Cuenta" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="providerId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Proveedor (Si aplica)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione un proveedor" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">Ninguno / Pago directo</SelectItem>
                                        {providers.map((p: any) => (
                                            <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="budgetItemId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Partida Presupuestaria</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione partida" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">No presupuestado</SelectItem>
                                        {budgetItems.map((item: any) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.codigo} - {item.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="beneficiario"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Beneficiario / Concepto de Pago</FormLabel>
                            <FormControl>
                                <Input placeholder="Nombre de la persona o entidad" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
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
                        name="fecha"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="referencia"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Referencia Adicional</FormLabel>
                            <FormControl>
                                <Input placeholder="Voucher #, Factura Ref..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Registrando..." : "Registrar Cheque Bancario"}
                </Button>
            </form>
        </Form>
    )
}
