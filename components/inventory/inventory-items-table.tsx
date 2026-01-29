"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Edit, Trash2, ArrowRightLeft } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { CreateTransactionDialog } from "./create-transaction-dialog"
import { EditInventoryItemDialog } from "./edit-inventory-item-dialog"

interface InventoryItem {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  unidadMedida: string
  categoria: string
  stockActual: number
  stockMinimo: number
  stockMaximo?: number | null
  costoUnitario: number
  activo: boolean
  metodoKardex: string
  transaccionesCount?: number
}

interface InventoryItemsTableProps {
  items: InventoryItem[]
  onRefresh: () => void
}

export function InventoryItemsTable({
  items,
  onRefresh,
}: InventoryItemsTableProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  const handleCreateTransaction = (item: InventoryItem) => {
    setSelectedItem(item)
    setTransactionDialogOpen(true)
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setEditDialogOpen(true)
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.stockActual <= item.stockMinimo) {
      return { variant: "destructive" as const, label: "Bajo" }
    }
    if (item.stockMaximo && item.stockActual >= item.stockMaximo) {
      return { variant: "secondary" as const, label: "Alto" }
    }
    return { variant: "default" as const, label: "Normal" }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>No hay items de inventario</p>
        <p className="text-sm mt-2">Crea un nuevo item para comenzar</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Código
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Nombre
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Categoría
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Stock Actual
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Stock Mínimo
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Costo Unitario
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Estado
              </th>
              <th className="text-right p-3 text-sm font-medium text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const stockStatus = getStockStatus(item)
              return (
                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 text-sm font-mono">{item.codigo}</td>
                  <td className="p-3">
                    <div className="font-medium">{item.nombre}</div>
                    {item.descripcion && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.descripcion.substring(0, 50)}
                        {item.descripcion.length > 50 ? "..." : ""}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-sm">{item.categoria}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {item.stockActual} {item.unidadMedida}
                      </span>
                      <Badge variant={stockStatus.variant} className="text-xs">
                        {stockStatus.label}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    {item.stockMinimo} {item.unidadMedida}
                  </td>
                  <td className="p-3 text-sm font-semibold">
                    {formatCurrency(item.costoUnitario)}
                  </td>
                  <td className="p-3">
                    <Badge variant={item.activo ? "default" : "outline"}>
                      {item.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateTransaction(item)}
                        title="Crear transacción"
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedItem && (
        <CreateTransactionDialog
          open={transactionDialogOpen}
          onOpenChange={setTransactionDialogOpen}
          item={selectedItem}
          onSuccess={() => {
            onRefresh()
            setTransactionDialogOpen(false)
            setSelectedItem(null)
          }}
        />
      )}

      {editingItem && (
        <EditInventoryItemDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          item={editingItem}
          onSuccess={() => {
            onRefresh()
            setEditDialogOpen(false)
            setEditingItem(null)
          }}
        />
      )}
    </>
  )
}
