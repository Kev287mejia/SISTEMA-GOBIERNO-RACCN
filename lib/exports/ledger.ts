import * as XLSX from 'xlsx'

/**
 * Exports accounting entries to a "Libro Mayor" formatted Excel file
 */
export async function exportGeneralLedger(entries: any[]) {
    // 1. Group by account
    const ledgerMap: Record<string, any[]> = {}

    entries.forEach(entry => {
        const account = entry.cuentaContable || 'SIN CUENTA'
        if (!ledgerMap[account]) ledgerMap[account] = []
        ledgerMap[account].push(entry)
    })

    const wb = XLSX.utils.book_new()

    // 2. Create Summary Sheet
    const summaryData = Object.entries(ledgerMap).map(([account, accEntries]) => {
        const totalDebe = accEntries.reduce((sum, e) => sum + (e.tipo === 'INGRESO' ? Number(e.monto) : 0), 0)
        const totalHaber = accEntries.reduce((sum, e) => sum + (e.tipo === 'EGRESO' ? Number(e.monto) : 0), 0)
        return {
            'Cuenta Contable': account,
            'Descripción Cuenta': accEntries[0]?.cuentaNombre || 'N/A',
            'Total Debe': totalDebe,
            'Total Haber': totalHaber,
            'Saldo Neto': totalDebe - totalHaber
        }
    })

    const wsSummary = XLSX.utils.json_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen Mayor")

    // 3. Create Detailed Sheet
    const detailedData = entries.map(e => ({
        'Fecha': new Date(e.fecha).toLocaleDateString('es-NI'),
        'Número': e.numero,
        'Tipo': e.tipo,
        'Cuenta': e.cuentaContable,
        'Concepto': e.descripcion,
        'Institución': e.institucion,
        'Estado': e.estado,
        'Debe': e.tipo === 'INGRESO' ? Number(e.monto) : 0,
        'Haber': e.tipo === 'EGRESO' ? Number(e.monto) : 0
    }))

    const wsDetailed = XLSX.utils.json_to_sheet(detailedData)
    XLSX.utils.book_append_sheet(wb, wsDetailed, "Movimientos Detallados")

    // 4. Download
    const fileName = `Libro_Mayor_General_${new Date().getFullYear()}.xlsx`
    XLSX.writeFile(wb, fileName)
}
