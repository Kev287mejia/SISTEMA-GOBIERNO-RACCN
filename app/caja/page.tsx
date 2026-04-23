"use client"

export const dynamic = "force-dynamic";
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

import { ModuleHero } from "@/components/layout/module-hero"

export default function CajaPage() {
    const router = useRouter()
    return (
        <DashboardLayout>
            <div className="min-h-screen bg-[#fcfcfc]">
                <ModuleHero 
                    title="MÓDULO DE CAJA" 
                    subtitle="GESTIÓN INTEGRAL DE EFECTIVO, TÍTULOS VALORES Y EMISIONES DE PAGO"
                />

                <div className="px-12 py-8 space-y-10">

                    {/* 2. Navigation Tabs (Pills Style) */}
                    <Tabs defaultValue="dashboard" className="space-y-12">
                        <div className="flex justify-center -mt-16 relative z-30">
                            <TabsList className="bg-white/90 backdrop-blur-md p-2 h-auto gap-3 border shadow-xl rounded-[2.5rem]">
                                <TabsTrigger 
                                    value="dashboard" 
                                    className="rounded-[2rem] px-10 py-4 font-bold uppercase text-[11px] tracking-widest transition-all bg-[#8c8c8b] text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#006f8c] data-[state=active]:to-[#00a69c] data-[state=active]:text-white shadow-md hover:shadow-lg hover:opacity-90 active:scale-95"
                                >
                                    DASHBOARD
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="movements" 
                                    className="rounded-[2rem] px-10 py-4 font-bold uppercase text-[11px] tracking-widest transition-all bg-[#8c8c8b] text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#006f8c] data-[state=active]:to-[#00a69c] data-[state=active]:text-white shadow-md hover:shadow-lg hover:opacity-90 active:scale-95"
                                >
                                    MOVIMIENTOS
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="checks" 
                                    className="rounded-[2rem] px-10 py-4 font-bold uppercase text-[11px] tracking-widest transition-all bg-[#8c8c8b] text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#006f8c] data-[state=active]:to-[#00a69c] data-[state=active]:text-white shadow-md hover:shadow-lg hover:opacity-90 active:scale-95"
                                >
                                    CHEQUES Y BANCOS
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="tesoreria" 
                                    className="rounded-[2rem] px-10 py-4 font-bold uppercase text-[11px] tracking-widest transition-all bg-[#8c8c8b] text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#006f8c] data-[state=active]:to-[#00a69c] data-[state=active]:text-white shadow-md hover:shadow-lg hover:opacity-90 active:scale-95"
                                >
                                    TESORERÍA Y PAGOS
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="closures" 
                                    className="rounded-[2rem] px-10 py-4 font-bold uppercase text-[11px] tracking-widest transition-all bg-[#8c8c8b] text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#006f8c] data-[state=active]:to-[#00a69c] data-[state=active]:text-white shadow-md hover:shadow-lg hover:opacity-90 active:scale-95"
                                >
                                    CIERRES DE CAJA
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="dashboard" className="space-y-4 outline-none">
                            <CajaDashboard />
                        </TabsContent>


                        <TabsContent value="movements" className="outline-none">
                            <Card className="rounded-[2.5rem] border-slate-100 shadow-2xl">
                                <CardContent className="p-8">
                                    <MovementsTable />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="checks" className="outline-none">
                            <Card className="rounded-[2.5rem] border-slate-100 shadow-2xl">
                                <CardContent className="p-8">
                                    <ChecksTable />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="tesoreria" className="outline-none">
                            <Card className="rounded-[2.5rem] border-slate-100 shadow-2xl">
                                <CardContent className="p-8">
                                    <TesoreriaContent />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="closures" className="outline-none">
                            <Card className="rounded-[2.5rem] border-slate-100 shadow-2xl">
                                <CardContent className="p-8">
                                    <ClosuresTable />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </DashboardLayout>
    )
}
