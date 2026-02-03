# Sistema de Expediente Digital de Evidencias

## Descripción General

El **Sistema de Expediente Digital** es un módulo de control y auditoría que obliga la carga de documentos de respaldo (facturas, resoluciones, contratos, etc.) para asientos contables que excedan ciertos montos, garantizando la trazabilidad y transparencia de las operaciones financieras.

## Características Principales

### 1. **Validación Automática por Monto**
- **Umbral Configurado**: C$ 5,000.00
- Los asientos con montos ≥ C$ 5,000 **requieren obligatoriamente** al menos 1 documento de evidencia
- Los asientos menores a este monto pueden tener evidencias opcionales

### 2. **Tipos de Archivos Permitidos**
- **PDF** - Facturas, contratos, resoluciones
- **JPG/JPEG** - Fotografías de documentos
- **PNG** - Capturas de pantalla, documentos escaneados

### 3. **Límites de Seguridad**
- **Tamaño máximo por archivo**: 10 MB
- **Almacenamiento**: `/public/uploads/evidencias/`
- **Nomenclatura**: `{numero_asiento}_{timestamp}.{extension}`

### 4. **Integración con Auditoría**
Todas las acciones relacionadas con evidencias se registran automáticamente:
- Carga de documentos
- Eliminación de documentos
- Aprobación de asientos con/sin evidencias
- Intentos de aprobación bloqueados por falta de evidencia

## Flujo de Trabajo

### Para Auxiliares Contables / Contadores

1. **Crear Asiento Contable**
   - Ingresar a `/contabilidad/nuevo`
   - Completar información del asiento
   - Guardar como BORRADOR

2. **Adjuntar Evidencias** (si monto ≥ C$ 5,000)
   - Hacer clic en el asiento desde el Libro Mayor
   - En el diálogo de detalles, usar el componente "Expediente Digital"
   - Arrastrar y soltar archivos o hacer clic en "Adjuntar Documento"
   - Verificar que aparezca el badge "COMPLETO"

3. **Solicitar Aprobación**
   - Cambiar estado del asiento a "PENDIENTE"
   - El sistema validará automáticamente las evidencias

### Para Aprobadores (Contador General, Directores)

1. **Revisar Asiento**
   - Acceder al Libro Mayor (`/contabilidad`)
   - Hacer clic en el botón de aprobación del asiento

2. **Validación Automática**
   - El sistema muestra el diálogo de aprobación
   - Se valida automáticamente si el asiento requiere evidencias
   - Si faltan evidencias, el botón "Aprobar" estará **deshabilitado**

3. **Aprobar o Rechazar**
   - **Aprobar**: Solo si cumple con todos los requisitos
   - **Rechazar**: Proporcionar razón del rechazo

## Componentes del Sistema

### API Endpoints

#### `POST /api/accounting-entries/[id]/evidencias`
Sube un archivo de evidencia para un asiento contable.

**Permisos**: Admin, ContadorGeneral, AuxiliarContable, ResponsableContabilidad

**Request**: FormData con campo `file`

**Response**:
```json
{
  "message": "Evidencia subida exitosamente",
  "fileUrl": "/uploads/evidencias/AST-2024-001_1234567890.pdf",
  "entry": { ... }
}
```

#### `DELETE /api/accounting-entries/[id]/evidencias`
Elimina un archivo de evidencia.

**Permisos**: Admin, ContadorGeneral, ResponsableContabilidad

**Request**:
```json
{
  "fileUrl": "/uploads/evidencias/AST-2024-001_1234567890.pdf"
}
```

#### `POST /api/accounting-entries/[id]/approve`
Aprueba un asiento contable con validación de evidencias.

**Validaciones**:
- Verifica que el asiento no esté ya aprobado
- Valida evidencias según el monto
- Crea log de auditoría
- Envía notificación al creador

**Response** (si falta evidencia):
```json
{
  "error": "Este asiento requiere al menos 1 documento(s) de evidencia antes de ser aprobado (monto ≥ C$ 5,000.00)",
  "requiresEvidence": true,
  "currentEvidenceCount": 0
}
```

### Componentes UI

#### `<EvidenceUploader />`
Componente principal para gestión de evidencias.

**Props**:
- `entryId`: ID del asiento contable
- `entryNumber`: Número del asiento (para display)
- `entryAmount`: Monto del asiento
- `currentEvidences`: Array de URLs de evidencias actuales
- `onEvidenceUpdate`: Callback cuando cambian las evidencias
- `requiresEvidence`: Boolean indicando si se requiere evidencia
- `isReadOnly`: Boolean para modo solo lectura

**Características**:
- Drag & drop de archivos
- Vista previa de documentos
- Indicador visual de estado (Completo/Requerido)
- Validación en tiempo real
- Eliminación de documentos

#### `<ApprovalDialog />`
Diálogo de aprobación con validación de evidencias.

**Características**:
- Resumen completo del asiento
- Lista de evidencias adjuntas
- Alertas visuales si falta evidencia
- Botón de aprobación deshabilitado si no cumple requisitos
- Opción de rechazo con razón

#### `<EntryDetailDialog />`
Vista detallada de asiento con expediente digital.

**Características**:
- Información completa del asiento
- Integración del `EvidenceUploader`
- Modo solo lectura para asientos aprobados
- Historial de cambios

### Utilidades

#### `lib/evidence-config.ts`

**Configuración**:
```typescript
export const EVIDENCE_CONFIG = {
  THRESHOLD_AMOUNT: 5000,           // Monto mínimo que requiere evidencia
  MAX_FILE_SIZE: 10 * 1024 * 1024,  // 10MB
  ALLOWED_TYPES: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
  MIN_EVIDENCE_COUNT: 1,            // Mínimo de documentos requeridos
}
```

**Funciones**:
- `requiresEvidence(amount: number)`: Determina si un monto requiere evidencia
- `hasSufficientEvidence(amount, evidenceUrls)`: Valida si hay suficientes evidencias
- `canApproveEntry(amount, evidenceUrls, status)`: Valida si un asiento puede ser aprobado
- `validateFile(file)`: Valida un archivo antes de subirlo

## Configuración

### Cambiar el Umbral de Monto

Editar `lib/evidence-config.ts`:

```typescript
export const EVIDENCE_CONFIG = {
  THRESHOLD_AMOUNT: 10000, // Cambiar a C$ 10,000
  // ...
}
```

### Cambiar Tipos de Archivos Permitidos

```typescript
export const EVIDENCE_CONFIG = {
  ALLOWED_TYPES: [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/msword", // Agregar Word
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ],
  // ...
}
```

### Cambiar Tamaño Máximo

```typescript
export const EVIDENCE_CONFIG = {
  MAX_FILE_SIZE: 20 * 1024 * 1024, // Cambiar a 20MB
  // ...
}
```

## Seguridad

### Control de Acceso

**Subir Evidencias**:
- Admin
- Contador General
- Auxiliar Contable
- Responsable de Contabilidad

**Eliminar Evidencias**:
- Admin
- Contador General
- Responsable de Contabilidad

**Aprobar Asientos**:
- Admin
- Contador General
- Responsable de Contabilidad
- Directora DAF
- Coordinador de Gobierno

### Auditoría

Todas las acciones se registran en `AuditLog`:

```typescript
{
  action: "UPLOAD_EVIDENCE" | "DELETE_EVIDENCE" | "APPROVE_ENTRY" | "REJECT_ENTRY",
  entity: "AccountingEntry",
  entityId: string,
  details: {
    filename?: string,
    fileUrl?: string,
    entryNumber: string,
    amount?: number,
    evidenceCount?: number,
    // ...
  }
}
```

## Reportes y Consultas

### Asientos sin Evidencia Requerida

```sql
SELECT * FROM accounting_entries
WHERE monto >= 5000
AND estado = 'PENDIENTE'
AND (evidenciaUrls IS NULL OR array_length(evidenciaUrls, 1) = 0)
AND deletedAt IS NULL;
```

### Evidencias Subidas por Usuario

```sql
SELECT 
  u.nombre,
  COUNT(*) as evidencias_subidas
FROM audit_logs al
JOIN users u ON al.userId = u.id
WHERE al.action = 'UPLOAD_EVIDENCE'
GROUP BY u.nombre
ORDER BY evidencias_subidas DESC;
```

### Asientos Rechazados por Falta de Evidencia

```sql
SELECT 
  ae.numero,
  ae.monto,
  ae.descripcion,
  ao.observacion
FROM accounting_entries ae
JOIN accounting_observations ao ON ae.id = ao.accountingEntryId
WHERE ae.estado = 'RECHAZADO'
AND ao.observacion LIKE '%evidencia%'
ORDER BY ae.createdAt DESC;
```

## Mejores Prácticas

1. **Subir Evidencias Inmediatamente**
   - No esperar a solicitar aprobación
   - Adjuntar documentos al crear el asiento

2. **Nombrar Archivos Descriptivamente**
   - Antes de subir: `Factura_Energia_Enero_2024.pdf`
   - El sistema agregará prefijo automáticamente

3. **Verificar Calidad de Documentos**
   - Asegurar que sean legibles
   - Evitar archivos corruptos o incompletos

4. **Documentar Excepciones**
   - Si no hay factura física, adjuntar nota explicativa
   - Usar campo "Observaciones" para contexto adicional

5. **Revisar Antes de Aprobar**
   - Siempre abrir y verificar los documentos adjuntos
   - Confirmar que corresponden al asiento

## Troubleshooting

### "Error al subir evidencia"
- Verificar tamaño del archivo (< 10MB)
- Confirmar tipo de archivo permitido
- Revisar permisos de escritura en `/public/uploads/evidencias/`

### "No se puede aprobar asiento"
- Verificar que el monto requiera evidencia
- Confirmar que hay al menos 1 documento adjunto
- Revisar que el asiento esté en estado PENDIENTE

### "Archivo no se visualiza"
- Verificar que la URL sea accesible
- Confirmar que el archivo existe en el servidor
- Revisar permisos de lectura

## Roadmap Futuro

- [ ] Soporte para firmas digitales
- [ ] OCR automático para extracción de datos
- [ ] Versionado de documentos
- [ ] Compresión automática de imágenes
- [ ] Integración con almacenamiento en la nube (S3, Azure Blob)
- [ ] Notificaciones por email cuando falten evidencias
- [ ] Dashboard de cumplimiento de evidencias
- [ ] Exportación masiva de expedientes digitales

---

**Versión**: 1.0.0  
**Última Actualización**: Febrero 2026  
**Mantenido por**: Equipo de Desarrollo GRACCNN
