"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft,
    MessageSquare,
    Send,
    Clock,
    User,
    AlertCircle
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { formatCurrency } from "@/lib/utils"

type Observation = {
    id: string
    observacion: string
    tipo: string
    estado: string
    createdAt: string
    creadoPor: {
        nombre: string
        apellido: string
    }
}

type AccountingEntry = {
    id: string
    numero: string
    tipo: string
    fecha: string
    descripcion: string
    monto: number
    estado: string
    institucion: string
    cuentaContable: string
    centroCosto?: string
    proyecto?: string
    documentoRef?: string
    observaciones?: string
    creadoPor: {
        nombre: string
        apellido: string
    }
}

export default function AccountingEntryDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { data: session } = useSession()
    const [entry, setEntry] = useState<AccountingEntry | null>(null)
    const [observations, setObservations] = useState<Observation[]>([])
    const [loading, setLoading] = useState(true)
    const [newObservation, setNewObservation] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const isCoordinador = session?.user?.role === "CoordinadorGobierno"

    useEffect(() => {
        async function fetchData() {
            try {
                const [entryRes, observationsRes] = await Promise.all([
                    fetch(`/api/accounting-entries/${params.id}`),
                    fetch(`/api/accounting-entries/${params.id}/observations`)
                ])

                if (entryRes.ok) {
                    const data = await entryRes.json()
                    setEntry(data.data)
                }

                if (observationsRes.ok) {
                    const data = await observationsRes.json()
                    setObservations(data.data || [])
                }
            } catch (error) {
                console.error("Error fetching entry detail:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [params.id])

    const handleAddObservation = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newObservation.trim()) return

        setSubmitting(true)
        try {
            const res = await fetch(`/api/accounting-entries/${params.id}/observations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ observacion: newObservation, tipo: "INCONSISTENCIA" })
            })

            if (res.ok) {
                const data = await res.json()
                setObservations([data.data, ...observations])
                setNewObservation("")
            }
        } catch (error) {
            console.error("Error adding observation:", error)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="text-center py-20 text-muted-foreground transition-all animate-pulse">
                    Cargando detalles del asiento...
                </div>
            </DashboardLayout>
        )
    }

    if (!entry) {
        return (
            <DashboardLayout>
                <div className="text-center py-20 text-red-500">
                    Asiento no encontrado
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" /> Volver
                    </Button>
                    <div className="flex items-center gap-2">
                        <Badge variant={entry.estado === "APROBADO" ? "default" : "secondary"}>
                            {entry.estado}
                        </Badge>
                        <span className="font-mono font-bold text-lg">{entry.numero}</span>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Info */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Detalles del Asiento</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Tipo</p>
                                    <p className="font-medium">{entry.tipo}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Fecha</p>
                                    <p className="font-medium">{new Date(entry.fecha).toLocaleDateString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Monto</p>
                                    <p className="text-xl font-bold text-primary">{formatCurrency(entry.monto)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Institución</p>
                                    <p className="font-medium">{entry.institucion}</p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                                <p className="text-sm">{entry.descripcion}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t pt-4 text-sm">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Cuenta Contable</p>
                                    <p className="font-mono">{entry.cuentaContable}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Documento Ref.</p>
                                    <p className="font-medium">{entry.documentoRef || "---"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Creado por</p>
                                    <div className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        <span>{entry.creadoPor.nombre} {entry.creadoPor.apellido}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Side Info / Observations */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Observaciones
                                </CardTitle>
                                <CardDescription>
                                    Revisión y comentarios del Gobierno
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isCoordinador && (
                                    <form onSubmit={handleAddObservation} className="space-y-2">
                                        <textarea
                                            className="w-full text-sm border rounded-md p-2 min-h-[80px] focus:outline-none focus:ring-1 focus:ring-primary"
                                            placeholder="Agregar una observación o reportar inconsistencia..."
                                            value={newObservation}
                                            onChange={(e) => setNewObservation(e.target.value)}
                                        />
                                        <Button size="sm" className="w-full" disabled={submitting}>
                                            <Send className="h-3 w-3 mr-2" />
                                            {submitting ? "Enviando..." : "Enviar Comentario"}
                                        </Button>
                                    </form>
                                )}

                                <div className="space-y-3 max-h-[400px] overflow-auto pr-2">
                                    {observations.length === 0 ? (
                                        <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg">
                                            No hay observaciones registradas en este asiento.
                                        </div>
                                    ) : (
                                        observations.map((obs) => (
                                            <div key={obs.id} className="p-3 bg-muted/40 rounded-lg text-xs border border-muted-foreground/10 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold">{obs.creadoPor.nombre} {obs.creadoPor.apellido}</span>
                                                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                        <Clock className="h-2 w-2" />
                                                        {new Date(obs.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-foreground leading-relaxed italic">&quot;{obs.observacion}&quot;</p>
                                                <div className="flex justify-end">
                                                    <Badge variant="outline" className="text-[9px] bg-background">
                                                        {obs.tipo}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                <AlertCircle className="h-4 w-4" />
                                Información del Rol
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Como <strong>Coordinador del Gobierno Regional</strong>, usted tiene facultades de fiscalización. Sus comentarios son vinculantes para el proceso de auditoría final.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
