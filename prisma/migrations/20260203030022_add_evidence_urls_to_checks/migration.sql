/*
  Warnings:

  - The values [VALIDADO] on the enum `CheckStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CheckStatus_new" AS ENUM ('PENDIENTE_VALIDACION', 'APROBADO_PRESUPUESTO', 'EMITIDO', 'CONTABILIZADO', 'PAGADO', 'ANULADO', 'CHEQUE_REQUESTED', 'BUDGET_APPROVED', 'BUDGET_REJECTED', 'CHEQUE_ISSUED', 'ACCOUNTING_PRECHECK_APPROVED', 'ACCOUNTING_PRECHECK_REJECTED', 'CHEQUE_PAID', 'ACCOUNTED');
ALTER TABLE "checks" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "checks" ALTER COLUMN "estado" TYPE "CheckStatus_new" USING ("estado"::text::"CheckStatus_new");
ALTER TYPE "CheckStatus" RENAME TO "CheckStatus_old";
ALTER TYPE "CheckStatus_new" RENAME TO "CheckStatus";
DROP TYPE "CheckStatus_old";
ALTER TABLE "checks" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE_VALIDACION';
COMMIT;

-- AlterTable
ALTER TABLE "accounting_entries" ADD COLUMN     "budgetItemId" TEXT,
ADD COLUMN     "renglonGasto" TEXT;

-- AlterTable
ALTER TABLE "budget_executions" ADD COLUMN     "centroCosto" TEXT;

-- AlterTable
ALTER TABLE "checks" ADD COLUMN     "accountedAt" TIMESTAMP(3),
ADD COLUMN     "accountedById" TEXT,
ADD COLUMN     "budgetApprovedAt" TIMESTAMP(3),
ADD COLUMN     "budgetApprovedById" TEXT,
ADD COLUMN     "budgetItemId" TEXT,
ADD COLUMN     "budgetRejectedAt" TIMESTAMP(3),
ADD COLUMN     "budgetRejectedById" TEXT,
ADD COLUMN     "evidenceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "hasCartaSolicitud" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasDocumentosCompletos" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasFirmaSolicitante" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "issuedAt" TIMESTAMP(3),
ADD COLUMN     "issuedById" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paidById" TEXT,
ADD COLUMN     "preCheckApprovedAt" TIMESTAMP(3),
ADD COLUMN     "preCheckApprovedById" TEXT,
ADD COLUMN     "preCheckRejectedAt" TIMESTAMP(3),
ADD COLUMN     "preCheckRejectedById" TEXT,
ADD COLUMN     "renglonGasto" TEXT;

-- CreateTable
CREATE TABLE "accounting_closures" (
    "id" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "fechaCierre" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    "notas" TEXT,
    "estado" "ClosureStatus" NOT NULL DEFAULT 'CERRADO',

    CONSTRAINT "accounting_closures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_reconciliations" (
    "id" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "balanceLibros" DECIMAL(15,2) NOT NULL,
    "balanceExtracto" DECIMAL(15,2) NOT NULL,
    "diferencia" DECIMAL(15,2) NOT NULL,
    "totalMatching" INTEGER NOT NULL,
    "periodoMes" INTEGER NOT NULL,
    "periodoAnio" INTEGER NOT NULL,
    "observaciones" TEXT,
    "detalles" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accounting_closures_mes_anio_idx" ON "accounting_closures"("mes", "anio");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_closures_mes_anio_key" ON "accounting_closures"("mes", "anio");

-- CreateIndex
CREATE INDEX "bank_reconciliations_bankAccountId_idx" ON "bank_reconciliations"("bankAccountId");

-- CreateIndex
CREATE INDEX "bank_reconciliations_userId_idx" ON "bank_reconciliations"("userId");

-- CreateIndex
CREATE INDEX "bank_reconciliations_date_idx" ON "bank_reconciliations"("date");

-- CreateIndex
CREATE INDEX "checks_budgetItemId_idx" ON "checks"("budgetItemId");

-- AddForeignKey
ALTER TABLE "accounting_entries" ADD CONSTRAINT "accounting_entries_budgetItemId_fkey" FOREIGN KEY ("budgetItemId") REFERENCES "budget_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_budgetItemId_fkey" FOREIGN KEY ("budgetItemId") REFERENCES "budget_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_budgetApprovedById_fkey" FOREIGN KEY ("budgetApprovedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_budgetRejectedById_fkey" FOREIGN KEY ("budgetRejectedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_preCheckApprovedById_fkey" FOREIGN KEY ("preCheckApprovedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_preCheckRejectedById_fkey" FOREIGN KEY ("preCheckRejectedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_accountedById_fkey" FOREIGN KEY ("accountedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_closures" ADD CONSTRAINT "accounting_closures_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_reconciliations" ADD CONSTRAINT "bank_reconciliations_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_reconciliations" ADD CONSTRAINT "bank_reconciliations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
