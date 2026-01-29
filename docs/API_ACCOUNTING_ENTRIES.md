# Accounting Entries API Documentation

API endpoints for managing accounting entries (income and expense transactions).

## Base URL

```
/api/accounting-entries
```

## Authentication

All endpoints require authentication via NextAuth.js session. Include the session cookie in requests.

## Endpoints

### 1. List Accounting Entries

**GET** `/api/accounting-entries`

Retrieve a paginated list of accounting entries with optional filters.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 10, max: 100) |
| `tipo` | string | No | Filter by type: `INGRESO` or `EGRESO` |
| `institucion` | string | No | Filter by institution: `GOBIERNO` or `CONCEJO` |
| `estado` | string | No | Filter by status: `BORRADOR`, `PENDIENTE`, `APROBADO`, `RECHAZADO`, `ANULADO` |
| `fechaDesde` | date | No | Filter entries from this date (ISO format) |
| `fechaHasta` | date | No | Filter entries until this date (ISO format) |
| `search` | string | No | Search in description, number, or account code |

#### Example Request

```bash
GET /api/accounting-entries?page=1&limit=20&tipo=INGRESO&institucion=GOBIERNO
```

#### Example Response

```json
{
  "data": [
    {
      "id": "clx123...",
      "numero": "AS-GOB-2024-0001",
      "tipo": "INGRESO",
      "fecha": "2024-01-15T00:00:00.000Z",
      "descripcion": "Ingreso por servicios",
      "monto": "5000.00",
      "estado": "APROBADO",
      "institucion": "GOBIERNO",
      "cuentaContable": "4.1.01.001",
      "centroCosto": "CC001",
      "proyecto": null,
      "documentoRef": "FAC-2024-001",
      "observaciones": null,
      "creadoPor": {
        "id": "user123",
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "juan@example.com"
      },
      "aprobadoPor": {
        "id": "user456",
        "nombre": "María",
        "apellido": "González",
        "email": "maria@example.com"
      },
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### 2. Get Single Accounting Entry

**GET** `/api/accounting-entries/[id]`

Retrieve a single accounting entry by ID.

#### Example Request

```bash
GET /api/accounting-entries/clx123...
```

#### Example Response

```json
{
  "data": {
    "id": "clx123...",
    "numero": "AS-GOB-2024-0001",
    "tipo": "INGRESO",
    "fecha": "2024-01-15T00:00:00.000Z",
    "descripcion": "Ingreso por servicios",
    "monto": "5000.00",
    "estado": "APROBADO",
    "institucion": "GOBIERNO",
    "cuentaContable": "4.1.01.001",
    "centroCosto": "CC001",
    "proyecto": null,
    "documentoRef": "FAC-2024-001",
    "observaciones": null,
    "creadoPor": {
      "id": "user123",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@example.com",
      "role": "AuxiliarContable"
    },
    "aprobadoPor": {
      "id": "user456",
      "nombre": "María",
      "apellido": "González",
      "email": "maria@example.com",
      "role": "ContadorGeneral"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### 3. Create Accounting Entry

**POST** `/api/accounting-entries`

Create a new accounting entry.

#### Request Body

```json
{
  "tipo": "INGRESO",
  "fecha": "2024-01-15",
  "descripcion": "Ingreso por servicios prestados",
  "monto": 5000.00,
  "institucion": "GOBIERNO",
  "cuentaContable": "4.1.01.001",
  "centroCosto": "CC001",
  "proyecto": "PROJ-2024-001",
  "documentoRef": "FAC-2024-001",
  "observaciones": "Pago recibido en efectivo"
}
```

#### Required Fields

- `tipo`: `INGRESO` or `EGRESO`
- `fecha`: Date in ISO format
- `descripcion`: String (3-1000 characters)
- `monto`: Positive number (max: 999999999999.99)
- `institucion`: `GOBIERNO` or `CONCEJO`
- `cuentaContable`: String (max 50 characters)

#### Optional Fields

- `centroCosto`: String (max 50 characters)
- `proyecto`: String (max 50 characters)
- `documentoRef`: String (max 100 characters)
- `observaciones`: String (max 2000 characters)

#### Example Response

```json
{
  "data": {
    "id": "clx123...",
    "numero": "AS-GOB-2024-0001",
    "tipo": "INGRESO",
    "fecha": "2024-01-15T00:00:00.000Z",
    "descripcion": "Ingreso por servicios prestados",
    "monto": "5000.00",
    "estado": "BORRADOR",
    "institucion": "GOBIERNO",
    "cuentaContable": "4.1.01.001",
    "centroCosto": "CC001",
    "proyecto": "PROJ-2024-001",
    "documentoRef": "FAC-2024-001",
    "observaciones": "Pago recibido en efectivo",
    "creadoPor": {
      "id": "user123",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@example.com"
    },
    "aprobadoPor": null,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "message": "Asiento contable creado exitosamente"
}
```

### 4. Update Accounting Entry

**PUT** `/api/accounting-entries/[id]`

Update an existing accounting entry. Only entries in `BORRADOR` or `PENDIENTE` status can be updated.

#### Request Body

All fields are optional. Only include fields you want to update.

```json
{
  "descripcion": "Ingreso por servicios actualizado",
  "monto": 5500.00,
  "observaciones": "Monto corregido"
}
```

#### Example Response

```json
{
  "data": {
    "id": "clx123...",
    "numero": "AS-GOB-2024-0001",
    "tipo": "INGRESO",
    "fecha": "2024-01-15T00:00:00.000Z",
    "descripcion": "Ingreso por servicios actualizado",
    "monto": "5500.00",
    "estado": "BORRADOR",
    "institucion": "GOBIERNO",
    "cuentaContable": "4.1.01.001",
    "centroCosto": "CC001",
    "proyecto": "PROJ-2024-001",
    "documentoRef": "FAC-2024-001",
    "observaciones": "Monto corregido",
    "creadoPor": {
      "id": "user123",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@example.com"
    },
    "aprobadoPor": null,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  },
  "message": "Asiento contable actualizado exitosamente"
}
```

#### Error Responses

- `400`: Entry is approved or deleted (cannot be updated)
- `404`: Entry not found

### 5. Delete Accounting Entry

**DELETE** `/api/accounting-entries/[id]`

Soft delete an accounting entry. Only entries in `BORRADOR` or `PENDIENTE` status can be deleted.

#### Example Response

```json
{
  "message": "Asiento contable eliminado exitosamente"
}
```

#### Error Responses

- `400`: Entry is approved (cannot be deleted, use annul instead)
- `404`: Entry not found

### 6. Approve Accounting Entry

**POST** `/api/accounting-entries/[id]/approve`

Approve an accounting entry. Requires `Admin` or `ContadorGeneral` role.

#### Example Response

```json
{
  "data": {
    "id": "clx123...",
    "numero": "AS-GOB-2024-0001",
    "tipo": "INGRESO",
    "fecha": "2024-01-15T00:00:00.000Z",
    "descripcion": "Ingreso por servicios",
    "monto": "5000.00",
    "estado": "APROBADO",
    "institucion": "GOBIERNO",
    "cuentaContable": "4.1.01.001",
    "creadoPor": {
      "id": "user123",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@example.com"
    },
    "aprobadoPor": {
      "id": "user456",
      "nombre": "María",
      "apellido": "González",
      "email": "maria@example.com"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  "message": "Asiento contable aprobado exitosamente"
}
```

#### Error Responses

- `403`: User doesn't have permission to approve
- `400`: Entry is already approved or deleted

## Validation Rules

### Amount (monto)
- Must be a positive number
- Maximum value: 999,999,999,999.99
- Decimal precision: 2 decimal places

### Description (descripcion)
- Minimum length: 3 characters
- Maximum length: 1000 characters
- Required field

### Date (fecha)
- Must be a valid date
- Can be in the past or present (future dates may be restricted by business rules)

### Account Code (cuentaContable)
- Required field
- Maximum length: 50 characters
- Format: Typically follows accounting chart structure (e.g., "4.1.01.001")

### Institution (institucion)
- Required field
- Must be: `GOBIERNO` or `CONCEJO`

## Transactional Safety

All write operations (CREATE, UPDATE, DELETE, APPROVE) are wrapped in database transactions to ensure:

1. **Atomicity**: All changes succeed or fail together
2. **Consistency**: Data integrity is maintained
3. **Isolation**: Concurrent operations don't interfere
4. **Durability**: Changes are persisted

## Audit Trail

All operations are automatically logged in the `AuditLog` table, including:

- User who performed the action
- Timestamp
- Previous and new data (for updates)
- Action type (CREATE, UPDATE, DELETE, APPROVE)

## Status Workflow

```
BORRADOR → PENDIENTE → APROBADO
                ↓
            RECHAZADO
                ↓
            ANULADO
```

- **BORRADOR**: Draft entry, can be modified or deleted
- **PENDIENTE**: Pending approval, can be modified or deleted
- **APROBADO**: Approved entry, cannot be modified or deleted
- **RECHAZADO**: Rejected entry
- **ANULADO**: Annulled entry

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": [] // Optional: validation errors
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error
