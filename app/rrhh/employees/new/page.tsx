"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Position } from "@prisma/client"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function NewEmployeePage() {
    const router = useRouter()
    const [positions, setPositions] = useState<Position[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        cedula: "",
        email: "",
        telefono: "",
        direccion: "",
        fechaIngreso: new Date().toISOString().split('T')[0],
        cargoId: "",
        salario: "",
        tipoContrato: "INDEFINIDO"
    })

    useEffect(() => {
        fetch("/api/hr/positions")
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch positions')
                return res.json()
            })
            .then(data => {
                // Ensure data is an array
                if (Array.isArray(data)) {
                    setPositions(data)
                } else {
                    console.error('Positions data is not an array:', data)
                    setPositions([])
                }
            })
            .catch(err => {
                console.error('Error fetching positions:', err)
                setPositions([])
            })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/hr/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const msg = await res.text()
                throw new Error(msg)
            }

            router.push("/rrhh/employees")
            router.refresh()
        } catch (err: any) {
            setError(err.message || "Error al crear empleado")
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Nuevo Empleado</h1>
                    <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Datos Personales y Contrato</CardTitle>
                        <CardDescription>Ingrese la información del nuevo empleado</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nombre *</label>
                                    <input
                                        required
                                        name="nombre"
                                        className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Apellido *</label>
                                    <input
                                        required
                                        name="apellido"
                                        className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                                        value={formData.apellido}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Cédula/DNI *</label>
                                    <input
                                        required
                                        name="cedula"
                                        className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                                        value={formData.cedula}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Fecha de Ingreso *</label>
                                    <input
                                        required
                                        type="date"
                                        name="fechaIngreso"
                                        className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                                        value={formData.fechaIngreso}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Teléfono</label>
                                    <input
                                        name="telefono"
                                        className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Dirección</label>
                                <textarea
                                    name="direccion"
                                    className="flex min-h-[60px] w-full rounded-md border border-input px-3 py-2 text-sm"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="border-t pt-4 mt-6">
                                <h3 className="text-lg font-semibold mb-4">Información del Cargo</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Cargo</label>
                                        <select
                                            name="cargoId"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={formData.cargoId}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione un cargo...</option>
                                            {positions.map(p => (
                                                <option key={p.id} value={p.id}>{p.titulo} - {p.departamento}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Salario Base</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="salario"
                                            placeholder="0.00"
                                            className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                                            value={formData.salario}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Tipo de Contrato</label>
                                        <select
                                            name="tipoContrato"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={formData.tipoContrato}
                                            onChange={handleChange}
                                        >
                                            <option value="INDEFINIDO">Indefinido</option>
                                            <option value="FIJO">Fijo / Temporal</option>
                                            <option value="SERVICIOS">Servicios Profesionales</option>
                                            <option value="PASANTIA">Pasantía</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Guardando..." : "Crear Empleado"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
