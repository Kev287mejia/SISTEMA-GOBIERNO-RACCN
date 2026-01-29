-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'ContadorGeneral', 'AuxiliarContable', 'Presupuesto', 'Bodega', 'RRHH', 'Auditor', 'CoordinadorGobierno', 'DirectoraDAF', 'DirectoraRRHH', 'ResponsableCaja', 'ResponsableCredito', 'ResponsablePresupuesto');

-- CreateEnum
CREATE TYPE "RegionalCenter" AS ENUM ('BILWI', 'WASPAM', 'PRINZAPOLKA', 'ROSITA', 'BONANZA', 'SIUNA', 'MULUKUKU', 'PAIWAS', 'MANAGUA');

-- CreateEnum
CREATE TYPE "BudgetType" AS ENUM ('FUNCIONAMIENTO', 'INVERSION');

-- CreateEnum
CREATE TYPE "PettyCashStatus" AS ENUM ('ACTIVA', 'CERRADA', 'EN_AUDITORIA');

-- CreateEnum
CREATE TYPE "PettyCashMovementType" AS ENUM ('INGRESO', 'EGRESO', 'AJUSTE');

-- CreateEnum
CREATE TYPE "MovementStatus" AS ENUM ('PENDIENTE_VALIDACION', 'VALIDADO', 'RECHAZADO', 'ANULADO');

-- CreateEnum
CREATE TYPE "CashMovementType" AS ENUM ('INGRESO', 'EGRESO');

-- CreateEnum
CREATE TYPE "CheckType" AS ENUM ('RECIBIDO', 'EMITIDO');

-- CreateEnum
CREATE TYPE "CheckStatus" AS ENUM ('PENDIENTE_VALIDACION', 'VALIDADO', 'ANULADO');

-- CreateEnum
CREATE TYPE "ClosureStatus" AS ENUM ('ABIERTO', 'CERRADO');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('INGRESO', 'EGRESO');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('BORRADOR', 'PENDIENTE', 'APROBADO', 'RECHAZADO', 'ANULADO');

-- CreateEnum
CREATE TYPE "BudgetStatus" AS ENUM ('PLANIFICADO', 'APROBADO', 'EN_EJECUCION', 'CERRADO');

-- CreateEnum
CREATE TYPE "InventoryTransactionType" AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE', 'DEVOLUCION');

-- CreateEnum
CREATE TYPE "HRRecordType" AS ENUM ('CONTRATACION', 'ASCENSO', 'TRASLADO', 'DESPIDO', 'RENUNCIA', 'VACACIONES', 'LICENCIA', 'EVALUACION');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'APPROVE', 'REJECT');

-- CreateEnum
CREATE TYPE "Institution" AS ENUM ('GOBIERNO', 'CONCEJO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "role" "Role" NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "accounting_entries" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "EntryType" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DECIMAL(15,2) NOT NULL,
    "estado" "EntryStatus" NOT NULL DEFAULT 'BORRADOR',
    "institucion" "Institution" NOT NULL,
    "cuentaContable" TEXT NOT NULL,
    "centroCosto" TEXT,
    "proyecto" TEXT,
    "documentoRef" TEXT,
    "observaciones" TEXT,
    "creadoPorId" TEXT NOT NULL,
    "aprobadoPorId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounting_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_items" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "montoAsignado" DECIMAL(15,2) NOT NULL,
    "montoEjecutado" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "montoDisponible" DECIMAL(15,2) NOT NULL,
    "estado" "BudgetStatus" NOT NULL DEFAULT 'PLANIFICADO',
    "tipoGasto" "BudgetType" NOT NULL DEFAULT 'FUNCIONAMIENTO',
    "centroRegional" "RegionalCenter" NOT NULL DEFAULT 'BILWI',
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "creadoPorId" TEXT NOT NULL,
    "aprobadoPorId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_executions" (
    "id" TEXT NOT NULL,
    "budgetItemId" TEXT NOT NULL,
    "monto" DECIMAL(15,2) NOT NULL,
    "mes" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT NOT NULL,
    "referencia" TEXT,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "unidadMedida" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "stockMinimo" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stockMaximo" DECIMAL(10,2),
    "stockActual" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "costoUnitario" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "metodoKardex" TEXT NOT NULL DEFAULT 'FIFO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creadoPorId" TEXT,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" TEXT NOT NULL,
    "tipo" "InventoryTransactionType" NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "costoUnitario" DECIMAL(15,2) NOT NULL,
    "costoTotal" DECIMAL(15,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numeroDocumento" TEXT,
    "comprobanteUrl" TEXT,
    "observaciones" TEXT,
    "itemId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "accountingEntryId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "codigo" TEXT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "genero" TEXT,
    "estadoCivil" TEXT,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "tipoSangre" TEXT,
    "banco" TEXT,
    "tipoCuenta" TEXT,
    "numeroCuenta" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "departamento" TEXT NOT NULL,
    "salarioMin" DECIMAL(15,2),
    "salarioMax" DECIMAL(15,2),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "salarioBase" DECIMAL(15,2) NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "documentoUrl" TEXT,
    "observaciones" TEXT,
    "empleadoId" TEXT NOT NULL,
    "cargoId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_records" (
    "id" TEXT NOT NULL,
    "tipo" "HRRecordType" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "empleadoId" TEXT,
    "empleadoNombre" TEXT,
    "empleadoCedula" TEXT,
    "cargo" TEXT,
    "departamento" TEXT,
    "salario" DECIMAL(15,2),
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "documentos" TEXT,
    "observaciones" TEXT,
    "creadoPorId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "accion" "AuditAction" NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "datosAnteriores" JSONB,
    "datosNuevos" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_observations" (
    "id" TEXT NOT NULL,
    "asientoContableId" TEXT NOT NULL,
    "observacion" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'COMENTARIO',
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "creadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounting_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "totalMonto" DECIMAL(15,2) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "fechaPago" TIMESTAMP(3),
    "creadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_items" (
    "id" TEXT NOT NULL,
    "nominaId" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "salarioBase" DECIMAL(15,2) NOT NULL,
    "bonificaciones" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "deducciones" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalNeto" DECIMAL(15,2) NOT NULL,
    "detalles" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "petty_cashes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "montoInicial" DECIMAL(15,2) NOT NULL,
    "montoActual" DECIMAL(15,2) NOT NULL,
    "estado" "PettyCashStatus" NOT NULL DEFAULT 'ACTIVA',
    "usuarioId" TEXT NOT NULL,
    "institution" "Institution" NOT NULL DEFAULT 'GOBIERNO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "petty_cashes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "petty_cash_movements" (
    "id" TEXT NOT NULL,
    "pettyCashId" TEXT NOT NULL,
    "tipo" "PettyCashMovementType" NOT NULL,
    "monto" DECIMAL(15,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT NOT NULL,
    "referencia" TEXT,
    "estado" "MovementStatus" NOT NULL DEFAULT 'PENDIENTE_VALIDACION',
    "usuarioId" TEXT NOT NULL,
    "accountingEntryId" TEXT,
    "inconsistente" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "petty_cash_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ruc" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_movements" (
    "id" TEXT NOT NULL,
    "tipo" "CashMovementType" NOT NULL,
    "monto" DECIMAL(15,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT NOT NULL,
    "referencia" TEXT,
    "institucion" "Institution" NOT NULL DEFAULT 'GOBIERNO',
    "usuarioId" TEXT NOT NULL,
    "closureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checks" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "CheckType" NOT NULL,
    "banco" TEXT NOT NULL,
    "cuentaBancaria" TEXT NOT NULL,
    "beneficiario" TEXT,
    "monto" DECIMAL(15,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "referencia" TEXT,
    "estado" "CheckStatus" NOT NULL DEFAULT 'PENDIENTE_VALIDACION',
    "usuarioId" TEXT NOT NULL,
    "providerId" TEXT,
    "accountingEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_closures" (
    "id" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "montoInicial" DECIMAL(15,2) NOT NULL,
    "totalIngresos" DECIMAL(15,2) NOT NULL,
    "totalEgresos" DECIMAL(15,2) NOT NULL,
    "montoFinal" DECIMAL(15,2) NOT NULL,
    "estado" "ClosureStatus" NOT NULL DEFAULT 'ABIERTO',
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_closures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_activo_idx" ON "users"("activo");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_entries_numero_key" ON "accounting_entries"("numero");

-- CreateIndex
CREATE INDEX "accounting_entries_numero_idx" ON "accounting_entries"("numero");

-- CreateIndex
CREATE INDEX "accounting_entries_tipo_idx" ON "accounting_entries"("tipo");

-- CreateIndex
CREATE INDEX "accounting_entries_fecha_idx" ON "accounting_entries"("fecha");

-- CreateIndex
CREATE INDEX "accounting_entries_estado_idx" ON "accounting_entries"("estado");

-- CreateIndex
CREATE INDEX "accounting_entries_institucion_idx" ON "accounting_entries"("institucion");

-- CreateIndex
CREATE INDEX "accounting_entries_cuentaContable_idx" ON "accounting_entries"("cuentaContable");

-- CreateIndex
CREATE INDEX "accounting_entries_creadoPorId_idx" ON "accounting_entries"("creadoPorId");

-- CreateIndex
CREATE INDEX "accounting_entries_deletedAt_idx" ON "accounting_entries"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "budget_items_codigo_key" ON "budget_items"("codigo");

-- CreateIndex
CREATE INDEX "budget_items_codigo_idx" ON "budget_items"("codigo");

-- CreateIndex
CREATE INDEX "budget_items_categoria_idx" ON "budget_items"("categoria");

-- CreateIndex
CREATE INDEX "budget_items_anio_idx" ON "budget_items"("anio");

-- CreateIndex
CREATE INDEX "budget_items_estado_idx" ON "budget_items"("estado");

-- CreateIndex
CREATE INDEX "budget_items_tipoGasto_idx" ON "budget_items"("tipoGasto");

-- CreateIndex
CREATE INDEX "budget_items_centroRegional_idx" ON "budget_items"("centroRegional");

-- CreateIndex
CREATE INDEX "budget_items_creadoPorId_idx" ON "budget_items"("creadoPorId");

-- CreateIndex
CREATE INDEX "budget_items_deletedAt_idx" ON "budget_items"("deletedAt");

-- CreateIndex
CREATE INDEX "budget_executions_budgetItemId_idx" ON "budget_executions"("budgetItemId");

-- CreateIndex
CREATE INDEX "budget_executions_mes_idx" ON "budget_executions"("mes");

-- CreateIndex
CREATE INDEX "budget_executions_usuarioId_idx" ON "budget_executions"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_codigo_key" ON "inventory_items"("codigo");

-- CreateIndex
CREATE INDEX "inventory_items_codigo_idx" ON "inventory_items"("codigo");

-- CreateIndex
CREATE INDEX "inventory_items_categoria_idx" ON "inventory_items"("categoria");

-- CreateIndex
CREATE INDEX "inventory_items_activo_idx" ON "inventory_items"("activo");

-- CreateIndex
CREATE INDEX "inventory_items_creadoPorId_idx" ON "inventory_items"("creadoPorId");

-- CreateIndex
CREATE INDEX "inventory_items_deletedAt_idx" ON "inventory_items"("deletedAt");

-- CreateIndex
CREATE INDEX "inventory_transactions_itemId_idx" ON "inventory_transactions"("itemId");

-- CreateIndex
CREATE INDEX "inventory_transactions_tipo_idx" ON "inventory_transactions"("tipo");

-- CreateIndex
CREATE INDEX "inventory_transactions_fecha_idx" ON "inventory_transactions"("fecha");

-- CreateIndex
CREATE INDEX "inventory_transactions_usuarioId_idx" ON "inventory_transactions"("usuarioId");

-- CreateIndex
CREATE INDEX "inventory_transactions_accountingEntryId_idx" ON "inventory_transactions"("accountingEntryId");

-- CreateIndex
CREATE INDEX "inventory_transactions_deletedAt_idx" ON "inventory_transactions"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "employees_codigo_key" ON "employees"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "employees_cedula_key" ON "employees"("cedula");

-- CreateIndex
CREATE INDEX "employees_cedula_idx" ON "employees"("cedula");

-- CreateIndex
CREATE INDEX "employees_estado_idx" ON "employees"("estado");

-- CreateIndex
CREATE INDEX "employees_deletedAt_idx" ON "employees"("deletedAt");

-- CreateIndex
CREATE INDEX "contracts_empleadoId_idx" ON "contracts"("empleadoId");

-- CreateIndex
CREATE INDEX "contracts_estado_idx" ON "contracts"("estado");

-- CreateIndex
CREATE INDEX "hr_records_tipo_idx" ON "hr_records"("tipo");

-- CreateIndex
CREATE INDEX "hr_records_fecha_idx" ON "hr_records"("fecha");

-- CreateIndex
CREATE INDEX "hr_records_empleadoId_idx" ON "hr_records"("empleadoId");

-- CreateIndex
CREATE INDEX "hr_records_empleadoCedula_idx" ON "hr_records"("empleadoCedula");

-- CreateIndex
CREATE INDEX "hr_records_estado_idx" ON "hr_records"("estado");

-- CreateIndex
CREATE INDEX "hr_records_creadoPorId_idx" ON "hr_records"("creadoPorId");

-- CreateIndex
CREATE INDEX "hr_records_deletedAt_idx" ON "hr_records"("deletedAt");

-- CreateIndex
CREATE INDEX "audit_logs_accion_idx" ON "audit_logs"("accion");

-- CreateIndex
CREATE INDEX "audit_logs_entidad_idx" ON "audit_logs"("entidad");

-- CreateIndex
CREATE INDEX "audit_logs_entidadId_idx" ON "audit_logs"("entidadId");

-- CreateIndex
CREATE INDEX "audit_logs_usuarioId_idx" ON "audit_logs"("usuarioId");

-- CreateIndex
CREATE INDEX "audit_logs_fecha_idx" ON "audit_logs"("fecha");

-- CreateIndex
CREATE INDEX "accounting_observations_asientoContableId_idx" ON "accounting_observations"("asientoContableId");

-- CreateIndex
CREATE INDEX "accounting_observations_creadoPorId_idx" ON "accounting_observations"("creadoPorId");

-- CreateIndex
CREATE INDEX "accounting_observations_tipo_idx" ON "accounting_observations"("tipo");

-- CreateIndex
CREATE INDEX "accounting_observations_estado_idx" ON "accounting_observations"("estado");

-- CreateIndex
CREATE INDEX "accounting_observations_createdAt_idx" ON "accounting_observations"("createdAt");

-- CreateIndex
CREATE INDEX "payrolls_mes_anio_idx" ON "payrolls"("mes", "anio");

-- CreateIndex
CREATE INDEX "payrolls_estado_idx" ON "payrolls"("estado");

-- CreateIndex
CREATE INDEX "payroll_items_nominaId_idx" ON "payroll_items"("nominaId");

-- CreateIndex
CREATE INDEX "payroll_items_empleadoId_idx" ON "payroll_items"("empleadoId");

-- CreateIndex
CREATE UNIQUE INDEX "petty_cashes_nombre_key" ON "petty_cashes"("nombre");

-- CreateIndex
CREATE INDEX "petty_cashes_usuarioId_idx" ON "petty_cashes"("usuarioId");

-- CreateIndex
CREATE INDEX "petty_cashes_estado_idx" ON "petty_cashes"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "petty_cash_movements_accountingEntryId_key" ON "petty_cash_movements"("accountingEntryId");

-- CreateIndex
CREATE INDEX "petty_cash_movements_pettyCashId_idx" ON "petty_cash_movements"("pettyCashId");

-- CreateIndex
CREATE INDEX "petty_cash_movements_usuarioId_idx" ON "petty_cash_movements"("usuarioId");

-- CreateIndex
CREATE INDEX "petty_cash_movements_tipo_idx" ON "petty_cash_movements"("tipo");

-- CreateIndex
CREATE INDEX "petty_cash_movements_estado_idx" ON "petty_cash_movements"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "providers_ruc_key" ON "providers"("ruc");

-- CreateIndex
CREATE INDEX "cash_movements_usuarioId_idx" ON "cash_movements"("usuarioId");

-- CreateIndex
CREATE INDEX "cash_movements_closureId_idx" ON "cash_movements"("closureId");

-- CreateIndex
CREATE INDEX "cash_movements_tipo_idx" ON "cash_movements"("tipo");

-- CreateIndex
CREATE INDEX "cash_movements_fecha_idx" ON "cash_movements"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "checks_numero_key" ON "checks"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "checks_accountingEntryId_key" ON "checks"("accountingEntryId");

-- CreateIndex
CREATE INDEX "checks_usuarioId_idx" ON "checks"("usuarioId");

-- CreateIndex
CREATE INDEX "checks_providerId_idx" ON "checks"("providerId");

-- CreateIndex
CREATE INDEX "checks_numero_idx" ON "checks"("numero");

-- CreateIndex
CREATE INDEX "checks_tipo_idx" ON "checks"("tipo");

-- CreateIndex
CREATE INDEX "checks_estado_idx" ON "checks"("estado");

-- CreateIndex
CREATE INDEX "cash_closures_usuarioId_idx" ON "cash_closures"("usuarioId");

-- CreateIndex
CREATE INDEX "cash_closures_estado_idx" ON "cash_closures"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "system_settings_group_idx" ON "system_settings"("group");

-- CreateIndex
CREATE INDEX "system_settings_key_idx" ON "system_settings"("key");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_entries" ADD CONSTRAINT "accounting_entries_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_entries" ADD CONSTRAINT "accounting_entries_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_executions" ADD CONSTRAINT "budget_executions_budgetItemId_fkey" FOREIGN KEY ("budgetItemId") REFERENCES "budget_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_executions" ADD CONSTRAINT "budget_executions_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_accountingEntryId_fkey" FOREIGN KEY ("accountingEntryId") REFERENCES "accounting_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_records" ADD CONSTRAINT "hr_records_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_records" ADD CONSTRAINT "hr_records_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_observations" ADD CONSTRAINT "accounting_observations_asientoContableId_fkey" FOREIGN KEY ("asientoContableId") REFERENCES "accounting_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_observations" ADD CONSTRAINT "accounting_observations_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_items" ADD CONSTRAINT "payroll_items_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_items" ADD CONSTRAINT "payroll_items_nominaId_fkey" FOREIGN KEY ("nominaId") REFERENCES "payrolls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "petty_cashes" ADD CONSTRAINT "petty_cashes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "petty_cash_movements" ADD CONSTRAINT "petty_cash_movements_pettyCashId_fkey" FOREIGN KEY ("pettyCashId") REFERENCES "petty_cashes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "petty_cash_movements" ADD CONSTRAINT "petty_cash_movements_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "petty_cash_movements" ADD CONSTRAINT "petty_cash_movements_accountingEntryId_fkey" FOREIGN KEY ("accountingEntryId") REFERENCES "accounting_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_closureId_fkey" FOREIGN KEY ("closureId") REFERENCES "cash_closures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_accountingEntryId_fkey" FOREIGN KEY ("accountingEntryId") REFERENCES "accounting_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_closures" ADD CONSTRAINT "cash_closures_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
