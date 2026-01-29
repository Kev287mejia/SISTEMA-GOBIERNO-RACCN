"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileCheck, Activity } from "lucide-react"

export default function ValidationPage() {
    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Validación de Asientos</h1>
                        <p className="text-slate-500 font-medium">Panel de control unificado para revisión de operaciones.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2">
                            <Activity className="h-4 w-4" />
                            Ver Historial
                        </Button>
                        <Button className="bg-slate-900 text-white gap-2">
                            <FileCheck className="h-4 w-4" />
                            Procesar Lote
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card className="border-dashed border-2 bg-slate-50/50">
                        <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center">
                                <FileCheck className="h-8 w-8 text-slate-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Todo al día</h3>
                                <p className="text-slate-500">No hay operaciones pendientes de validación en este momento.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
