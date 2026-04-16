"use client"

export const dynamic = "force-dynamic";
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { UserPlus, Users, Shield, Eye, EyeOff, Check, X, Edit, Power, Key, MoreVertical, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Definición de roles con sus descripciones y permisos
const ROLES = [
  {
    value: "AuxiliarContable",
    label: "Auxiliar Contable",
    description: "Registro de asientos contables y operaciones básicas",
    modules: ["Contabilidad", "Reportes", "Dashboard"]
  },
  {
    value: "ResponsableCaja",
    label: "Responsable de Caja",
    description: "Gestión de movimientos de caja y emisión de cheques",
    modules: ["Caja", "Contabilidad", "Reportes", "Dashboard"]
  },
  {
    value: "ResponsableCredito",
    label: "Responsable de Crédito (Caja Chica)",
    description: "Administración de cajas chicas y fondos rotatorios",
    modules: ["Caja Chica", "Contabilidad", "Reportes", "Dashboard"]
  },
  {
    value: "ResponsablePresupuesto",
    label: "Responsable de Presupuesto",
    description: "Gestión y seguimiento de ejecución presupuestaria",
    modules: ["Presupuesto", "Caja", "Caja Chica", "Contabilidad", "Reportes", "Dashboard"]
  },
  {
    value: "Auditor",
    label: "Auditor Interno",
    description: "Revisión y auditoría de operaciones financieras",
    modules: ["Auditoría", "Contabilidad", "Presupuesto", "Caja", "Reportes", "Dashboard"]
  },
  {
    value: "RRHH",
    label: "Recursos Humanos",
    description: "Gestión de personal y nómina",
    modules: ["RRHH", "Usuarios", "Dashboard"]
  },
  {
    value: "Bodega",
    label: "Responsable de Bodega",
    description: "Control de inventario y activos fijos",
    modules: ["Inventario", "Dashboard"]
  }
]

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")
  const [editingUser, setEditingUser] = useState<any>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [newPassword, setNewPassword] = useState("")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    cedula: "",
    cargo: "",
    departamento: "",
    role: "",
    deniedModules: [] as string[]
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users")
      const data = await res.json()

      if (res.ok) {
        setUsers(data.users)
      } else {
        if (res.status === 401) {
          toast.error("Sesión expirada. Por favor inicie sesión nuevamente.")
          // Optionally redirect? The middleware handles this usually but API calls might slip through.
          window.location.href = "/auth/login"
        } else if (res.status === 403) {
          toast.error("No tiene permisos para ver la lista de usuarios.")
        } else {
          toast.error(data.error || "Error al cargar usuarios")
        }
        console.error("Error fetching users:", data.error)
      }
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("Error de conexión al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Usuario creado exitosamente")
        setFormData({
          email: "",
          password: "",
          nombre: "",
          apellido: "",
          cedula: "",
          cargo: "",
          departamento: "",
          role: "",
          deniedModules: []
        })
        setSelectedRole("")
        fetchUsers()
      } else {
        toast.error(data.error || "Error al crear usuario")
      }
    } catch (error) {
      toast.error("Error al crear usuario")
    } finally {
      setIsCreating(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(true)

    try {
      const res = await fetch("/api/users/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          ...formData
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Usuario actualizado exitosamente")
        setShowEditDialog(false)
        setEditingUser(null)
        fetchUsers()
      } else {
        toast.error(data.error || "Error al actualizar usuario")
      }
    } catch (error) {
      toast.error("Error al actualizar usuario")
    } finally {
      setIsEditing(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Usuario eliminado exitosamente")
        setShowDeleteDialog(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        toast.error(data.error || "Error al eliminar usuario")
      }
    } catch (error) {
      toast.error("Error al eliminar usuario")
    }
  }

  const handleToggleStatus = async () => {
    if (!selectedUser) return

    try {
      const res = await fetch("/api/users/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          activo: !selectedUser.activo
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(`Usuario ${!selectedUser.activo ? 'activado' : 'desactivado'} exitosamente`)
        setShowStatusDialog(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        toast.error(data.error || "Error al cambiar estado")
      }
    } catch (error) {
      toast.error("Error al cambiar estado del usuario")
    }
  }

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) {
      toast.error("Ingrese una contraseña")
      return
    }

    try {
      const res = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          newPassword
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Contraseña actualizada exitosamente")
        setShowPasswordDialog(false)
        setSelectedUser(null)
        setNewPassword("")
      } else {
        toast.error(data.error || "Error al resetear contraseña")
      }
    } catch (error) {
      toast.error("Error al resetear contraseña")
    }
  }

  const openEditDialog = (user: any) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      password: "",
      nombre: user.nombre,
      apellido: user.apellido || "",
      cedula: user.cedula || "",
      cargo: user.cargo || "",
      departamento: user.departamento || "",
      role: user.role,
      deniedModules: user.deniedModules || []
    })
    setSelectedRole(user.role)
    setShowEditDialog(true)
  }

  const handleRoleChange = (role: string) => {
    setSelectedRole(role)
    setFormData({ ...formData, role })

    const roleData = ROLES.find(r => r.value === role)
    if (roleData && !editingUser) {
      setFormData(prev => ({
        ...prev,
        role,
        cargo: roleData.label
      }))
    }
  }

  const selectedRoleData = ROLES.find(r => r.value === selectedRole)

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Gestión de Usuarios
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Administración de cuentas y permisos del sistema
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 text-white font-bold h-12 px-6 rounded-xl shadow-lg">
                <UserPlus className="mr-2 h-5 w-5" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Complete los datos del usuario y seleccione el rol apropiado
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                {/* Información Personal */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Información Personal
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="apellido">Apellido</Label>
                      <Input
                        id="apellido"
                        value={formData.apellido}
                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cedula">Cédula</Label>
                    <Input
                      id="cedula"
                      placeholder="000-000000-0000X"
                      value={formData.cedula}
                      onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                    />
                  </div>
                </div>

                {/* Credenciales */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Credenciales de Acceso
                  </h3>

                  <div>
                    <Label htmlFor="email">Email Institucional *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@graccnn.gob.ni"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Contraseña Temporal *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      El usuario deberá cambiarla en su primer inicio de sesión
                    </p>
                  </div>
                </div>

                {/* Rol y Permisos */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Rol y Permisos del Sistema</h3>

                  <div>
                    <Label htmlFor="role">Rol del Usuario *</Label>
                    <Select value={selectedRole} onValueChange={handleRoleChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex flex-col">
                              <span className="font-bold">{role.label}</span>
                              <span className="text-xs text-slate-500">{role.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedRoleData && (
                    <Card className="bg-slate-50 border-slate-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold">Módulos Autorizados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedRoleData.modules.map((module) => (
                            <Badge key={module} variant="secondary" className="bg-emerald-100 text-emerald-700">
                              <Check className="h-3 w-3 mr-1" />
                              {module}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div>
                    <Label htmlFor="cargo">Cargo Institucional</Label>
                    <Input
                      id="cargo"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="departamento">Departamento</Label>
                    <Input
                      id="departamento"
                      placeholder="Ej: Dirección Administrativa Financiera"
                      value={formData.departamento}
                      onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-slate-900 text-white font-bold"
                    disabled={isCreating}
                  >
                    {isCreating ? "Creando..." : "Crear Usuario"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Usuarios */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Registrados</CardTitle>
            <CardDescription>
              {users.length} usuarios activos en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-slate-500">Cargando...</p>
            ) : users.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No hay usuarios registrados</p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <span className="font-bold text-slate-600">
                            {user.nombre[0]}{user.apellido?.[0] || ''}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {user.nombre} {user.apellido}
                          </p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant="outline" className="font-mono text-xs">
                          {user.role}
                        </Badge>
                        {user.cargo && (
                          <p className="text-xs text-slate-500 mt-1">{user.cargo}</p>
                        )}
                      </div>
                      <div>
                        {user.activo ? (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            <Check className="h-3 w-3 mr-1" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <X className="h-3 w-3 mr-1" />
                            Inactivo
                          </Badge>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Usuario
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user)
                            setShowPasswordDialog(true)
                          }}>
                            <Key className="h-4 w-4 mr-2" />
                            Resetear Contraseña
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setShowStatusDialog(true)
                            }}
                            className={user.activo ? "text-red-600" : "text-emerald-600"}
                          >
                            <Power className="h-4 w-4 mr-2" />
                            {user.activo ? "Desactivar" : "Activar"} Usuario
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {/* Opción de eliminar removida por seguridad/auditoría
                            <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setShowDeleteDialog(true)
                            }}
                            className="text-red-600 font-medium focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar Usuario
                          </DropdownMenuItem>
                          */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Edición */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Editar Usuario</DialogTitle>
              <DialogDescription>
                Modifique los datos del usuario según sea necesario
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEdit} className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-nombre">Nombre *</Label>
                    <Input
                      id="edit-nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-apellido">Apellido</Label>
                    <Input
                      id="edit-apellido"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-cedula">Cédula</Label>
                  <Input
                    id="edit-cedula"
                    value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-role">Rol del Usuario *</Label>
                  <Select value={selectedRole} onValueChange={handleRoleChange} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedRoleData && (
                  <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-bold">Módulos Autorizados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedRoleData.modules.map((module) => (
                          <Badge key={module} variant="secondary" className="bg-emerald-100 text-emerald-700">
                            <Check className="h-3 w-3 mr-1" />
                            {module}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <Label htmlFor="edit-cargo">Cargo Institucional</Label>
                  <Input
                    id="edit-cargo"
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-departamento">Departamento</Label>
                  <Input
                    id="edit-departamento"
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  />
                </div>

                {selectedRoleData && (
                  <div className="pt-4 border-t">
                    <h3 className="font-bold text-sm mb-3">Permisos de Módulos (Desmarcar para restringir)</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedRoleData.modules.map((module) => {
                        const isDenied = (formData as any).deniedModules?.includes(module)
                        return (
                          <div key={module} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`module-${module}`}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              checked={!isDenied}
                              onChange={(e) => {
                                const checked = e.target.checked
                                const currentDenied = (formData as any).deniedModules || []
                                let newDenied
                                if (checked) {
                                  // Start allowing (remove from denied)
                                  newDenied = currentDenied.filter((m: string) => m !== module)
                                } else {
                                  // Start denying (add to denied)
                                  newDenied = [...currentDenied, module]
                                }
                                setFormData({ ...formData, deniedModules: newDenied } as any)
                              }}
                            />
                            <Label htmlFor={`module-${module}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {module}
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      * Restrinja módulos específicos sin cambiar el rol del usuario.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-slate-900 text-white font-bold"
                  disabled={isEditing}
                >
                  {isEditing ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Resetear Contraseña */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resetear Contraseña</DialogTitle>
              <DialogDescription>
                Ingrese una nueva contraseña temporal para {selectedUser?.nombre}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ingrese nueva contraseña"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowPasswordDialog(false)
                  setNewPassword("")
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-slate-900 text-white"
                onClick={handleResetPassword}
              >
                Actualizar Contraseña
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmación de Estado */}
        <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedUser?.activo ? "Desactivar" : "Activar"} Usuario
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedUser?.activo
                  ? `¿Está seguro que desea desactivar a ${selectedUser?.nombre}? El usuario no podrá iniciar sesión hasta que sea reactivado.`
                  : `¿Está seguro que desea activar a ${selectedUser?.nombre}? El usuario podrá iniciar sesión nuevamente.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleToggleStatus}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de Confirmación de Eliminación */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">
                ¿Eliminar Usuario Permanentemente?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción marcará al usuario <strong>{selectedUser?.nombre}</strong> como eliminado del sistema.
                <br /><br />
                El usuario ya no aparecerá en las listas y perderá todo acceso.
                El historial de operaciones (auditoría) se mantendrá por seguridad.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancela</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Sí, Eliminar Usuario
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
