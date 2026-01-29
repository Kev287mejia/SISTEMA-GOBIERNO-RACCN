"use client"

import { useEffect, useState } from "react"
import { useSocket, AccountingEntryEvent } from "@/hooks/useSocket"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react"
import { EntryType, Institution } from "@prisma/client"

interface AccountingEntry {
  id: string
  numero: string
  tipo: EntryType
  monto: number
  descripcion: string
  institucion: Institution
  estado: string
  fecha: Date
  creadoPor?: {
    nombre: string
    apellido?: string
  }
  aprobadoPor?: {
    nombre: string
    apellido?: string
  }
}

export function AccountingEntriesRealtime() {
  const [recentEntries, setRecentEntries] = useState<AccountingEntry[]>([])
  const [stats, setStats] = useState({
    totalIngresos: 0,
    totalEgresos: 0,
    pendientes: 0,
    aprobados: 0,
  })

  const handleEntryCreated = (data: AccountingEntry) => {
    setRecentEntries((prev) => [data, ...prev].slice(0, 10))
    updateStats(data, "created")
  }

  const handleEntryUpdated = (data: AccountingEntry) => {
    setRecentEntries((prev) =>
      prev.map((entry) => (entry.id === data.id ? data : entry))
    )
    updateStats(data, "updated")
  }

  const handleEntryDeleted = (data: AccountingEntry) => {
    setRecentEntries((prev) => prev.filter((entry) => entry.id !== data.id))
    updateStats(data, "deleted")
  }

  const handleEntryApproved = (data: AccountingEntry) => {
    setRecentEntries((prev) =>
      prev.map((entry) => (entry.id === data.id ? data : entry))
    )
    updateStats(data, "approved")
  }

  const updateStats = (entry: AccountingEntry, action: string) => {
    setStats((prev) => {
      const newStats = { ...prev }

      if (action === "created") {
        if (entry.tipo === EntryType.INGRESO) {
          newStats.totalIngresos += Number(entry.monto)
        } else {
          newStats.totalEgresos += Number(entry.monto)
        }
        if (entry.estado === "PENDIENTE") {
          newStats.pendientes += 1
        }
      } else if (action === "updated") {
        // Recalculate based on current state
        // This is simplified - in production, you'd want to fetch fresh data
      } else if (action === "approved") {
        newStats.pendientes = Math.max(0, newStats.pendientes - 1)
        newStats.aprobados += 1
      } else if (action === "deleted") {
        if (entry.tipo === EntryType.INGRESO) {
          newStats.totalIngresos = Math.max(0, newStats.totalIngresos - Number(entry.monto))
        } else {
          newStats.totalEgresos = Math.max(0, newStats.totalEgresos - Number(entry.monto))
        }
        if (entry.estado === "PENDIENTE") {
          newStats.pendientes = Math.max(0, newStats.pendientes - 1)
        }
      }

      return newStats
    })
  }

  const { isConnected } = useSocket({
    onEntryCreated: handleEntryCreated,
    onEntryUpdated: handleEntryUpdated,
    onEntryDeleted: handleEntryDeleted,
    onEntryApproved: handleEntryApproved,
    enabled: true,
  })

  const getInstitutionBadge = (institucion: Institution) => {
    return institucion === Institution.GOBIERNO ? (
      <Badge variant="default">Gobierno</Badge>
    ) : (
      <Badge variant="secondary">Concejo</Badge>
    )
  }

  const getTypeIcon = (tipo: EntryType) => {
    return tipo === EntryType.INGRESO ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="text-sm text-muted-foreground">
          {isConnected ? "Conectado en tiempo real" : "Desconectado"}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalIngresos)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalEgresos)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendientes}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.aprobados}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Asientos Contables Recientes</CardTitle>
          <CardDescription>
            Actualización en tiempo real de los últimos asientos contables
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentEntries.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No hay asientos contables recientes. Los nuevos asientos aparecerán aquí automáticamente.
            </div>
          ) : (
            <div className="space-y-4">
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getTypeIcon(entry.tipo)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.numero}</span>
                        {getInstitutionBadge(entry.institucion)}
                        <Badge
                          variant={
                            entry.estado === "APROBADO"
                              ? "default"
                              : entry.estado === "PENDIENTE"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {entry.estado}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {entry.descripcion}
                      </p>
                      {entry.creadoPor && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Creado por: {entry.creadoPor.nombre}{" "}
                          {entry.creadoPor.apellido}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-bold ${
                        entry.tipo === EntryType.INGRESO
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(Number(entry.monto))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(entry.fecha).toLocaleDateString("es-CR")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
