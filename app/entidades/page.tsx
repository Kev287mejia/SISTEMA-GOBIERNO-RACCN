"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Building2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

export default function EntidadesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newEntity, setNewEntity] = useState({
    nombre: "",
    tipo: "PROVEEDOR",
    ruc: "",
    direccion: "",
    telefono: "",
    email: "",
    contacto: ""
  })

  const [entidades, setEntidades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntidades = async () => {
    try {
      const res = await fetch("/api/entities")
      if (res.ok) {
        const data = await res.json()
        setEntidades(data)
      }
    } catch (error) {
      console.error("Error loading entities", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntidades()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntity)
      })

      if (res.ok) {
        setIsDialogOpen(false)
        setNewEntity({ nombre: "", tipo: "PROVEEDOR", ruc: "", direccion: "", telefono: "", email: "", contacto: "" })
        fetchEntidades()
      }
    } catch (error) {
      console.error("Error creating entity", error)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Entidades</h1>
            <p className="text-gray-600 mt-2">
              Gestión de instituciones, proveedores y clientes
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nueva Entidad
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Entidad</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tipo de Entidad *</label>
                  <select
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newEntity.tipo}
                    onChange={(e) => setNewEntity({ ...newEntity, tipo: e.target.value })}
                  >
                    <option value="PROVEEDOR">Proveedor</option>
                    <option value="CLIENTE">Cliente</option>
                    <option value="INSTITUCION">Institución</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Nombre *</label>
                  <input
                    required
                    className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                    value={newEntity.nombre}
                    onChange={(e) => setNewEntity({ ...newEntity, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">RUC/Cédula *</label>
                  <input
                    required
                    className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                    value={newEntity.ruc}
                    onChange={(e) => setNewEntity({ ...newEntity, ruc: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Dirección</label>
                  <input
                    className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                    value={newEntity.direccion}
                    onChange={(e) => setNewEntity({ ...newEntity, direccion: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Teléfono</label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={newEntity.telefono}
                      onChange={(e) => setNewEntity({ ...newEntity, telefono: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={newEntity.email}
                      onChange={(e) => setNewEntity({ ...newEntity, email: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Persona de Contacto</label>
                  <input
                    className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                    value={newEntity.contacto}
                    onChange={(e) => setNewEntity({ ...newEntity, contacto: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Guardar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entidades</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{entidades.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proveedores</CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Instituciones</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{entidades.filter(e => e.tipo === "INSTITUCION").length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Entidades Table */}
        <Card>
          <CardHeader>
            <CardTitle>Listado de Entidades</CardTitle>
            <CardDescription>
              Todas las entidades registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">Nombre</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Tipo</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">RUC</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Estado</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {entidades.map((entidad) => (
                    <tr key={entidad.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 font-medium">{entidad.nombre}</td>
                      <td className="p-4">
                        <Badge variant={entidad.tipo === "INSTITUCION" ? "default" : "secondary"}>
                          {entidad.tipo}
                        </Badge>
                      </td>
                      <td className="p-4 font-mono text-sm">{entidad.ruc}</td>
                      <td className="p-4">
                        <Badge variant={entidad.activo ? "default" : "secondary"}>
                          {entidad.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/entidades/${entidad.id}`}>Ver Detalle</a>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
