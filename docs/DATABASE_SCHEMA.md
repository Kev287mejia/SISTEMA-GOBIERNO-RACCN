# Database Schema Documentation

## Overview

This document describes the database schema for the Government Accounting System. The schema is designed with data integrity, audit trails, and soft deletes in mind, suitable for government financial systems.

## Core Principles

1. **Soft Deletes**: All main entities support soft deletes via `deletedAt` field
2. **Audit Trail**: All changes are logged via `AuditLog` model
3. **Timestamps**: All entities have `createdAt` and `updatedAt` timestamps
4. **Data Integrity**: Foreign keys, unique constraints, and indexes ensure data consistency
5. **Immutability**: Critical financial records cannot be hard-deleted

## Models

### User

Stores system users with authentication and authorization information.

**Fields:**
- `id`: Unique identifier (CUID)
- `email`: Unique email address
- `password`: Hashed password (bcrypt)
- `nombre`: First name
- `apellido`: Last name (optional)
- `activo`: Active status (default: true)
- `role`: User role (enum: Admin, ContadorGeneral, AuxiliarContable, Presupuesto, Bodega, RRHH, Auditor)
- `deletedAt`: Soft delete timestamp (nullable)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relations:**
- `sessions`: NextAuth sessions
- `accounts`: NextAuth accounts
- `createdEntries`: Accounting entries created by user
- `approvedEntries`: Accounting entries approved by user
- `createdBudgets`: Budget items created by user
- `approvedBudgets`: Budget items approved by user
- `inventoryRecords`: Inventory transactions performed by user
- `hrRecords`: HR records created by user
- `auditLogs`: Audit log entries for user actions

**Indexes:**
- `email` (unique)
- `role`
- `activo`
- `deletedAt`

### AccountingEntry

Represents accounting entries (income/expense transactions).

**Fields:**
- `id`: Unique identifier (CUID)
- `numero`: Sequential entry number (unique, format: AS-YYYY-NNNN)
- `tipo`: Entry type (enum: INGRESO, EGRESO)
- `fecha`: Transaction date
- `descripcion`: Description (text)
- `monto`: Amount (Decimal 15,2)
- `estado`: Status (enum: BORRADOR, PENDIENTE, APROBADO, RECHAZADO, ANULADO)
- `cuentaContable`: Account code (e.g., "1.1.01.001")
- `centroCosto`: Cost center (optional)
- `proyecto`: Project code (optional)
- `documentoRef`: Reference document number (optional)
- `observaciones`: Observations (optional, text)
- `creadoPorId`: Creator user ID (foreign key)
- `aprobadoPorId`: Approver user ID (optional, foreign key)
- `deletedAt`: Soft delete timestamp (nullable)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relations:**
- `creadoPor`: User who created the entry
- `aprobadoPor`: User who approved the entry (nullable)

**Indexes:**
- `numero` (unique)
- `tipo`
- `fecha`
- `estado`
- `cuentaContable`
- `creadoPorId`
- `deletedAt`

**Business Rules:**
- Entry numbers are auto-generated sequentially
- Only approved entries can be used in financial reports
- Entries cannot be hard-deleted, only soft-deleted or annulled

### BudgetItem

Represents budget allocations and tracking.

**Fields:**
- `id`: Unique identifier (CUID)
- `codigo`: Budget item code (unique)
- `nombre`: Budget item name
- `descripcion`: Description (optional, text)
- `categoria`: Budget category
- `año`: Fiscal year
- `montoAsignado`: Allocated amount (Decimal 15,2)
- `montoEjecutado`: Executed amount (Decimal 15,2, default: 0)
- `montoDisponible`: Available amount (Decimal 15,2, calculated)
- `estado`: Budget status (enum: PLANIFICADO, APROBADO, EN_EJECUCION, CERRADO)
- `fechaInicio`: Start date (optional)
- `fechaFin`: End date (optional)
- `creadoPorId`: Creator user ID (foreign key)
- `aprobadoPorId`: Approver user ID (optional, foreign key)
- `deletedAt`: Soft delete timestamp (nullable)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relations:**
- `creadoPor`: User who created the budget item
- `aprobadoPor`: User who approved the budget item (nullable)

**Indexes:**
- `codigo` (unique)
- `categoria`
- `año`
- `estado`
- `creadoPorId`
- `deletedAt`

**Business Rules:**
- `montoDisponible` = `montoAsignado` - `montoEjecutado`
- Budget cannot be executed beyond allocated amount
- Budget status follows lifecycle: PLANIFICADO → APROBADO → EN_EJECUCION → CERRADO

### InventoryItem

Represents inventory items with Kardex tracking.

**Fields:**
- `id`: Unique identifier (CUID)
- `codigo`: Item code/SKU (unique)
- `nombre`: Item name
- `descripcion`: Description (optional, text)
- `unidadMedida`: Unit of measure (e.g., "UN", "KG", "L")
- `categoria`: Item category
- `stockMinimo`: Minimum stock level (Decimal 10,2, default: 0)
- `stockMaximo`: Maximum stock level (optional, Decimal 10,2)
- `stockActual`: Current stock (Decimal 10,2, default: 0)
- `costoUnitario`: Unit cost (Decimal 15,2, default: 0)
- `metodoKardex`: Kardex method (default: "FIFO", options: FIFO, LIFO, Promedio)
- `activo`: Active status (default: true)
- `deletedAt`: Soft delete timestamp (nullable)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relations:**
- `transacciones`: Inventory transactions for this item

**Indexes:**
- `codigo` (unique)
- `categoria`
- `activo`
- `deletedAt`

**Business Rules:**
- Stock cannot go below zero (enforced in application logic)
- Cost is calculated using weighted average method
- Kardex method determines how costs are calculated on transactions

### InventoryTransaction

Represents inventory movements (Kardex entries).

**Fields:**
- `id`: Unique identifier (CUID)
- `tipo`: Transaction type (enum: ENTRADA, SALIDA, AJUSTE, DEVOLUCION)
- `cantidad`: Quantity (Decimal 10,2)
- `costoUnitario`: Unit cost (Decimal 15,2)
- `costoTotal`: Total cost (Decimal 15,2, calculated)
- `fecha`: Transaction date (default: now)
- `numeroDocumento`: Document reference number (optional)
- `observaciones`: Observations (optional, text)
- `itemId`: Inventory item ID (foreign key)
- `usuarioId`: User who performed the transaction (foreign key)
- `deletedAt`: Soft delete timestamp (nullable)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relations:**
- `item`: Inventory item
- `usuario`: User who performed the transaction

**Indexes:**
- `itemId`
- `tipo`
- `fecha`
- `usuarioId`
- `deletedAt`

**Business Rules:**
- Transactions automatically update item stock
- ENTRADA increases stock, SALIDA decreases stock
- Stock cannot go negative (enforced in application logic)
- Cost is recalculated using weighted average on ENTRADA

### HRRecord

Represents human resources records.

**Fields:**
- `id`: Unique identifier (CUID)
- `tipo`: Record type (enum: CONTRATACION, ASCENSO, TRASLADO, DESPIDO, RENUNCIA, VACACIONES, LICENCIA, EVALUACION)
- `fecha`: Record date
- `descripcion`: Description (text)
- `empleadoNombre`: Employee name
- `empleadoCedula`: Employee ID number
- `cargo`: Position/job title (optional)
- `departamento`: Department (optional)
- `salario`: Salary (optional, Decimal 15,2)
- `fechaInicio`: Start date (optional)
- `fechaFin`: End date (optional)
- `estado`: Status (default: "ACTIVO", options: ACTIVO, INACTIVO, PENDIENTE)
- `documentos`: Document references (optional, JSON text)
- `observaciones`: Observations (optional, text)
- `creadoPorId`: Creator user ID (foreign key)
- `deletedAt`: Soft delete timestamp (nullable)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relations:**
- `creadoPor`: User who created the record

**Indexes:**
- `tipo`
- `fecha`
- `empleadoCedula`
- `estado`
- `creadoPorId`
- `deletedAt`

### AuditLog

Comprehensive audit trail for all system actions.

**Fields:**
- `id`: Unique identifier (CUID)
- `accion`: Action type (enum: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT, APPROVE, REJECT)
- `entidad`: Entity name (e.g., "AccountingEntry", "BudgetItem")
- `entidadId`: Entity ID
- `descripcion`: Description (text)
- `datosAnteriores`: Previous data (optional, JSON)
- `datosNuevos`: New data (optional, JSON)
- `ipAddress`: IP address (optional)
- `userAgent`: User agent string (optional, text)
- `fecha`: Action timestamp (default: now)
- `usuarioId`: User who performed the action (foreign key)

**Relations:**
- `usuario`: User who performed the action

**Indexes:**
- `accion`
- `entidad`
- `entidadId`
- `usuarioId`
- `fecha`

**Business Rules:**
- All critical operations must create audit log entries
- Audit logs are immutable (never deleted or modified)
- JSON fields store complete state changes for audit purposes

## Enums

### Role
- `Admin`: Full system access
- `ContadorGeneral`: General accountant
- `AuxiliarContable`: Accounting assistant
- `Presupuesto`: Budget manager
- `Bodega`: Warehouse/inventory manager
- `RRHH`: Human resources
- `Auditor`: Auditor (read-only access to most modules)

### EntryType
- `INGRESO`: Income entry
- `EGRESO`: Expense entry

### EntryStatus
- `BORRADOR`: Draft
- `PENDIENTE`: Pending approval
- `APROBADO`: Approved
- `RECHAZADO`: Rejected
- `ANULADO`: Annulled

### BudgetStatus
- `PLANIFICADO`: Planned
- `APROBADO`: Approved
- `EN_EJECUCION`: In execution
- `CERRADO`: Closed

### InventoryTransactionType
- `ENTRADA`: Stock entry
- `SALIDA`: Stock exit
- `AJUSTE`: Stock adjustment
- `DEVOLUCION`: Return

### HRRecordType
- `CONTRATACION`: Hiring
- `ASCENSO`: Promotion
- `TRASLADO`: Transfer
- `DESPIDO`: Dismissal
- `RENUNCIA`: Resignation
- `VACACIONES`: Vacation
- `LICENCIA`: Leave
- `EVALUACION`: Evaluation

### AuditAction
- `CREATE`: Record creation
- `UPDATE`: Record update
- `DELETE`: Record deletion (soft delete)
- `LOGIN`: User login
- `LOGOUT`: User logout
- `EXPORT`: Data export
- `APPROVE`: Approval action
- `REJECT`: Rejection action

## Data Integrity Features

1. **Foreign Key Constraints**: All relationships are enforced at database level
2. **Unique Constraints**: Critical fields (email, entry numbers, codes) are unique
3. **Indexes**: Optimized queries on frequently searched fields
4. **Decimal Precision**: Financial amounts use Decimal(15,2) for precision
5. **Soft Deletes**: Data is never permanently lost, only marked as deleted
6. **Audit Trail**: Complete history of all changes
7. **Status Workflows**: Enums enforce valid state transitions

## Best Practices

1. Always use soft deletes for main entities
2. Create audit log entries for all critical operations
3. Validate data before database operations
4. Use transactions for multi-step operations
5. Never hard-delete financial records
6. Maintain referential integrity through foreign keys
7. Use indexes for frequently queried fields
