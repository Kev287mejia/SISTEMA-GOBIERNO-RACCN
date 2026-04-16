"use client"

export const dynamic = "force-dynamic";
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Position } from "@prisma/client"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import {
    User,
    IdCard,
    Briefcase,
    Calendar,
    Home,
    Mail,
    Phone,
    GraduationCap,
    Baby,
    CreditCard,
    Building2,
    Save,
    ArrowLeft,
    CheckCircle2,
    HeartPulse
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function NewEmployeePage() {
    const router = useRouter()
    const [positions, setPositions] = useState<Position[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        cedula: "",
        inss: "",
        ruc: "",
        email: "",
        telefono: "",
        direccion: "",
        fechaNacimiento: "",
        genero: "MASCULINO",
        estadoCivil: "SOLTERO",
        profesion: "",
        nivelAcademico: "UNIVERSITARIO",
        hijos: "0",
        contactoEmergencia: "",
        telefonoEmergencia: "",
        fechaIngreso: new Date().toISOString().split('T')[0],
        cargoId: "",
        salario: "",
        tipoContrato: "INDEFINIDO",
        banco: "BANPRO",
        tipoCuenta: "AHORRO",
        numeroCuenta: "",
        tipoSangre: "O+"
    })

    useEffect(() => {
        fetch("/api/hr/positions")
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch positions')
                return res.json()
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setPositions(data)
                } else {
                    setPositions([])
                }
            })
            .catch(err => {
                console.error('Error fetching positions:', err)
                setPositions([])
            })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/hr/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const msg = await res.text()
                throw new Error(msg)
            }

            router.push("/rrhh/employees")
            router.refresh()
        } catch (err: any) {
            setError(err.message || "Error al crear empleado")
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <User className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Registro de Personal</h1>
                            <p className="text-slate-500 font-medium">Alta de nuevo colaborador en el sistema de Recursos Humanos</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50 px-6"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" /> Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-black uppercase tracking-widest px-8 shadow-lg shadow-indigo-100"
                        >
                            {loading ? "Procesando..." : <><Save className="h-4 w-4 mr-2" /> Guardar Registro</>}
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="bg-rose-100 p-2 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 rotate-180" />
                        </div>
                        <p className="font-bold">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Personal Data */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Datos Identitarios */}
                        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                            <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2">
                                <IdCard className="h-4 w-4 text-indigo-600" />
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Identidad y Datos Críticos</h2>
                            </div>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-600 uppercase">Nombres *</Label>
                                        <Input
                                            required
                                            placeholder="Ej: Juan Antonio"
                                            className="bg-slate-50/50 border-slate-200 focus:bg-white h-11"
                                            value={formData.nombre}
                                            onChange={(e) => handleChange("nombre", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-600 uppercase">Apellidos *</Label>
                                        <Input
                                            required
                                            placeholder="Ej: Pérez Rodríguez"
                                            className="bg-slate-50/50 border-slate-200 focus:bg-white h-11"
                                            value={formData.apellido}
                                            onChange={(e) => handleChange("apellido", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-600 uppercase italic">Cédula Nicaragüense *</Label>
                                        <Input
                                            required
                                            placeholder="000-000000-0000X"
                                            className="bg-slate-50/50 border-slate-200 focus:bg-white h-11 font-mono"
                                            value={formData.cedula}
                                            onChange={(e) => handleChange("cedula", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-600 uppercase italic">No. INSS (Seguro Social)</Label>
                                        <Input
                                            placeholder="Opcional"
                                            className="bg-slate-50/50 border-slate-200 focus:bg-white h-11 font-mono"
                                            value={formData.inss}
                                            onChange={(e) => handleChange("inss", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-600 uppercase italic">RUC Personal</Label>
                                        <Input
                                            placeholder="Opcional"
                                            className="bg-slate-50/50 border-slate-200 focus:bg-white h-11 font-mono"
                                            value={formData.ruc}
                                            onChange={(e) => handleChange("ruc", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-600 uppercase">Fecha de Nacimiento</Label>
                                        <Input
                                            type="date"
                                            className="bg-slate-50/50 border-slate-200 h-11"
                                            value={formData.fechaNacimiento}
                                            onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-600 uppercase">Género</Label>
                                        <Select value={formData.genero} onValueChange={(v) => handleChange("genero", v)}>
                                            <SelectTrigger className="bg-slate-50/50 h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MASCULINO">Masculino</SelectItem>
                                                <SelectItem value="FEMENINO">Femenino</SelectItem>
                                                <SelectItem value="OTRO">Otro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-600 uppercase">Estado Civil</Label>
                                        <Select value={formData.estadoCivil} onValueChange={(v) => handleChange("estadoCivil", v)}>
                                            <SelectTrigger className="bg-slate-50/50 h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="SOLTERO">Soltero/a</SelectItem>
                                                <SelectItem value="CASADO">Casado/a</SelectItem>
                                                <SelectItem value="UNION_LIBRE">Unión Libre</SelectItem>
                                                <SelectItem value="DIVORCIADO">Divorciado/a</SelectItem>
                                                <SelectItem value="VIUDO">Viudo/a</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contacto y Ubicación */}
                        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                            <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2">
                                <Home className="h-4 w-4 text-indigo-600" />
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Localización y Contacto</h2>
                            </div>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-600 uppercase">Correo Electrónico</Label>
                                        <div className="relative">
                                            <Input
                                                type="email"
                                                placeholder="usuario@dominio.com"
                                                className="pl-10 bg-slate-50/50 h-11"
                                                value={formData.email}
                                                onChange={(e) => handleChange("email", e.target.value)}
                                            />
                                            <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-600 uppercase">Teléfono de Contacto</Label>
                                        <div className="relative">
                                            <Input
                                                placeholder="+505 0000-0000"
                                                className="pl-10 bg-slate-50/50 h-11 font-mono"
                                                value={formData.telefono}
                                                onChange={(e) => handleChange("telefono", e.target.value)}
                                            />
                                            <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-600 uppercase">Dirección Domiciliaria</Label>
                                    <Textarea
                                        placeholder="Dirección exacta según contrato..."
                                        className="bg-slate-50/50 border-slate-200 min-h-[80px]"
                                        value={formData.direccion}
                                        onChange={(e) => handleChange("direccion", e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cargo y Contrato */}
                        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                            <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-indigo-600" />
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Información Laboral</h2>
                            </div>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-600 uppercase">Cargo a Ocupar</Label>
                                        <Select value={formData.cargoId} onValueChange={(v) => handleChange("cargoId", v)}>
                                            <SelectTrigger className="bg-slate-50/50 h-11 border-indigo-100">
                                                <SelectValue placeholder="Seleccione cargo..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {positions.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.titulo} - {p.departamento}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-600 uppercase">Tipo de Contratación</Label>
                                        <Select value={formData.tipoContrato} onValueChange={(v) => handleChange("tipoContrato", v)}>
                                            <SelectTrigger className="bg-slate-50/50 h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INDEFINIDO">Indefinido (Plaza Fija)</SelectItem>
                                                <SelectItem value="FIJO">Determinado (Temporal)</SelectItem>
                                                <SelectItem value="SERVICIOS">Servicios Profesionales</SelectItem>
                                                <SelectItem value="PASANTIA">Pasantía</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-600 uppercase">Fecha de Ingreso *</Label>
                                        <Input
                                            type="date"
                                            className="bg-slate-50/50 border-slate-200 h-11"
                                            value={formData.fechaIngreso}
                                            onChange={(e) => handleChange("fechaIngreso", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-indigo-600 uppercase font-black">Salario Base (Mensual C$)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="bg-indigo-50/50 border-indigo-200 h-11 font-black text-indigo-700 text-lg"
                                            value={formData.salario}
                                            onChange={(e) => handleChange("salario", e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-end pb-1">
                                        {formData.tipoContrato === 'INDEFINIDO' || formData.tipoContrato === 'FIJO' ? (
                                            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 w-full flex items-center gap-2 transition-all">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black text-emerald-900 uppercase tracking-tighter">Cálculo INSS/IR habilitado</span>
                                            </div>
                                        ) : formData.tipoContrato === 'SERVICIOS' ? (
                                            <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 w-full flex items-center gap-2 transition-all">
                                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                                <span className="text-[10px] font-black text-amber-900 uppercase tracking-tighter">Régimen Servicios (Ret. 10%)</span>
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 w-full flex items-center gap-2 transition-all">
                                                <div className="h-2 w-2 rounded-full bg-slate-400" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Exento de Deducciones</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Profile & Banking */}
                    <div className="space-y-8">
                        {/* Perfil Académico */}
                        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                            <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-indigo-600" />
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Perfil Profesional</h2>
                            </div>
                            <CardContent className="p-8 space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-600 uppercase">Título / Profesión</Label>
                                    <Input
                                        placeholder="Ej: Lic. en Administración"
                                        className="bg-slate-50/50 h-11"
                                        value={formData.profesion}
                                        onChange={(e) => handleChange("profesion", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-600 uppercase">Nivel Académico</Label>
                                    <Select value={formData.nivelAcademico} onValueChange={(v) => handleChange("nivelAcademico", v)}>
                                        <SelectTrigger className="bg-slate-50/50 h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PRIMARIA">Primaria</SelectItem>
                                            <SelectItem value="SECUNDARIA">Secundaria</SelectItem>
                                            <SelectItem value="TECNICO">Técnico Medio/Sup.</SelectItem>
                                            <SelectItem value="UNIVERSITARIO">Universitario</SelectItem>
                                            <SelectItem value="POSTGRADO">Postgrado / Maestría</SelectItem>
                                            <SelectItem value="DOCTORADO">Doctorado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1">
                                        <Baby className="h-3 w-3" /> No. de Hijos
                                    </Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        className="bg-slate-50/50 h-11"
                                        value={formData.hijos}
                                        onChange={(e) => handleChange("hijos", e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Banking Info */}
                        <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-gradient-to-br from-white to-slate-50">
                            <div className="bg-slate-900 px-8 py-4 flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-indigo-400" />
                                <h2 className="text-xs font-black text-white uppercase tracking-widest">Datos de Pago</h2>
                            </div>
                            <CardContent className="p-8 space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-600 uppercase">Banco emisor</Label>
                                    <Select value={formData.banco} onValueChange={(v) => handleChange("banco", v)}>
                                        <SelectTrigger className="bg-white border-slate-200 h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BANPRO">BANPRO</SelectItem>
                                            <SelectItem value="LA_FISE">LA FISE BANCENTRO</SelectItem>
                                            <SelectItem value="BAC">BAC CREDOMATIC</SelectItem>
                                            <SelectItem value="BDF">BDF</SelectItem>
                                            <SelectItem value="BANCORP">BANCORP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-600 uppercase">No. Cuenta Bancaria</Label>
                                    <Input
                                        placeholder="00000000000"
                                        className="bg-white border-slate-200 h-11 font-mono font-bold"
                                        value={formData.numeroCuenta}
                                        onChange={(e) => handleChange("numeroCuenta", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-600 uppercase">Tipo de Cuenta</Label>
                                    <Select value={formData.tipoCuenta} onValueChange={(v) => handleChange("tipoCuenta", v)}>
                                        <SelectTrigger className="bg-white border-slate-200 h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AHORRO">Cuenta de Ahorros</SelectItem>
                                            <SelectItem value="CORRIENTE">Cuenta Corriente</SelectItem>
                                            <SelectItem value="NOMINA">Cuenta Nómina</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Emergencia y Salud */}
                        <Card className="rounded-3xl border-none shadow-sm overflow-hidden border-l-4 border-l-rose-500">
                            <div className="bg-rose-50 px-8 py-4 border-b border-rose-100 flex items-center gap-2">
                                <HeartPulse className="h-4 w-4 text-rose-600" />
                                <h2 className="text-xs font-black text-rose-900 uppercase tracking-widest">Salud y Emergencia</h2>
                            </div>
                            <CardContent className="p-8 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-600 uppercase">Tipo de Sangre</Label>
                                        <Select value={formData.tipoSangre} onValueChange={(v) => handleChange("tipoSangre", v)}>
                                            <SelectTrigger className="bg-white border-slate-200 h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A+">A+</SelectItem>
                                                <SelectItem value="A-">A-</SelectItem>
                                                <SelectItem value="B+">B+</SelectItem>
                                                <SelectItem value="B-">B-</SelectItem>
                                                <SelectItem value="AB+">AB+</SelectItem>
                                                <SelectItem value="AB-">AB-</SelectItem>
                                                <SelectItem value="O+">O+</SelectItem>
                                                <SelectItem value="O-">O-</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-600 uppercase">Contacto Emerg.</Label>
                                        <Input
                                            placeholder="Nombre"
                                            className="bg-white border-slate-200 h-11"
                                            value={formData.contactoEmergencia}
                                            onChange={(e) => handleChange("contactoEmergencia", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-600 uppercase">Teléfono de Emergencia</Label>
                                    <Input
                                        placeholder="0000-0000"
                                        className="bg-white border-slate-200 h-11 font-mono"
                                        value={formData.telefonoEmergencia}
                                        onChange={(e) => handleChange("telefonoEmergencia", e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-center italic text-slate-400 text-xs gap-4">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Validado por DAF</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Conforme Ley 815</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Protección de Datos Activa</span>
                </div>
            </div>
        </DashboardLayout>
    )
}
