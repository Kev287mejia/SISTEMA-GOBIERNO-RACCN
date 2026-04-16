"use client"

export const dynamic = "force-dynamic";
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { Position } from "@prisma/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

export default function PositionsPage() {
    const [positions, setPositions] = useState<Position[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newPosition, setNewPosition] = useState({
        titulo: "",
        departamento: "",
        descripcion: "",
        salarioMin: "",
        salarioMax: ""
    })

    useEffect(() => {
        fetchPositions()
    }, [])

    const fetchPositions = async () => {
        try {
            const res = await fetch("/api/hr/positions")
            if (res.ok) {
                const data = await res.json()
                setPositions(data)
            }
        } catch (error) {
            console.error("Failed to fetch positions", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch("/api/hr/positions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPosition),
            })

            if (res.ok) {
                setIsDialogOpen(false)
                setNewPosition({ titulo: "", departamento: "", descripcion: "", salarioMin: "", salarioMax: "" })
                fetchPositions()
            }
        } catch (error) {
            console.error("Failed to create position", error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Cargos y Posiciones</h1>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Cargo
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear Nuevo Cargo</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Título del Cargo</label>
                                <input
                                    required
                                    className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                                    value={newPosition.titulo}
                                    onChange={(e) => setNewPosition({ ...newPosition, titulo: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Departamento</label>
                                <input
                                    required
                                    className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                                    value={newPosition.departamento}
                                    onChange={(e) => setNewPosition({ ...newPosition, departamento: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Salario Min</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                                        value={newPosition.salarioMin}
                                        onChange={(e) => setNewPosition({ ...newPosition, salarioMin: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Salario Max</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                                        value={newPosition.salarioMax}
                                        onChange={(e) => setNewPosition({ ...newPosition, salarioMax: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Descripción</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm"
                                    value={newPosition.descripcion}
                                    onChange={(e) => setNewPosition({ ...newPosition, descripcion: e.target.value })}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Guardar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Listado de Cargos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Título</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Departamento</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Rango Salarial</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Descripción</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center">Cargando...</td>
                                    </tr>
                                ) : positions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center">No se encontraron cargos.</td>
                                    </tr>
                                ) : (
                                    positions.map((pos) => (
                                        <tr key={pos.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 font-medium">{pos.titulo}</td>
                                            <td className="p-4">{pos.departamento}</td>
                                            <td className="p-4">
                                                {pos.salarioMin && pos.salarioMax ?
                                                    `$${pos.salarioMin} - $${pos.salarioMax}` :
                                                    'N/A'}
                                            </td>
                                            <td className="p-4 text-muted-foreground">{pos.descripcion || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
