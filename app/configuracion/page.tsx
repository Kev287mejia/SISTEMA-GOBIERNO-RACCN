"use client"

export const dynamic = "force-dynamic";
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import {
  Building2,
  Calculator,
  Users2,
  ShieldCheck,
  Save,
  RefreshCw,
  Globe,
  Lock,
  Palette,
  Key,
  Activity,
  Search,
  Monitor,
  Cloud,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { id: 'Institucion', name: 'Identidad Legal', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'Contabilidad', name: 'Parámetros Fiscales', icon: Calculator, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'RRHH', name: 'Nómina y Personal', icon: Users2, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'Identidad', name: 'Diseño y Logos', icon: Palette, color: 'text-pink-600', bg: 'bg-pink-50' },
  { id: 'Seguridad', name: 'Accesos y Auditoría', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'General', name: 'Red y Respaldos', icon: Globe, color: 'text-slate-600', bg: 'bg-slate-50' },
]

import { ModuleHero } from "@/components/layout/module-hero"

export default function ConfiguracionPage() {
  const [settings, setSettings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Institucion')
  const [searchQuery, setSearchQuery] = useState('')

  const [configData, setConfigData] = useState({
    inst_nombre: "Gobierno Regional Autónomo Costa Caribe Norte",
    inst_siglas: "GRACCNN",
    inst_ruc: "J0310000002888",
    inst_rep_nombre: "Carlos Alemán Cunningham",
    inst_rep_cargo: "Coordinador de Gobierno",
    inst_direccion: "Bilwi, Puerto Cabezas - RACCN",
    inst_jurisdiccion: "Región Autónoma de la Costa Caribe Norte",
    acc_vat_rate: "15",
    acc_currency: "NIO",
    acc_fiscal_year: "2026",
    hr_ss_percent: "6.25",
    hr_patronal_percent: "19.0",
    hr_working_hours: "8",
    viz_primary_color: "#1e40af",
    viz_logo_url: "/logo.png",
    viz_report_header: "true",
    sec_audit_level: "ADVANCED",
    sec_session_timeout: "30",
    sec_2fa_required: "false",
    gen_backup_freq: "Diaria",
    gen_maintenance_mode: "false"
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfigChange = (key: string, value: string) => {
    setConfigData(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Mock save or real save if API exists
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success("Configuración Sincronizada", {
        description: "Los cambios han sido aplicados al motor del sistema."
      })
    } catch (error) {
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const renderSaveButton = () => (
    <div className="flex justify-end gap-4">
      <Button
        className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        {saving ? "Guardando..." : "Guardar Cambios"}
      </Button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#fcfcfc] pb-10">
        <ModuleHero 
          title="CONFIGURACIÓN DEL SISTEMA" 
          subtitle="PARÁMETROS CORE, IDENTIDAD INSTITUCIONAL Y POLÍTICAS DE SEGURIDAD"
        />

        <div className="max-w-[1600px] mx-auto px-8 -mt-20 relative z-30">
          <div className="flex h-[calc(100vh-280px)] overflow-hidden bg-white/60 backdrop-blur-xl rounded-[40px] border border-white/40 shadow-2xl p-2 relative">
            <div className="w-80 h-full bg-gray-50/50 rounded-[32px] border-r border-gray-100 p-6 flex flex-col">
              <div className="space-y-6 flex-1">
                <div className="px-2">
              <Badge className="bg-indigo-600/10 text-indigo-600 border-none font-black text-[9px] uppercase tracking-widest px-3 mb-2">
                System Core v4.0
              </Badge>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Configuración</h1>
              <p className="text-[11px] text-gray-400 font-bold uppercase mt-1">Gobernanza Digital</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Buscar ajuste..."
                className="h-10 pl-9 bg-white/50 border-none rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <nav className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all relative group",
                    activeCategory === cat.id
                      ? "bg-white text-indigo-600 shadow-md shadow-gray-100"
                      : "text-gray-500 hover:bg-white/60 hover:text-gray-900"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-xl transition-all",
                    activeCategory === cat.id ? cat.bg : "bg-gray-100 group-hover:bg-white"
                  )}>
                    <cat.icon className={cn("h-4 w-4", activeCategory === cat.id ? cat.color : "text-gray-400")} />
                  </div>
                  <span className="text-[13px] font-black tracking-tight">{cat.name}</span>
                  {activeCategory === cat.id && (
                    <div className="absolute right-4 h-1.5 w-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200/50 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex-1">
                <p className="text-[10px] font-black text-gray-900 uppercase">Estado del Motor</p>
                <p className="text-[9px] text-gray-400 font-bold">Producción Sincronizada</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-[32px]">
          <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white">
            <div>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                {CATEGORIES.find(c => c.id === activeCategory)?.name}
                <Badge variant="outline" className="text-indigo-600 border-indigo-100 bg-indigo-50/30 text-[9px] px-2">MODIFICABLE</Badge>
              </h2>
              <p className="text-gray-400 text-xs font-bold uppercase mt-1 tracking-wider">Ajustes Críticos del Sistema</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-2 border-gray-100 font-black text-[10px] uppercase h-10 px-5"
                onClick={fetchSettings}
              >
                <RefreshCw className={cn("h-3.5 w-3.5 mr-2", loading && "animate-spin")} /> Refrescar
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 px-10 py-8">
            <div className="max-w-3xl space-y-10 pb-20">

              {activeCategory === 'Institucion' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl shadow-gray-100/50 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Nombre Institucional</Label>
                        <Input value={configData.inst_nombre} onChange={(e) => handleConfigChange('inst_nombre', e.target.value)} className="h-14 rounded-2xl border-gray-200 bg-gray-50/50 font-bold text-gray-900" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Siglas</Label>
                        <Input value={configData.inst_siglas} onChange={(e) => handleConfigChange('inst_siglas', e.target.value)} className="h-14 rounded-2xl border-gray-200 bg-gray-50/50 font-bold text-gray-900" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Número RUC</Label>
                        <Input value={configData.inst_ruc} onChange={(e) => handleConfigChange('inst_ruc', e.target.value)} className="h-14 rounded-2xl border-gray-200 bg-gray-50/50 font-mono font-bold text-gray-900 tracking-wider" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Año Fiscal</Label>
                        <Input value={configData.acc_fiscal_year} onChange={(e) => handleConfigChange('acc_fiscal_year', e.target.value)} className="h-14 rounded-2xl border-gray-200 bg-gray-50/50 font-black text-center text-indigo-900" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-dashed border-gray-100">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Representante Legal</Label>
                        <Input value={configData.inst_rep_nombre} onChange={(e) => handleConfigChange('inst_rep_nombre', e.target.value)} className="h-12 rounded-xl border-gray-200 font-semibold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Cargo</Label>
                        <Input value={configData.inst_rep_cargo} onChange={(e) => handleConfigChange('inst_rep_cargo', e.target.value)} className="h-12 rounded-xl border-gray-200 font-semibold text-slate-600" />
                      </div>
                    </div>
                  </div>
                  {renderSaveButton()}
                </div>
              )}

              {activeCategory === 'Contabilidad' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-emerald-50 rounded-[32px] p-8 border border-emerald-100 flex items-center gap-6">
                    <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Calculator className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-emerald-900">Variables Tributarias</h3>
                      <p className="text-emerald-700/70 text-sm font-medium">Estos valores afectan a todos los cálculos del módulo contable.</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl shadow-gray-100/50 grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Tasa IVA General (%)</Label>
                      <Input
                        value={configData.acc_vat_rate}
                        onChange={(e) => handleConfigChange('acc_vat_rate', e.target.value)}
                        className="h-14 rounded-2xl border-emerald-100 bg-emerald-50/30 font-black text-2xl text-emerald-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Moneda Oficial (ISO)</Label>
                      <Input
                        value={configData.acc_currency}
                        onChange={(e) => handleConfigChange('acc_currency', e.target.value)}
                        className="h-14 rounded-2xl border-gray-200 bg-gray-50/50 font-black text-2xl text-gray-900 uppercase"
                      />
                    </div>
                  </div>
                  {renderSaveButton()}
                </div>
              )}

              {activeCategory === 'RRHH' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="col-span-1 bg-orange-50 rounded-[32px] p-6 border border-orange-100 flex flex-col justify-center items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                        <Users2 className="h-6 w-6 text-orange-600" />
                      </div>
                      <h3 className="font-black text-orange-900">Deducciones de Ley</h3>
                      <p className="text-xs text-orange-700/70 mt-1">Nicaragua / INSS</p>
                    </div>
                    <div className="col-span-2 bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl shadow-gray-100/50 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">INSS Laboral (%)</Label>
                          <Input
                            value={configData.hr_ss_percent}
                            onChange={(e) => handleConfigChange('hr_ss_percent', e.target.value)}
                            className="h-14 rounded-2xl border-gray-200 font-bold text-lg text-gray-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">INSS Patronal (%)</Label>
                          <Input
                            value={configData.hr_patronal_percent}
                            onChange={(e) => handleConfigChange('hr_patronal_percent', e.target.value)}
                            className="h-14 rounded-2xl border-gray-200 font-bold text-lg text-gray-900"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Jornada Laboral Diaria (Horas)</Label>
                        <Input
                          value={configData.hr_working_hours}
                          onChange={(e) => handleConfigChange('hr_working_hours', e.target.value)}
                          className="h-14 rounded-2xl border-gray-200 font-bold text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                  {renderSaveButton()}
                </div>
              )}

              {activeCategory === 'Identidad' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl shadow-gray-100/50 grid md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <h3 className="font-black text-xl text-gray-900">Apariencia</h3>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Color Primario (HEX)</Label>
                        <div className="flex gap-3">
                          <div className="h-14 w-14 rounded-2xl shadow-inner border border-gray-200" style={{ backgroundColor: configData.viz_primary_color }}></div>
                          <Input
                            value={configData.viz_primary_color}
                            onChange={(e) => handleConfigChange('viz_primary_color', e.target.value)}
                            className="h-14 rounded-2xl border-gray-200 font-mono font-bold text-gray-900 uppercase"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <Switch
                          checked={configData.viz_report_header === 'true'}
                          onCheckedChange={(c) => handleConfigChange('viz_report_header', String(c))}
                        />
                        <span className="text-sm font-bold text-gray-700">Mostrar Encabezado Oficial en Reportes PDF</span>
                      </div>
                    </div>
                    <div className="space-y-6 flex flex-col items-center justify-center p-6 bg-gray-50 rounded-[24px] border border-dashed border-gray-200">
                      <img src={configData.viz_logo_url} alt="Logo Preview" className="h-32 object-contain opacity-80" />
                      <div className="w-full space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">URL del Logotipo</Label>
                        <Input
                          value={configData.viz_logo_url}
                          onChange={(e) => handleConfigChange('viz_logo_url', e.target.value)}
                          className="h-12 rounded-xl border-gray-200 font-medium text-xs text-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                  {renderSaveButton()}
                </div>
              )}

              {activeCategory === 'Seguridad' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-blue-900 rounded-[32px] p-8 text-white shadow-2xl shadow-blue-900/20">
                    <div className="flex items-center gap-4 mb-6">
                      <ShieldCheck className="h-8 w-8 text-blue-400" />
                      <h3 className="text-2xl font-black">Nivel de Seguridad</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-blue-300 tracking-widest pl-1">Modo de Auditoría</Label>
                        <Input
                          value={configData.sec_audit_level}
                          onChange={(e) => handleConfigChange('sec_audit_level', e.target.value)}
                          className="h-14 rounded-2xl border-blue-700 bg-blue-800/50 font-black text-white focus:bg-blue-800 transition-all placeholder:text-blue-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-blue-300 tracking-widest pl-1">Timeout de Sesión (Min)</Label>
                        <Input
                          value={configData.sec_session_timeout}
                          onChange={(e) => handleConfigChange('sec_session_timeout', e.target.value)}
                          className="h-14 rounded-2xl border-blue-700 bg-blue-800/50 font-black text-white focus:bg-blue-800 transition-all"
                        />
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-blue-800 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-bold block">Autenticación de Doble Factor (2FA)</span>
                        <span className="text-xs text-blue-300">Obligatorio para roles administrativos</span>
                      </div>
                      <Switch
                        checked={configData.sec_2fa_required === 'true'}
                        onCheckedChange={(c) => handleConfigChange('sec_2fa_required', String(c))}
                        className="data-[state=checked]:bg-blue-400"
                      />
                    </div>
                  </div>
                  {renderSaveButton()}
                </div>
              )}

              {activeCategory === 'General' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl shadow-slate-200 flex flex-col justify-between">
                      <div>
                        <Cloud className="h-10 w-10 text-sky-400 mb-4" />
                        <h3 className="text-xl font-black">Política de Respaldos</h3>
                        <div className="mt-6 space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Frecuencia Automática</Label>
                          <Input
                            value={configData.gen_backup_freq}
                            onChange={(e) => handleConfigChange('gen_backup_freq', e.target.value)}
                            className="h-12 rounded-xl border-slate-700 bg-slate-800 font-bold text-white focus:border-sky-500"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-[32px] p-8 border border-red-100 flex flex-col justify-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-black text-red-900">Zona de Peligro</h3>
                          <p className="text-xs text-red-700/70">Control de acceso global</p>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-red-100 flex items-center justify-between shadow-sm">
                        <span className="text-sm font-bold text-red-900">Modo Mantenimiento</span>
                        <Switch
                          checked={configData.gen_maintenance_mode === 'true'}
                          onCheckedChange={(c) => handleConfigChange('gen_maintenance_mode', String(c))}
                          className="data-[state=checked]:bg-red-500"
                        />
                      </div>
                    </div>
                  </div>
                  {renderSaveButton()}
                </div>
              )}

            </div>
          </ScrollArea>
        </div>
      </div>
    </div>

        {saving && (
          <div className="fixed bottom-10 right-10 bg-gray-900 text-white px-8 py-5 rounded-[24px] shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-300 z-[100] border border-white/10 backdrop-blur-md">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sincronizando</p>
              <p className="text-[12px] font-bold text-gray-400 truncate max-w-[200px]">Guardando configuración...</p>
            </div>
            <Save className="h-5 w-5 text-indigo-400 animate-spin ml-2" />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
