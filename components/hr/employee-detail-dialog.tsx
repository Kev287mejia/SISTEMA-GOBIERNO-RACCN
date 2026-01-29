"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  CreditCard,
  FileText,
  History,
  Printer,
  BadgeCheck,
  AlertCircle,
  Building2,
  GraduationCap,
  HeartPulse,
  UserCheck,
  Fingerprint
} from "lucide-react"

interface EmployeeDetailDialogProps {
  employee: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmployeeDetailDialog({ employee, open, onOpenChange }: EmployeeDetailDialogProps) {
  if (!employee) return null

  const isActive = employee.estado === "ACTIVO"
  const cargoActual = employee.contratos?.[0]?.cargo?.titulo || "Sin Asignar"
  const departamento = employee.contratos?.[0]?.cargo?.departamento || "N/A"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl overflow-hidden p-0 gap-0 border-none rounded-3xl shadow-2xl">
        {/* Header Section with Profile Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <User className="h-48 w-48 rotate-12" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl font-black shadow-xl">
              {employee.nombre?.[0]}{employee.apellido?.[0]}
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
                <h2 className="text-3xl font-black tracking-tight uppercase">
                  {employee.nombre} {employee.apellido}
                </h2>
                <Badge className={`${isActive ? 'bg-emerald-400' : 'bg-amber-400'} text-gray-900 border-none font-black text-[10px] px-3 py-0.5 tracking-widest`}>
                  {employee.estado}
                </Badge>
              </div>

              <p className="text-emerald-50 text-sm font-medium flex items-center gap-2 justify-center md:justify-start">
                <Briefcase className="h-4 w-4" />
                {cargoActual} • <span className="opacity-70">{departamento}</span>
              </p>

              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                <div className="bg-black/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-emerald-300" />
                  <div className="text-[10px] leading-none">
                    <p className="text-white/60 font-black uppercase">Cédula ID</p>
                    <p className="font-bold text-sm">{employee.cedula}</p>
                  </div>
                </div>
                <div className="bg-black/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-300" />
                  <div className="text-[10px] leading-none">
                    <p className="text-white/60 font-black uppercase">Fecha Ingreso</p>
                    <p className="font-bold text-sm">{new Date(employee.fechaIngreso).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="bg-white p-8 grid grid-cols-1 md:grid-cols-6 gap-8">
          {/* Left Column: Personal Info */}
          <div className="md:col-span-4 space-y-8">
            <section className="space-y-4">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <UserCheck className="h-3.5 w-3.5" /> Información de Contacto
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4 group hover:border-emerald-200 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[9px] font-black text-gray-400 uppercase">Correo Electrónico</p>
                    <p className="text-sm font-bold text-gray-700 truncate">{employee.email || 'No registrado'}</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4 group hover:border-emerald-200 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase">Teléfono Móvil</p>
                    <p className="text-sm font-bold text-gray-700">{employee.telefono || 'No registrado'}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">Dirección de Residencia</p>
                  <p className="text-sm font-bold text-gray-700">{employee.direccion || 'No especificada'}</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <GraduationCap className="h-3.5 w-3.5" /> Datos Personales
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">F. Nacimiento</p>
                  <p className="text-xs font-bold text-gray-700">
                    {employee.fechaNacimiento ? new Date(employee.fechaNacimiento).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Género</p>
                  <p className="text-xs font-bold text-gray-700 capitalize">{employee.genero || 'N/A'}</p>
                </div>
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Estado Civil</p>
                  <p className="text-xs font-bold text-gray-700 capitalize">{employee.estadoCivil || 'N/A'}</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                <HeartPulse className="h-3.5 w-3.5" /> Información de Salud y Emergencia
              </h3>
              <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">
                    <HeartPulse className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-700 uppercase">Tipo de Sangre</p>
                    <p className="text-sm font-black text-gray-800">{employee.tipoSangre || 'O+'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Cobertura Médica</p>
                  <Badge className="bg-emerald-600 text-[9px] font-black uppercase">Seguro Social</Badge>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Financial & Audit */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-6">
              <section className="space-y-4">
                <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5" /> Depósito de Nómina
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[9px] font-black text-gray-400 uppercase">{employee.banco || 'BANPRO'}</p>
                      <Building2 className="h-4 w-4 text-gray-300" />
                    </div>
                    <p className="text-sm font-black text-gray-800 tracking-wider">
                      {employee.numeroCuenta || '**** **** **** 0000'}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{employee.tipoCuenta || 'Ahorros'}</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <History className="h-3.5 w-3.5" /> Trazabilidad
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <BadgeCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 font-black uppercase">Registrado el</p>
                      <p className="text-[11px] font-bold text-gray-700">{new Date(employee.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 font-black uppercase">Última Actualización</p>
                      <p className="text-[11px] font-bold text-gray-700">{new Date(employee.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="pt-4">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] font-medium text-amber-700 leading-tight">
                    Requiere actualización de documentos adjuntos (Cédula de Identidad vencida).
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 px-2">
              <button
                onClick={() => window.print()}
                className="w-full h-11 bg-white hover:bg-gray-50 border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-600 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Printer className="h-4 w-4" /> Imprimir Expediente
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-100"
              >
                Cerrar Registro
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
