
import React, { useRef } from 'react'
import { formatCurrency } from '@/lib/utils'

interface OrderItem {
    id: string
    descripcion: string
    cantidad: number
    unidadMedida: string
    precioUnitario: number
    total: number
}

interface PurchaseOrder {
    id: string
    numero: string
    proveedor: {
        nombre: string
        ruc: string
        direccion: string
    }
    elaboradoPor: {
        nombre: string
        apellido: string
    }
    fechaEmision: string
    fechaEntrega?: string
    items: OrderItem[]
    total: number
    observaciones?: string
}

interface ReceptionActProps {
    order: PurchaseOrder
    onClose: () => void
}

export function ReceptionActPrint({ order, onClose }: ReceptionActProps) {
    const printRef = useRef<HTMLDivElement>(null)

    const handlePrint = () => {
        const content = printRef.current
        if (!content) return

        const printWindow = window.open('', '', 'width=800,height=600')
        if (!printWindow) return

        const styles = `
            @page { size: letter; margin: 1in; }
            body { font-family: 'Times New Roman', serif; padding: 20px; color: #000; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .header h1 { font-size: 18px; text-transform: uppercase; margin: 0; font-weight: bold; }
            .header h2 { font-size: 14px; text-transform: uppercase; margin: 5px 0 0; font-weight: normal; }
            .title { text-align: center; margin: 20px 0; font-size: 16px; font-weight: bold; text-decoration: underline; text-transform: uppercase; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; font-size: 12px; }
            .info-row { margin-bottom: 5px; }
            .label { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px; }
            th { border: 1px solid #000; padding: 8px; background: #f0f0f0; text-transform: uppercase; }
            td { border: 1px solid #000; padding: 8px; }
            .totals { margin-top: 10px; text-align: right; font-size: 12px; font-weight: bold; }
            .signatures { margin-top: 80px; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .signature-block { width: 30%; text-align: center; border-top: 1px solid #000; padding-top: 10px; font-size: 11px; }
            .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #666; width: 100%; border-top: 1px solid #ccc; padding-top: 10px; }
            .logo-placeholder { font-weight: bold; font-size: 20px; margin-bottom: 10px; } /* Replace with actual image later */
        `

        printWindow.document.write(`
            <html>
                <head>
                    <title>Acta de Recepción - ${order.numero}</title>
                    <style>${styles}</style>
                </head>
                <body>
                    ${content.innerHTML}
                </body>
            </html>
        `)

        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 250)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                {/* Close Button Header */}
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
                    <h2 className="font-bold text-lg">Vista Previa de Acta</h2>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cerrar</button>
                        <button onClick={handlePrint} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold flex items-center gap-2">
                            Imprimir
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div className="p-8 bg-white" ref={printRef}>
                    {/* Header */}
                    <div className="header">
                        <div className="logo-placeholder">GOBIERNO REGIONAL AUTÓNOMO COSTA CARIBE NORTE</div>
                        <h1>Acta de Recepción de Bienes y Servicios</h1>
                        <h2>Bodega Central - Bilwi</h2>
                    </div>

                    <div className="title">
                        REF: ORDÉN DE COMPRA N° {order.numero}
                    </div>

                    <div className="info-grid">
                        <div className="col">
                            <div className="info-row"><span className="label">Proveedor:</span> {order.proveedor.nombre}</div>
                            <div className="info-row"><span className="label">RUC:</span> {order.proveedor.ruc}</div>
                            <div className="info-row"><span className="label">Dirección:</span> {order.proveedor.direccion}</div>
                        </div>
                        <div className="col">
                            <div className="info-row"><span className="label">Fecha Elaboración:</span> {new Date().toLocaleDateString()}</div>
                            <div className="info-row"><span className="label">Fecha Orden:</span> {new Date(order.fechaEmision).toLocaleDateString()}</div>
                            <div className="info-row"><span className="label">Fecha Recepción:</span> {order.fechaEntrega ? new Date(order.fechaEntrega).toLocaleDateString() : '____________'}</div>
                            <div className="info-row"><span className="label">Solicitado Por:</span> {order.elaboradoPor.nombre} {order.elaboradoPor.apellido}</div>
                        </div>
                    </div>

                    <p style={{ fontSize: '12px', marginBottom: '10px' }}>
                        Por medio de la presente se hace constar que se han recibido a entera satisfacción los siguientes bienes/servicios, cumpliendo con las especificaciones técnicas y condiciones estipuladas en la orden de compra de referencia.
                    </p>

                    {/* Items Table */}
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}>No.</th>
                                <th style={{ width: '10%' }}>Cant.</th>
                                <th style={{ width: '10%' }}>Unidad</th>
                                <th style={{ width: '45%' }}>Descripción del Bien / Servicio</th>
                                <th style={{ width: '15%', textAlign: 'right' }}>Valor Unit.</th>
                                <th style={{ width: '15%', textAlign: 'right' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, index) => (
                                <tr key={item.id}>
                                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                    <td style={{ textAlign: 'center' }}>{item.cantidad}</td>
                                    <td style={{ textAlign: 'center' }}>{item.unidadMedida}</td>
                                    <td>{item.descripcion}</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.precioUnitario)}</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="totals">
                        TOTAL RECIBIDO: {formatCurrency(order.total)}
                    </div>

                    {order.observaciones && (
                        <div style={{ marginTop: '20px', fontSize: '11px', border: '1px solid #ccc', padding: '10px' }}>
                            <strong>OBSERVACIONES:</strong><br />
                            {order.observaciones}
                        </div>
                    )}

                    {/* Signatures */}
                    <div className="signatures">
                        <div className="signature-block">
                            <br /><br />_________________________<br />
                            <strong>ENTREGADO POR</strong><br />
                            {order.proveedor.nombre}<br />
                            (Firma y Sello)
                        </div>
                        <div className="signature-block">
                            <br /><br />_________________________<br />
                            <strong>RECIBIDO POR</strong><br />
                            RESPONSABLE DE BODEGA<br />
                            (Nombre, Firma y Sello)
                        </div>
                        <div className="signature-block">
                            <br /><br />_________________________<br />
                            <strong>VISTO BUENO</strong><br />
                            ADMINISTRACIÓN<br />
                            (Nombre, Firma y Sello)
                        </div>
                    </div>

                    <div className="footer">
                        Este documento es comprobante de entrega y recepción conforme. Original para Contabilidad, Copia para Bodega.
                        Generado por Sistema de Gestión Gubernamental el {new Date().toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    )
}
