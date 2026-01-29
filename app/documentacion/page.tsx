"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    BookOpen,
    Wallet,
    FileText,
    ShieldCheck,
    HelpCircle,
    ArrowRight,
    Users,
    Package,
    Clock,
    FileCheck2,
    Lock,
    Search,
    Printer,
    Download,
    Settings,
    Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DocumentacionPage() {
    return (
        <DashboardLayout>
            <div className="space-y-10 max-w-6xl mx-auto pb-20">
                {/* Hero Header */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-12 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <BookOpen className="h-64 w-64 rotate-12" />
                    </div>
                    <div className="relative z-10 space-y-4 max-w-2xl">
                        <Badge variant="outline" className="border-white/20 text-blue-200 uppercase tracking-[0.2em] font-black bg-white/5 px-4 py-1">
                            Manual de Operación
                        </Badge>
                        <h1 className="text-5xl font-black tracking-tight leading-tight">
                            Guía Completa del <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Sistema Contable</span>
                        </h1>
                        <p className="text-blue-100/70 text-lg font-medium leading-relaxed">
                            Aquí encontrará las instrucciones detalladas para la gestión administrativa y financiera de las instituciones del Gobierno Regional.
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="caja" className="space-y-8">
                    <TabsList className="bg-white p-1 rounded-2xl shadow-sm border h-14 w-full justify-start overflow-x-auto">
                        <TabsTrigger value="caja" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold px-6">
                            <Wallet className="h-4 w-4 mr-2" /> Caja y Bancos
                        </TabsTrigger>
                        <TabsTrigger value="contabilidad" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold px-6">
                            <FileText className="h-4 w-4 mr-2" /> Contabilidad
                        </TabsTrigger>
                        <TabsTrigger value="rrhh" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold px-6">
                            <Briefcase className="h-4 w-4 mr-2" /> RRHH y Nómina
                        </TabsTrigger>
                        <TabsTrigger value="inventario" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold px-6">
                            <Package className="h-4 w-4 mr-2" /> Bodega
                        </TabsTrigger>
                        <TabsTrigger value="seguridad" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold px-6">
                            <ShieldCheck className="h-4 w-4 mr-2" /> Seguridad
                        </TabsTrigger>
                    </TabsList>

                    {/* CAJA MODULE */}
                    <TabsContent value="caja" className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <Card className="col-span-2 border-none shadow-sm bg-white overflow-hidden">
                                <CardHeader className="bg-slate-50/50 pb-6 border-b border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-200">
                                            <Wallet className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">Gestión de Tesorería (Caja)</CardTitle>
                                            <CardDescription>Flujo de trabajo para los Responsables de Caja</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                            <ArrowRight className="h-4 w-4 text-primary" /> Paso 1: Apertura de Caja
                                        </h4>
                                        <p className="text-sm text-slate-600 pl-6 border-l-2 border-slate-100 ml-2">
                                            Al iniciar la jornada, debe hacer clic en <strong>&quot;Abrir Caja&quot;</strong> en el módulo de Caja. El sistema le solicitará el <strong>Monto Inicial</strong> de efectivo físico. Ningún movimiento podrá registrarse sin una caja abierta.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                            <ArrowRight className="h-4 w-4 text-primary" /> Paso 2: Registro de Movimientos
                                        </h4>
                                        <div className="pl-6 border-l-2 border-slate-100 ml-2 space-y-3">
                                            <p className="text-sm text-slate-600">
                                                Para cada cobro o pago en efectivo, use la opción <strong>&quot;Nuevo Movimiento&quot;</strong>:
                                            </p>
                                            <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
                                                <li>Seleccione si es INGRESO o EGRESO.</li>
                                                <li>Indique la Institución (GRACCNN o Concejo).</li>
                                                <li>Especifique el monto y la referencia (No. de Recibo/Factura).</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                            <ArrowRight className="h-4 w-4 text-primary" /> Paso 3: Operaciones Bancarias (Cheques)
                                        </h4>
                                        <p className="text-sm text-slate-600 pl-6 border-l-2 border-slate-100 ml-2">
                                            El registro de cheques recibidos o emitidos debe ser exacto. Asegúrese de ingresar el <strong>Número de Cheque</strong> y el <strong>Banco</strong> correctamente para evitar rechazos en auditoría.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                            <ArrowRight className="h-4 w-4 text-primary" /> Paso 4: Cierre y Bloqueo
                                        </h4>
                                        <p className="text-sm text-slate-600 pl-6 border-l-2 border-slate-100 ml-2">
                                            Al finalizar el día, use <strong>&quot;Cerrar Caja Actual&quot;</strong>. El sistema conciliará automáticamente los montos. Una vez cerrada, <strong>no se permiten modificaciones</strong> en los registros de ese período.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                <Card className="bg-indigo-600 text-white border-none shadow-xl overflow-hidden">
                                    <CardContent className="p-8 space-y-4">
                                        <Clock className="h-10 w-10 opacity-30" />
                                        <h3 className="text-xl font-bold">Importante</h3>
                                        <p className="text-indigo-100 text-sm leading-relaxed">
                                            Los cierres de caja son registrados con la marca de tiempo exacta del sistema. No se puede realizar un cierre retroactivo.
                                        </p>
                                        <div className="pt-4 border-t border-white/10">
                                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">Normativa GRACCNN</Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-sm bg-white">
                                    <div className="p-6">
                                        <h4 className="font-bold mb-4">Preguntas Frecuentes</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs font-bold text-primary mb-1">¿Qué pasa si me equivoqué de monto?</p>
                                                <p className="text-xs text-slate-500">Debe solicitar al Contador General que anule el registro y crear uno nuevo. Las cajeras no pueden borrar historial.</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* CONTABILIDAD MODULE */}
                    <TabsContent value="contabilidad" className="space-y-6">
                        <Card className="border-none shadow-sm bg-white p-8">
                            <div className="max-w-3xl space-y-8">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900">Uso del Módulo Contable</h2>
                                    <p className="text-slate-500">Manual para Contadores y Auxiliares</p>
                                </div>

                                <div className="grid gap-8">
                                    <div className="flex gap-4">
                                        <div className="bg-emerald-50 text-emerald-600 h-10 w-10 rounded-full flex items-center justify-center shrink-0 font-bold">1</div>
                                        <div className="space-y-2">
                                            <h4 className="font-bold">Asientos Contables</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                Cada ingreso o egreso de caja genera una notificación para el Contador. Usted debe ingresar al detalle del asiento, asignar el <strong>Centro de Costo</strong> correspondiente y validar que la documentación esté completa.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="bg-emerald-50 text-emerald-600 h-10 w-10 rounded-full flex items-center justify-center shrink-0 font-bold">2</div>
                                        <div className="space-y-2">
                                            <h4 className="font-bold">Validación y Aprobación</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                Solo los usuarios con rol <strong>&quot;Contador General&quot;</strong> o <strong>&quot;Admin&quot;</strong> pueden cambiar el estado de un asiento de PENDIENTE a APROBADO.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="bg-emerald-50 text-emerald-600 h-10 w-10 rounded-full flex items-center justify-center shrink-0 font-bold">3</div>
                                        <div className="space-y-2">
                                            <h4 className="font-bold">Reportes de Auditoría</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                En la sección de Reportes, puede filtrar por rango de fechas, institución o tipo de moneda para generar el balance general en formato CSV descargable.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* RRHH MODULE */}
                    <TabsContent value="rrhh" className="space-y-6">
                        <Card className="border-none shadow-sm bg-white p-8">
                            <div className="max-w-3xl space-y-8">
                                <h2 className="text-2xl font-black text-slate-900">Manual de Recursos Humanos</h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 w-fit rounded-xl">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <h4 className="font-bold">Gestión de Empleados</h4>
                                        <p className="text-sm text-slate-600">
                                            Para agregar un nuevo colaborador, ingrese la Cédula y verifique si ya existe en la base de datos nacional del GRACCNN. El sistema validará automáticamente la duplicidad por número de cédula.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-3 bg-rose-50 text-rose-600 w-fit rounded-xl">
                                            <FileCheck2 className="h-6 w-6" />
                                        </div>
                                        <h4 className="font-bold">Proceso de Nómina</h4>
                                        <p className="text-sm text-slate-600">
                                            La nómina se genera mensualmente. Debe cargar las bonificaciones y deducciones antes de &quot;Cerrar Nómina&quot;. Una vez cerrada, se envía la orden de pago al módulo de Caja.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* SEGURIDAD MODULE */}
                    <TabsContent value="seguridad" className="space-y-6">
                        <div className="bg-slate-900 rounded-3xl p-10 text-white space-y-8 relative overflow-hidden shadow-2xl">
                            <div className="absolute bottom-0 right-0 p-10 opacity-5">
                                <Lock className="h-64 w-64" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <h2 className="text-3xl font-black flex items-center gap-3">
                                    <ShieldCheck className="h-8 w-8 text-emerald-400" />
                                    Política de Seguridad Institucional
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    El sistema utiliza un estricto Protocolo de Auditoría y Control de Acceso.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 relative z-10">
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-3">
                                    <h4 className="font-bold text-emerald-400 uppercase tracking-tighter text-xs">Bitácora de Auditoría</h4>
                                    <p className="text-sm text-slate-300">
                                        Cada clic, creación o edición es vinculada a su usuario, fecha e IP. Los auditores revisan estos logs semanalmente para detectar anomalías.
                                    </p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-3">
                                    <h4 className="font-bold text-emerald-400 uppercase tracking-tighter text-xs">Protección de Datos</h4>
                                    <p className="text-sm text-slate-300">
                                        Las contraseñas están encriptadas bajo estándares de alta seguridad. Solo usted conoce sus credenciales. No las comparta ni las deje anotadas cerca de su estación de trabajo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Support Footer */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-12 bg-white rounded-3xl border border-slate-100 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 h-full w-2 bg-primary"></div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <HelpCircle className="h-8 w-8 text-primary" />
                            <h3 className="text-2xl font-black text-slate-900">¿Necesita asistencia adicional?</h3>
                        </div>
                        <p className="text-slate-500 leading-relaxed max-w-xl">
                            Si encuentra dificultades técnicas o requiere capacitación presencial para su área, contacte a la División de Informática y Modernización del Gobierno Regional.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 min-w-[200px]">
                        <Button className="h-14 rounded-2xl font-black shadow-lg shadow-blue-200" asChild>
                            <a href="mailto:informatica@graccnn.gob.ni">Enviar Ticket</a>
                        </Button>
                        <Button variant="ghost" className="h-14 rounded-2xl font-bold border-2 border-slate-50 hover:bg-slate-50" asChild>
                            <a href="#" className="flex items-center justify-center gap-2">
                                <Download className="h-4 w-4" /> Bajar PDF Manual
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
