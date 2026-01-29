"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CajaDashboard } from "@/components/caja/caja-dashboard"
import { MovementsTable } from "@/components/caja/movements-table"
import { ChecksTable } from "@/components/caja/checks-table"
import { ClosuresTable } from "@/components/caja/closures-table"

export default function CajaPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Módulo de Caja - GRACCNN</h1>
                    <p className="text-muted-foreground">
                        Gestión de movimientos de efectivo, cheques y cierres de caja.
                    </p>
                </div>

                <Tabs defaultValue="dashboard" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                        <TabsTrigger value="movements">Movimientos</TabsTrigger>
                        <TabsTrigger value="checks">Cheques y Bancos</TabsTrigger>
                        <TabsTrigger value="closures">Cierres de Caja</TabsTrigger>
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

                    <TabsContent value="closures">
                        <ClosuresTable />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
