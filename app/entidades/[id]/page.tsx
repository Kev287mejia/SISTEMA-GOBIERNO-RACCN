"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Building2,
    ArrowLeft,
    Save,
    Trash2,
    FileCheck,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    History
} from "lucide-react"

export default function EntityDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    // Mock data for now - In real implementation this would come from API
    const [entity, setEntity] = useState<any>({
        id: params.id,
        nombre: "Gobierno Regional Autónomo",
        tipo: "INSTITUCION",
        ruc: "1234567890001",
        direccion: "Bilwi, Puerto Cabezas",
        telefono: "2792-1234",
        email: "info@graccnn.gob.ni",
        contacto: "Lic. Yahira Tucker",
        estado: "ACTIVO",
        createdAt: new Date().toISOString()
    })

    useEffect(() => {
        const fetchEntity = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/entities/${params.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setEntity(data)
                } else {
                    console.error("Failed to fetch entity")
                }
            } catch (error) {
                console.error("Error fetching entity", error)
            } finally {
                setLoading(false)
            }
        }
        fetchEntity()
    }, [params.id])

    const handleSave = async () => {
        setSaving(true)
        try {
            // Sanitize payload to only send updatable fields
            const payload = {
                nombre: entity.nombre,
                ruc: entity.ruc,
                direccion: entity.direccion,
                telefono: entity.telefono,
                email: entity.email,
                contacto: entity.contacto,
                // Add account details if schema supported it
            }

            const res = await fetch(`/api/entities/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                alert("Cambios guardados correctamente")
            } else {
                const error = await res.json()
                alert(`Error al guardar cambios: ${error.error || "Desconocido"}`)
            }
        } catch (error) {
            console.error("Error saving entity", error)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (confirm("¿Está seguro de eliminar esta entidad?")) {
            try {
                const res = await fetch(`/api/entities/${params.id}`, {
                    method: "DELETE"
                })
                if (res.ok) {
                    alert("Entidad eliminada")
                    router.push("/entidades")
                }
            } catch (error) {
                console.error("Error deleting entity", error)
            }
        }
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">

                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
                            <ArrowLeft className="h-5 w-5 text-slate-500" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                {entity.nombre}
                                <Badge className={`${entity.tipo === 'INSTITUCION' ? 'bg-indigo-600' : 'bg-blue-600'} text-[10px] uppercase font-black`}>
                                    {entity.tipo}
                                </Badge>
                            </h1>
                            <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
                                <Building2 className="h-3.5 w-3.5" />
                                Perfil Corporativo del Proveedor / Institución
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={handleSave} disabled={saving}>
                            {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Guardar Cambios
                        </Button>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* Left Column: Main Info */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="border-none shadow-xl shadow-slate-200/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg font-black text-slate-800">
                                    <FileCheck className="h-5 w-5 text-indigo-500" />
                                    Datos Generales
                                </CardTitle>
                                <CardDescription>Información legal y administrativa</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400">Nombre / Razón Social</label>
                                        <Input
                                            value={entity.nombre}
                                            onChange={(e) => setEntity({ ...entity, nombre: e.target.value })}
                                            className="font-bold border-slate-200 bg-slate-50/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400">RUC / Cédula</label>
                                        <Input
                                            value={entity.ruc}
                                            onChange={(e) => setEntity({ ...entity, ruc: e.target.value })}
                                            className="font-mono font-bold border-slate-200 bg-slate-50/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400">Dirección Fiscal</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <textarea
                                            className="w-full min-h-[80px] rounded-xl border border-slate-200 bg-slate-50/50 p-3 pl-10 text-sm font-medium focus-visible:ring-indigo-500"
                                            value={entity.direccion}
                                            onChange={(e) => setEntity({ ...entity, direccion: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400">Nombre de Contacto</label>
                                        <Input
                                            value={entity.contacto}
                                            onChange={(e) => setEntity({ ...entity, contacto: e.target.value })}
                                            className="font-medium border-slate-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400">Cargo</label>
                                        <Input
                                            placeholder="Ej: Gerente General"
                                            className="font-medium border-slate-200"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl shadow-slate-200/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg font-black text-slate-800">
                                    <CreditCard className="h-5 w-5 text-emerald-500" />
                                    Datos Financieros
                                </CardTitle>
                                <CardDescription>Información para pagos y transferencias</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400">Banco Principal</label>
                                        <Input className="font-medium border-slate-200" placeholder="Ej: BANPRO, LAFISE" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400">Número de Cuenta</label>
                                        <Input className="font-mono font-bold border-slate-200" placeholder="0000 0000 0000 0000" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Contact & Stats */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-xl bg-slate-900 text-white">
                            <CardHeader>
                                <CardTitle className="text-lg font-black">Contacto Directo</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <Phone className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Teléfono</p>
                                        <p className="font-bold text-lg cursor-pointer hover:text-emerald-400 transition-colors">{entity.telefono}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <Mail className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Correo Electrónico</p>
                                        <p className="font-bold text-sm cursor-pointer hover:text-blue-400 transition-colors truncate max-w-[180px]" title={entity.email}>{entity.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl shadow-slate-200/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase text-slate-400 tracking-widest">
                                    <History className="h-4 w-4" /> Historial Reciente
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-slate-400 text-xs">
                                    No hay transacciones recientes registradas para esta entidad.
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    )
}
