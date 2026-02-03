"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CajaDashboard } from "@/components/caja/caja-dashboard"
import { MovementsTable } from "@/components/caja/movements-table"
import { ChecksTable } from "@/components/caja/checks-table"
import { ClosuresTable } from "@/components/caja/closures-table"
import { TesoreriaContent } from "@/components/caja/tesoreria-content"

export default function CajaPage() {
    const router = useRouter()
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">Módulo de Caja - GRACCNN</h1>
                        <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest mt-1">
                            Gestión integral de efectivo, títulos valores y emisiones de pago
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="dashboard" className="space-y-6">
                    <TabsList className="bg-slate-100 p-1 rounded-2xl h-12 gap-2">
                        <TabsTrigger value="dashboard" className="rounded-xl px-6 font-black uppercase text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-sm">Dashboard</TabsTrigger>
                        <TabsTrigger value="movements" className="rounded-xl px-6 font-black uppercase text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-sm">Movimientos</TabsTrigger>
                        <TabsTrigger value="checks" className="rounded-xl px-6 font-black uppercase text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-sm">Cheques y Bancos</TabsTrigger>
                        <TabsTrigger value="tesoreria" className="rounded-xl px-6 font-black uppercase text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-sm text-indigo-600">Tesorería y Pagos</TabsTrigger>
                        <TabsTrigger value="closures" className="rounded-xl px-6 font-black uppercase text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-sm">Cierres de Caja</TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard" className="space-y-4">
                        <CajaDashboard />
                    </TabsContent>

                    <TabsContent value="movements">
                        <MovementsTable />
                    </TabsContent>

                    <TabsContent value="checks">
                        <ChecksTable />
                    </TabsContent>

                    <TabsContent value="tesoreria">
                        <TesoreriaContent />
                    </TabsContent>

                    <TabsContent value="closures">
                        <ClosuresTable />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
