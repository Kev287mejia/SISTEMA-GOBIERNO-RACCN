"use client"

import { useState } from "react"
import { Check, Clock, X, AlertCircle, ChevronRight, DollarSign, FileText, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Definición de roles y estados
type MovementStatus =
    | "PENDIENTE_VALIDACION" // Legacy maps to SOLICITADO
    | "VALIDADO"             // Legacy
    | "SOLICITADO"
    | "APROBADO_JEFE"
    | "AUTORIZADO"
    | "ENTREGADO"
    | "LIQUIDADO"
    | "RECHAZADO"
    | "ANULADO"

interface WorkflowStep {
    id: MovementStatus
    label: string
    icon: any
    description: string
    requiredRole?: string[]
}

const WORKFLOW_STEPS: WorkflowStep[] = [
    {
        id: "SOLICITADO",
        label: "Solicitud",
        icon: FileText,
        description: "Solicitud creada y pendiente de revisión"
    },
    {
        id: "APROBADO_JEFE",
        label: "Visto Bueno",
        icon: Check,
        description: "Aprobado por jefatura inmediata",
        requiredRole: ["Admin", "CoordinadorGobierno", "DirectoraDAF"] // Jefes genéricos por ahora
    },
    {
        id: "AUTORIZADO",
        label: "Autorización",
        icon: ShieldCheck,
        description: "Autorizado por Dirección Financiera",
        requiredRole: ["DirectoraDAF", "Admin"]
    },
    {
        id: "ENTREGADO",
        label: "Desembolso",
        icon: DollarSign,
        description: "Dinero entregado al solicitante",
        requiredRole: ["ResponsableCaja", "Admin", "ContadorGeneral"] // Quien custodia la caja
    },
    {
        id: "LIQUIDADO",
        label: "Liquidación",
        icon: FileText,
        description: "Facturas y soportes entregados",
        requiredRole: ["ContadorGeneral", "ResponsableContabilidad", "Admin"]
    }
]

interface PettyCashWorkflowProps {
    movementId: string
    currentStatus: MovementStatus
    amount: number
    onUpdate?: () => void
}

export function PettyCashWorkflow({ movementId, currentStatus, amount, onUpdate }: PettyCashWorkflowProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [rejectionReason, setRejectionReason] = useState("")
    const [showReject, setShowReject] = useState(false)

    const userRole = session?.user?.role || ""

    // Determinar índice actual
    // Map legacy statuses
    let activeStatus = currentStatus
    if (currentStatus === "PENDIENTE_VALIDACION") activeStatus = "SOLICITADO"
    if (currentStatus === "VALIDADO") activeStatus = "ENTREGADO" // Asumimos entregado si estaba validado old style

    const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === activeStatus)
    const isRejected = currentStatus === "RECHAZADO" || currentStatus === "ANULADO"
    const isCompleted = activeStatus === "LIQUIDADO"

    // Determinar siguiente paso lógico
    const nextStepIndex = currentIndex + 1
    const nextStep = WORKFLOW_STEPS[nextStepIndex]

    // Verificar permisos para avanzar
    const canAdvance = nextStep && nextStep.requiredRole?.includes(userRole)

    const handleAction = async (action: "ADVANCE" | "REJECT") => {
        if (action === "REJECT" && !rejectionReason.trim()) {
            toast.error("Debe indicar una razón para rechazar")
            return
        }

        setLoading(true)
        try {
            const response = await fetch(`/api/petty-cash/movements/${movementId}/workflow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    targetStatus: action === "ADVANCE" ? nextStep.id : "RECHAZADO",
                    reason: rejectionReason
                })
            })

            if (!response.ok) throw new Error("Error al procesar la solicitud")

            toast.success(action === "ADVANCE" ? "Estado actualizado exitosamente" : "Solicitud rechazada")
            if (onUpdate) onUpdate()
            router.refresh()
        } catch (error) {
            toast.error("Error al actualizar estado")
            console.error(error)
        } finally {
            setLoading(false)
            setShowReject(false)
        }
    }

    if (isRejected) {
        return (
            <Card className="p-6 bg-red-50/50 border-red-200">
                <div className="flex items-center gap-3 text-red-700">
                    <AlertCircle className="h-6 w-6" />
                    <div>
                        <h3 className="font-semibold">Solicitud Rechazada o Anulada</h3>
                        <p className="text-sm text-red-600">Este movimiento no puede continuar el flujo.</p>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <div className="space-y-8 py-4">
            {/* Stepper Visual */}
            <div className="relative">
                <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 rounded-full" />
                <div
                    className="absolute top-5 left-0 h-1 bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(currentIndex / (WORKFLOW_STEPS.length - 1)) * 100}%` }}
                />

                <div className="relative flex justify-between">
                    {WORKFLOW_STEPS.map((step, index) => {
                        const isActive = index === currentIndex
                        const isPast = index < currentIndex
                        const Icon = step.icon

                        return (
                            <div key={step.id} className="flex flex-col items-center group relative">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-white shadow-sm",
                                        isActive ? "border-emerald-500 text-emerald-600 scale-110 shadow-emerald-200" :
                                            isPast ? "border-emerald-500 bg-emerald-500 text-white" :
                                                "border-slate-200 text-slate-400"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="mt-3 text-center">
                                    <p className={cn(
                                        "text-xs font-bold uppercase tracking-wider transition-colors",
                                        isActive ? "text-emerald-700" : isPast ? "text-emerald-600" : "text-slate-400"
                                    )}>
                                        {step.label}
                                    </p>
                                    {isActive && (
                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-full border shadow-sm hidden md:block whitespace-nowrap">
                                            En curso
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Action Zone */}
            {!isCompleted && nextStep && (
                <Card className="p-6 border-slate-200 bg-slate-50/50 backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                Siguiente Paso: <span className="text-emerald-600">{nextStep.label}</span>
                            </h4>
                            <p className="text-sm text-slate-500 mt-1 max-w-lg">
                                {nextStep.description}.
                                {canAdvance ? (
                                    <span className="text-emerald-600 font-medium ml-1">Usted tiene permisos para realizar esta acción.</span>
                                ) : (
                                    <span className="text-amber-600 font-medium ml-1">Esperando aprobación de: {nextStep.requiredRole?.join(", ")}</span>
                                )}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {showReject ? (
                                <div className="flex flex-col bg-white p-3 rounded-lg border shadow-sm w-full md:w-80 animate-in fade-in zoom-in-95">
                                    <Textarea
                                        placeholder="Razón del rechazo..."
                                        className="text-sm mb-2 h-20"
                                        value={rejectionReason}
                                        onChange={e => setRejectionReason(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => setShowReject(false)}>Cancelar</Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleAction("REJECT")}
                                            disabled={loading}
                                        >
                                            Confirmar Rechazo
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {canAdvance && (
                                        <Button
                                            variant="outline"
                                            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                            onClick={() => setShowReject(true)}
                                        >
                                            Rechazar
                                        </Button>
                                    )}

                                    <Button
                                        className={cn(
                                            "bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px] shadow-lg shadow-emerald-900/10",
                                            !canAdvance && "opacity-50 cursor-not-allowed bg-slate-400 hover:bg-slate-400"
                                        )}
                                        disabled={!canAdvance || loading}
                                        onClick={() => handleAction("ADVANCE")}
                                    >
                                        {loading ? "Procesando..." : (
                                            <span className="flex items-center gap-2">
                                                {nextStep.label} <ChevronRight className="h-4 w-4" />
                                            </span>
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {isCompleted && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-800 font-medium">
                    <ShieldCheck className="mr-2 h-5 w-5" /> Ciclo de Caja Chica completado exitosamente.
                </div>
            )}
        </div>
    )
}
