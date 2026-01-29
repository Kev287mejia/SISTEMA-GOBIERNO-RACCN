"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Plus,
    Building2,
    Fingerprint,
    Mail,
    Phone,
    MapPin,
    User,
    Loader2,
    ShieldCheck,
    Globe,
    Activity
} from "lucide-react"
import { toast } from "sonner"
import { EntityType } from "@prisma/client"

interface CreateEntityDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function CreateEntityDialog({ open, onOpenChange, onSuccess }: CreateEntityDialogProps) {
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        nombre: "",
        tipo: "PROVEEDOR" as EntityType,
        ruc: "",
        direccion: "",
        telefono: "",
        email: "",
        contacto: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.nombre || !formData.ruc) {
            toast.error("Nombre y RUC/Cédula son campos obligatorios")
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/entities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                toast.success("Entidad registrada correctamente")
                onSuccess?.()
                onOpenChange(false)
                resetForm()
            } else {
                const error = await res.json()
                toast.error(error.error || "Error al registrar la entidad")
            }
        } catch (error) {
            toast.error("Error de conexión al registrar la entidad")
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            nombre: "",
            tipo: "PROVEEDOR" as EntityType,
            ruc: "",
            direccion: "",
            telefono: "",
            email: "",
            contacto: ""
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
                <DialogHeader className="bg-slate-900 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Building2 className="h-32 w-32 rotate-12" />
                    </div>
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                <Plus className="h-6 w-6 text-white" />
                            </div>
                            <DialogTitle className="text-3xl font-black uppercase tracking-tight">Nueva Entidad</DialogTitle>
                        </div>
                        <DialogDescription className="text-slate-400 font-medium">
                            Registre proveedores, clientes o instituciones gubernamentales en el catálogo central.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="bg-white p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Perfil de Entidad */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                <ShieldCheck className="h-3.5 w-3.5 text-blue-500" /> Identidad Corporativa
                            </h3>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-600 uppercase">Tipo de Entidad *</Label>
                                <Select
                                    value={formData.tipo}
                                    onValueChange={(v) => setFormData({ ...formData, tipo: v as EntityType })}
                                >
                                    <SelectTrigger className="bg-slate-50 border-slate-200 h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PROVEEDOR">Proveedor Externo</SelectItem>
                                        <SelectItem value="CLIENTE">Cliente / Beneficiario</SelectItem>
                                        <SelectItem value="INSTITUCION">Institución Pública</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-600 uppercase">Nombre / Razón Social *</Label>
                                <div className="relative">
                                    <Input
                                        required
                                        placeholder="Ej: Suministros Industriales S.A."
                                        className="bg-slate-50 border-slate-200 h-10 pl-9 font-bold text-slate-700"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    />
                                    <Building2 className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-600 uppercase">RUC / Cédula de Identidad *</Label>
                                <div className="relative">
                                    <Input
                                        required
                                        placeholder="J0310000000000"
                                        className="bg-slate-50 border-slate-200 h-10 pl-9 font-mono font-bold"
                                        value={formData.ruc}
                                        onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                                    />
                                    <Fingerprint className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                                </div>
                            </div>
                        </div>

                        {/* Contacto y Ubicación */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                <Globe className="h-3.5 w-3.5 text-blue-500" /> Contacto y Localización
                            </h3>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-600 uppercase">Correo Electrónico</Label>
                                <div className="relative">
                                    <Input
                                        type="email"
                                        placeholder="correo@entidad.com"
                                        className="bg-slate-50 border-slate-200 h-10 pl-9"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-600 uppercase">Teléfono de Enlace</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="+505 0000-0000"
                                        className="bg-slate-50 border-slate-200 h-10 pl-9"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    />
                                    <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-600 uppercase">Persona de Contacto</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="Nombre del Gestor"
                                        className="bg-slate-50 border-slate-200 h-10 pl-9"
                                        value={formData.contacto}
                                        onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                                    />
                                    <User className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-[10px] font-black text-slate-600 uppercase">Dirección Física / Domicilio</Label>
                            <div className="relative">
                                <MapPin className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                                <textarea
                                    className="w-full min-h-[60px] rounded-xl border border-slate-200 bg-slate-50 p-3 pl-9 text-sm font-medium focus-visible:ring-blue-500"
                                    placeholder="Detalle de ubicación fiscal..."
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validación de Registro Activa</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                className="rounded-xl font-bold text-slate-500"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest px-8 shadow-lg shadow-slate-200 h-11"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Entidad"}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
