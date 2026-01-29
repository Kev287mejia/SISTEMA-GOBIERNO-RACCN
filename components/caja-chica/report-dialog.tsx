"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Printer, Download, FileText } from "lucide-react"
import { toast } from "sonner"

export function PettyReportDialog({ open, onOpenChange, boxes }: { open: boolean, onOpenChange: (open: boolean) => void, boxes: any[] }) {
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        boxId: "all",
        institution: "all"
    })

    const handlePrint = async () => {
        const query = new URLSearchParams(filters).toString()
        window.open(`/caja-chica/reports/preview?${query}`, '_blank')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        Configurar Reporte de Caja Chica
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Desde</Label>
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Hasta</Label>
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Seleccionar Caja Chica</Label>
                        <Select value={filters.boxId} onValueChange={(v) => setFilters({ ...filters, boxId: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todas las cajas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las cajas</SelectItem>
                                {boxes.map(box => (
                                    <SelectItem key={box.id} value={box.id}>{box.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Institución</Label>
                        <Select value={filters.institution} onValueChange={(v) => setFilters({ ...filters, institution: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Cualquiera</SelectItem>
                                <SelectItem value="GOBIERNO">GRACCNN</SelectItem>
                                <SelectItem value="CONCEJO">Concejo Regional</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2" onClick={handlePrint} disabled={loading}>
                        <Printer className="h-4 w-4" />
                        {loading ? "Generando..." : "Vista Previa / Imprimir"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
