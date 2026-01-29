"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    FileBarChart,
    Users,
    CreditCard,
    FileText,
    Download,
    Printer,
    ArrowRight
} from "lucide-react"

export default function HRReportsPage() {
    const reportCategories = [
        {
            title: "Informes de Personal",
            description: "Listados y estadísticas de empleados",
            reports: [
                { name: "Listado Maestro de Empleados", icon: Users },
                { name: "Distribución por Departamentos", icon: FileBarChart },
                { name: "Contratos por Vencer", icon: FileText },
            ]
        },
        {
            title: "Informes de Nómina",
            description: "Resúmenes de pagos y deducciones",
            reports: [
                { name: "Resumen de Nómina Mensual", icon: CreditCard },
                { name: "Desglose de Deducciones (INSS/IR)", icon: FileBarChart },
                { name: "Aportes Patronales", icon: CreditCard },
            ]
        }
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Reportes de Recursos Humanos</h1>
                <p className="text-gray-600 mt-1">
                    Generación de informes estratégicos y operativos
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {reportCategories.map((category, idx) => (
                    <Card key={idx}>
                        <CardHeader>
                            <CardTitle>{category.title}</CardTitle>
                            <CardDescription>{category.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {category.reports.map((report, rIdx) => (
                                <div key={rIdx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <report.icon className="h-5 w-5 text-primary" />
                                        <span className="text-sm font-medium">{report.name}</span>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Reporte Personalizado</CardTitle>
                    <CardDescription>Configure los parámetros para un reporte a medida</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <Button className="flex-1 gap-2" variant="outline">
                            <FileText className="h-4 w-4" /> Filtrar por Fecha
                        </Button>
                        <Button className="flex-1 gap-2" variant="outline">
                            <Users className="h-4 w-4" /> Filtrar por Departamento
                        </Button>
                        <Button className="flex-1 gap-2">
                            Generar Reporte Avanzado
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
