"use client"

export const dynamic = "force-dynamic";
import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    BookOpen,
    LayoutDashboard,
    FileText,
    Landmark,
    Wallet,
    Receipt,
    Package,
    Briefcase,
    ClipboardList,
    BarChart3,
    Building2,
    Users,
    Settings,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    Clock,
    UserPlus,
    Printer,
    Download,
    History,
    Search,
    Lock,
    Eye,
    TrendingUp,
    AlertCircle,
    Activity,
    Smartphone,
    MousePointer2,
    Sparkles,
    Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const modules = [
    { id: "inicio-rapido", name: "Guía Paso a Paso", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-50" },
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "contabilidad", name: "Contabilidad", icon: FileText, color: "text-indigo-500", bg: "bg-indigo-50" },
    { id: "bancos", name: "Bancos", icon: Landmark, color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: "caja", name: "Caja", icon: Wallet, color: "text-amber-500", bg: "bg-amber-50" },
    { id: "caja-chica", name: "Caja Chica", icon: Wallet, color: "text-orange-500", bg: "bg-orange-50" },
    { id: "facturas", name: "Facturas", icon: Receipt, color: "text-rose-500", bg: "bg-rose-50" },
    { id: "presupuesto", name: "Presupuesto", icon: TrendingUp, color: "text-cyan-500", bg: "bg-cyan-50" },
    { id: "inventario", name: "Inventario", icon: Package, color: "text-slate-500", bg: "bg-slate-50" },
    { id: "rrhh", name: "RRHH", icon: Briefcase, color: "text-purple-500", bg: "bg-purple-50" },
    { id: "auditoria", name: "Auditoría", icon: ClipboardList, color: "text-red-500", bg: "bg-red-50" },
    { id: "reportes", name: "Reportes", icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
    { id: "entidades", name: "Entidades", icon: Building2, color: "text-slate-900", bg: "bg-slate-100" },
    { id: "usuarios", name: "Usuarios", icon: Users, color: "text-violet-500", bg: "bg-violet-50" },
    { id: "configuracion", name: "Configuración", icon: Settings, color: "text-slate-400", bg: "bg-slate-100" },
]

export default function DocumentacionPage() {
    const [activeTab, setActiveTab] = useState("inicio-rapido")

    return (
        <DashboardLayout>
            <div className="space-y-10 max-w-7xl mx-auto pb-20">
                {/* Modern Hero Header */}
                <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-12 text-white shadow-2xl border border-white/5">
                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                        <BookOpen className="h-64 w-64 rotate-12" />
                    </div>
                    <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                            <Badge variant="outline" className="border-blue-400/30 text-blue-400 uppercase tracking-[0.3em] font-black bg-blue-400/10 px-4 py-1.5 rounded-full text-[10px]">
                                Manual de Implementación
                            </Badge>
                            <h1 className="text-6xl font-black tracking-tighter leading-[1.1]">
                                Ruta del <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 italic">Especialista</span>
                            </h1>
                            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
                                Guía secuencial para dominar el sistema, desde la configuración base hasta las operaciones avanzadas de auditoría.
                            </p>
                            <div className="flex gap-4">
                                <Button
                                    onClick={() => setActiveTab("inicio-rapido")}
                                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                                >
                                    Iniciar Guía Paso a Paso
                                </Button>
                                <Button variant="outline" className="border-white/10 bg-white/5 h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white">Soporte Técnico</Button>
                            </div>
                        </div>
                        <div className="hidden md:flex flex-col gap-4">
                            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-sm relative group overflow-hidden">
                                <Activity className="h-12 w-12 text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="text-xl font-black italic">100% Operativo</h4>
                                <p className="text-slate-500 text-xs mt-2 uppercase font-black tracking-widest">Sincronización Regional Activa</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Module Navigation Sidebar */}
                    <div className="lg:w-80 shrink-0">
                        <div className="sticky top-6 space-y-2 p-2 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <h3 className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Seleccione un Módulo</h3>
                            <div className="space-y-1">
                                {modules.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setActiveTab(m.id)}
                                        className={cn(
                                            "w-full flex items-center gap-4 px-6 py-3.5 rounded-2xl transition-all font-bold text-sm text-left group",
                                            activeTab === m.id
                                                ? "bg-white shadow-xl shadow-slate-200/50 text-slate-900 border border-slate-100 scale-[1.02]"
                                                : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-700"
                                        )}
                                    >
                                        <div className={cn("p-2 rounded-xl transition-colors", activeTab === m.id ? m.bg : "bg-slate-200/50")}>
                                            <m.icon className={cn("h-4 w-4", activeTab === m.id ? m.color : "text-slate-400")} />
                                        </div>
                                        {m.name}
                                        {activeTab === m.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        {activeTab === "inicio-rapido" && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Guía de Entrenamiento Secuencial</h2>
                                    <p className="text-slate-500 font-medium">Siga estos pasos para configurar y operar su institución correctamente.</p>
                                </div>

                                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">

                                    {/* STEP 1 */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-[.is-active]:bg-amber-500 group-[.is-active]:text-white transition-colors duration-500 mt-1">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[45%] p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Badge className="bg-blue-50 text-blue-600 border-none px-3 py-1 font-black text-[10px]">PASO 01</Badge>
                                                <time className="font-mono text-[10px] text-slate-400 uppercase font-black tracking-widest">Fase Inicial</time>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 uppercase">Acceso y Configuración Base</h3>
                                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                                Lo primero es ingresar al módulo de **Configuración**. Aquí deberá establecer el nombre oficial de su institución (ej. GRACCNN) y subir el logo que aparecerá en todos los reportes y facturas.
                                            </p>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                                <MousePointer2 className="h-4 w-4 text-amber-500" />
                                                <span className="text-[10px] font-black uppercase text-slate-400">Acción Requerida: Validar Moneda Operativa</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* STEP 2 */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[45%] p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Badge className="bg-purple-50 text-purple-600 border-none px-3 py-1 font-black text-[10px]">PASO 02</Badge>
                                                <time className="font-mono text-[10px] text-slate-400 uppercase font-black tracking-widest">Catálogos Maestro</time>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 uppercase">Entidades y Personal</h3>
                                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                                Diríjase a los módulos de **Entidades** y **RRHH**. Registre a sus proveedores habituales con su RUC real y de de alta a los funcionarios clave. Sin estos registros, no podrá generar egresos ni nóminas más adelante.
                                            </p>
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="text-[8px] uppercase font-black">Validación RUC</Badge>
                                                <Badge variant="outline" className="text-[8px] uppercase font-black">Cédula INSS</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* STEP 3 */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500">
                                            <Wallet className="w-5 h-5" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[45%] p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 font-black text-[10px]">PASO 03</Badge>
                                                <time className="font-mono text-[10px] text-slate-400 uppercase font-black tracking-widest">Ciclo Operativo</time>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 uppercase">Apertura de Caja y Bancos</h3>
                                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                                Es vital entrar a **Caja** y realizar la **Apertura de Caja** con el fondo físico. Simultáneamente, verifique en **Bancos** que sus cuentas tengan los saldos iniciales correctos. El sistema impedirá cualquier gasto si no hay fondos disponibles registrados.
                                            </p>
                                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                                                <AlertCircle className="h-4 w-4 text-emerald-500" />
                                                <span className="text-[10px] font-black uppercase text-emerald-600">Importante: Ninguna transacción es retroactiva</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* STEP 4 */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500">
                                            <Receipt className="w-5 h-5" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[45%] p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Badge className="bg-rose-50 text-rose-600 border-none px-3 py-1 font-black text-[10px]">PASO 04</Badge>
                                                <time className="font-mono text-[10px] text-slate-400 uppercase font-black tracking-widest">Ejecución Gasto</time>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 uppercase">Gestión de Facturas y Egresos</h3>
                                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                                Cuando reciba una factura, regístrela en el módulo de **Facturas**. Adjunte siempre la **Evidencia Digital** (foto o PDF). El sistema vinculará este egreso automáticamente con la partida presupuestaria seleccionada.
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="h-2 rounded-full bg-rose-500" />
                                                <div className="h-2 rounded-full bg-slate-100" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* STEP 5 */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[45%] p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Badge className="bg-indigo-50 text-indigo-600 border-none px-3 py-1 font-black text-[10px]">PASO 05</Badge>
                                                <time className="font-mono text-[10px] text-slate-400 uppercase font-black tracking-widest">Validación Fiscal</time>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 uppercase">Aprobación Contable</h3>
                                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                                Los movimientos de caja y facturas aparecen como **Borradores** en el módulo de **Contabilidad**. El Contador General debe revisar estos asientos y hacer clic en **"Aprobar"**. Una vez aprobado, el asiento afecta el Libro Mayor y es inamovible.
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-500">
                                                <ShieldCheck className="h-3 w-3" /> Integridad de Libros Garantizada
                                            </div>
                                        </div>
                                    </div>

                                    {/* STEP 6 */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500">
                                            <BarChart3 className="w-5 h-5" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[45%] p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Badge className="bg-blue-50 text-blue-600 border-none px-3 py-1 font-black text-[10px]">PASO 06</Badge>
                                                <time className="font-mono text-[10px] text-slate-400 uppercase font-black tracking-widest">Auditoría y Análisis</time>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 uppercase">Análisis y Dashboards</h3>
                                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                                Use el **Dashboard** para monitorear la ejecución en tiempo real. En el módulo de **Reportes**, podrá exportar el Libro Diario y Balance General para auditorías externas de la Contraloría.
                                            </p>
                                        </div>
                                    </div>

                                    {/* STEP 7 */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[45%] p-6 bg-white rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-200/20 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 font-black text-[10px]">PASO 07</Badge>
                                                <time className="font-mono text-[10px] text-emerald-400 uppercase font-black tracking-widest">Protocolo de Control</time>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 uppercase">Auditorías Cruzadas (Logs)</h3>
                                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                                Periódicamente, el equipo de Auditoría Interna debe revisar la **Bitácora de Auditoría**. El sistema permite cruzar cada transacción financiera con la IP y el usuario que la realizó, garantizando transparencia total en el uso de fondos públicos.
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase text-emerald-700">Trazabilidad Activa al 100%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* STEP 8 */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500 mt-1">
                                            <Package className="w-5 h-5 text-slate-900" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[45%] p-6 bg-slate-900 rounded-3xl shadow-2xl space-y-4 text-white">
                                            <div className="flex items-center justify-between">
                                                <Badge className="bg-amber-400 text-slate-900 border-none px-3 py-1 font-black text-[10px]">PASO 08</Badge>
                                                <time className="font-mono text-[10px] text-slate-400 uppercase font-black tracking-widest text-white/50">Cierre de Período</time>
                                            </div>
                                            <h3 className="text-xl font-black uppercase tracking-tight">Cierre Mensual de Inventario</h3>
                                            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                                Al finalizar cada mes, se debe realizar el **Cierre de Bodega**. El sistema concilia las existencias físicas con las facturas de ingreso y vales de salida. Una vez cerrado el mes, se genera el asiento de ajuste por consumo para el Balance General.
                                            </p>
                                            <div className="flex items-center justify-center gap-4 py-2">
                                                <Sparkles className="h-8 w-8 text-amber-500 animate-pulse" />
                                                <div className="h-px bg-white/10 flex-1" />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                        {activeTab === "dashboard" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <section className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 bg-blue-50 rounded-[2rem] flex items-center justify-center">
                                            <LayoutDashboard className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 uppercase">Panel de Control (Dashboard)</h2>
                                            <p className="text-slate-500 font-medium">Visualización integral de la salud financiera regional</p>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white">
                                            <CardHeader>
                                                <CardTitle className="text-sm font-black uppercase tracking-widest text-blue-600">Indicadores Clave (KPIs)</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shrink-0"><TrendingUp className="h-5 w-5 text-emerald-500" /></div>
                                                    <div><h4 className="font-bold text-sm">Presupuesto Ejecutado</h4><p className="text-xs text-slate-500">Monto total de gastos aprobados frente al presupuesto asignado.</p></div>
                                                </div>
                                                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shrink-0"><Wallet className="h-5 w-5 text-blue-500" /></div>
                                                    <div><h4 className="font-bold text-sm">Saldos Disponibles</h4><p className="text-xs text-slate-500">Saldo real en bancos restando compromisos pendientes.</p></div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card className="border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white">
                                            <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest text-blue-400">Análisis Gráfico</CardTitle></CardHeader>
                                            <CardContent className="space-y-4">
                                                <p className="text-sm text-slate-400">El dashboard incluye gráficos dinámicos de:</p>
                                                <ul className="space-y-2">
                                                    <li className="flex items-center gap-2 text-xs font-bold bg-white/5 p-3 rounded-xl border border-white/10"><div className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Tendencia Mensual de Ejecución</li>
                                                    <li className="flex items-center gap-2 text-xs font-bold bg-white/5 p-3 rounded-xl border border-white/10"><div className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Top 5 Partidas Presupuestarias</li>
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === "contabilidad" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <section className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 bg-indigo-50 rounded-[2rem] flex items-center justify-center">
                                            <FileText className="h-8 w-8 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 uppercase">Módulo Contable</h2>
                                            <p className="text-slate-500 font-medium">Libro diario, mayores y asientos automatizados</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl space-y-8">
                                        <div className="grid md:grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <h3 className="text-xl font-bold flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-indigo-500" /> Registro de Asientos</h3>
                                                <p className="text-sm text-slate-600 leading-relaxed">Cada transacción genera un asiento en estado **BORRADOR**. El contador debe validar la partida presupuestaria y aprobarlo definitivamente.</p>
                                                <ul className="space-y-3">
                                                    <li className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                        <Badge className="bg-indigo-100 text-indigo-700 border-none px-2 py-0.5 mt-0.5">01</Badge>
                                                        <div className="text-xs font-medium text-slate-700">Validar Centro de Costo Regional.</div>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                                                <h4 className="text-indigo-400 font-black uppercase text-[10px] tracking-widest mb-4">Regla de Negocio</h4>
                                                <p className="text-lg font-bold leading-tight underline decoration-indigo-500">Ningún asiento aprobado puede ser editado o borrado.</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === "bancos" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <section className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 bg-emerald-50 rounded-[2rem] flex items-center justify-center">
                                            <Landmark className="h-8 w-8 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 uppercase">Gestión Bancaria</h2>
                                            <p className="text-slate-500 font-medium">Control de cuentas institucionales y conciliación</p>
                                        </div>
                                    </div>
                                    <Card className="border-none shadow-xl bg-white p-8">
                                        <h3 className="text-lg font-bold mb-6">Cuentas Registradas</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600 font-black text-xs">B1</div>
                                                    <div><p className="font-bold text-slate-900">Banpro - Operativa</p><p className="text-[10px] font-mono text-slate-500">100-200-300-40</p></div>
                                                </div>
                                                <Badge className="bg-emerald-600">Principal</Badge>
                                            </div>
                                        </div>
                                    </Card>
                                </section>
                            </div>
                        )}

                        {/* ... rest of the modules follow the same structure as before ... */}
                        {activeTab === "caja" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <section className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 bg-amber-50 rounded-[2rem] flex items-center justify-center">
                                            <Wallet className="h-8 w-8 text-amber-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 uppercase">Caja General</h2>
                                            <p className="text-slate-500 font-medium">Flujo de efectivo diario y cierres de sesión</p>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="p-6 rounded-3xl bg-white shadow-xl border border-slate-100">
                                            <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-6 flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500" /> Ciclo Diario</h4>
                                            <div className="space-y-6">
                                                <div className="relative pl-8 border-l-2 border-slate-100"><div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-amber-500 border-4 border-white shadow-sm" /><h5 className="font-bold text-sm">Apertura Obligatoria</h5></div>
                                                <div className="relative pl-8 border-l-2 border-slate-100"><div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-slate-300 border-4 border-white shadow-sm" /><h5 className="font-bold text-sm">Registro de Movimientos</h5></div>
                                                <div className="relative pl-8"><div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-slate-900 border-4 border-white shadow-sm" /><h5 className="font-bold text-sm">Cierre e Informe</h5></div>
                                            </div>
                                        </div>
                                        <div className="bg-amber-500 rounded-[2.5rem] p-10 text-white flex flex-col justify-end min-h-[300px]">
                                            <h3 className="text-4xl font-black leading-none mb-4">Bloqueo de Transacciones</h3>
                                            <p className="text-amber-100 text-sm">Post-cierre no se permiten nuevos movimientos para ese día.</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Summary of other modules for completeness in this view */}
                        {["caja-chica", "facturas", "presupuesto", "inventario", "rrhh", "auditoria", "reportes", "entidades", "usuarios", "configuracion"].includes(activeTab) && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <AlertCircle className="h-16 w-16 text-slate-200 mb-6" />
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Detalle de Módulo Expandido</h3>
                                <p className="text-slate-500 max-w-sm mt-2">La información detallada de este módulo sigue los estándares de auditoría regional descritos en el Paso 4 y 5 de la Guía Paso a Paso.</p>
                                <Button variant="ghost" className="mt-8 font-bold text-blue-600" onClick={() => setActiveTab("inicio-rapido")}>Volver a la Guía Paso a Paso</Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modern Support Footer */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-12 bg-white rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-b from-amber-500 to-orange-600" />
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center"><ShieldCheck className="h-6 w-6 text-amber-600" /></div>
                            <h3 className="text-2xl font-black text-slate-900">¿Dificultades en algún paso?</h3>
                        </div>
                        <p className="text-slate-500 leading-relaxed max-w-xl font-medium">Nuestro equipo técnico puede guiarlo vía remota en cada fase de la implementación inicial.</p>
                    </div>
                    <div className="flex gap-4 min-w-[300px]">
                        <Button className="h-14 flex-1 rounded-2xl bg-slate-900 hover:bg-slate-800 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200" asChild>
                            <a href="mailto:asistencia@graccnn.gob.ni">Solicitar Capacitación</a>
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
