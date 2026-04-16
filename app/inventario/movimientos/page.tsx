"use client"

export const dynamic = "force-dynamic";
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRightLeft, Search, Filter, Link as LinkIcon } from "lucide-react"
import { InventoryTransactionType } from "@prisma/client"
import { formatCurrency } from "@/lib/utils"

export default function MovimientosPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("")
  const [filterItemId, setFilterItemId] = useState<string>("")
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/inventory/items?limit=1000")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setItems(data.data)
        }
      })
      .catch(console.error)
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterTipo) params.append("tipo", filterTipo)
      if (filterItemId) params.append("itemId", filterItemId)

      const response = await fetch(`/api/inventory/transactions?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.data)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [filterTipo, filterItemId])

  const getTipoBadge = (tipo: InventoryTransactionType) => {
    const variants: Record<InventoryTransactionType, "default" | "secondary" | "outline" | "destructive"> = {
      ENTRADA: "default",
      SALIDA: "destructive",
      AJUSTE: "secondary",
      DEVOLUCION: "outline",
    }
    return (
      <Badge variant={variants[tipo] || "outline"}>{tipo}</Badge>
    )
  }

  const filteredTransactions = transactions.filter((t) => {
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        t.item.nombre.toLowerCase().includes(searchLower) ||
        t.item.codigo.toLowerCase().includes(searchLower) ||
        t.numeroDocumento?.toLowerCase().includes(searchLower) ||
        t.usuario.nombre.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Movimientos de Inventario
          </h1>
          <p className="text-gray-600 mt-2">
            Historial de todas las transacciones de inventario (Kardex)
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por producto, código, documento o usuario..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Todos los tipos</option>
                  <option value={InventoryTransactionType.ENTRADA}>Entrada</option>
                  <option value={InventoryTransactionType.SALIDA}>Salida</option>
                  <option value={InventoryTransactionType.AJUSTE}>Ajuste</option>
                  <option value={InventoryTransactionType.DEVOLUCION}>
                    Devolución
                  </option>
                </select>
              </div>
              <div>
                <select
                  value={filterItemId}
                  onChange={(e) => setFilterItemId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Todos los items</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.codigo} - {item.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Transacciones
            </CardTitle>
            <CardDescription>
              {filteredTransactions.length} transacciones encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                <p className="text-sm text-muted-foreground">
                  Cargando transacciones...
                </p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No hay transacciones de inventario</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium text-gray-700">
                        Fecha
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">
                        Producto
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">
                        Tipo
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">
                        Cantidad
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">
                        Costo Unitario
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">
                        Costo Total
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">
                        Responsable
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">
                        Documento
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">
                        Asiento Contable
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3 text-sm">
                          {new Date(transaction.fecha).toLocaleDateString("es-CR")}
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{transaction.item.nombre}</div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.item.codigo}
                          </div>
                        </td>
                        <td className="p-3">{getTipoBadge(transaction.tipo)}</td>
                        <td className="p-3 text-sm">
                          {transaction.cantidad} {transaction.item.unidadMedida}
                        </td>
                        <td className="p-3 text-sm font-semibold">
                          {formatCurrency(transaction.costoUnitario)}
                        </td>
                        <td className="p-3 text-sm font-semibold">
                          {formatCurrency(transaction.costoTotal)}
                        </td>
                        <td className="p-3 text-sm">
                          {transaction.usuario.nombre} {transaction.usuario.apellido}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {transaction.numeroDocumento || "-"}
                        </td>
                        <td className="p-3">
                          {transaction.accountingEntry ? (
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <LinkIcon className="h-3 w-3" />
                              {transaction.accountingEntry.numero}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
