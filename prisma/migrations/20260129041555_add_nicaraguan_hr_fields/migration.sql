/*
  Warnings:

  - You are about to drop the column `providerId` on the `checks` table. All the data in the column will be lost.
  - You are about to drop the `providers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[inss]` on the table `employees` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ruc]` on the table `employees` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('PROVEEDOR', 'CLIENTE', 'INSTITUCION');

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'ARQUEO_CAJA_CHICA';

-- DropForeignKey
ALTER TABLE "checks" DROP CONSTRAINT "checks_providerId_fkey";

-- DropIndex
DROP INDEX "checks_providerId_idx";

-- AlterTable
ALTER TABLE "accounting_entries" ADD COLUMN     "evidenciaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "cash_movements" ADD COLUMN     "evidenciaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "checks" DROP COLUMN "providerId",
ADD COLUMN     "entityId" TEXT;

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "contactoEmergencia" TEXT,
ADD COLUMN     "hijos" INTEGER DEFAULT 0,
ADD COLUMN     "inss" TEXT,
ADD COLUMN     "nivelAcademico" TEXT,
ADD COLUMN     "profesion" TEXT,
ADD COLUMN     "ruc" TEXT,
ADD COLUMN     "telefonoEmergencia" TEXT;

-- AlterTable
ALTER TABLE "petty_cash_movements" ADD COLUMN     "evidenciaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deniedModules" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "sessionVersion" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "providers";

-- CreateTable
CREATE TABLE "entities" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ruc" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "contacto" TEXT,
    "tipo" "EntityType" NOT NULL DEFAULT 'PROVEEDOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "petty_cash_audits" (
    "id" TEXT NOT NULL,
    "pettyCashId" TEXT NOT NULL,
    "expectedBalance" DECIMAL(15,2) NOT NULL,
    "countedBalance" DECIMAL(15,2) NOT NULL,
    "difference" DECIMAL(15,2) NOT NULL,
    "observations" TEXT,
    "auditorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "petty_cash_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "entities_ruc_key" ON "entities"("ruc");

-- CreateIndex
CREATE INDEX "petty_cash_audits_pettyCashId_idx" ON "petty_cash_audits"("pettyCashId");

-- CreateIndex
CREATE INDEX "petty_cash_audits_auditorId_idx" ON "petty_cash_audits"("auditorId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_email_token_key" ON "password_reset_tokens"("email", "token");

-- CreateIndex
CREATE INDEX "accounting_entries_institucion_deletedAt_tipo_idx" ON "accounting_entries"("institucion", "deletedAt", "tipo");

-- CreateIndex
CREATE INDEX "accounting_entries_cuentaContable_tipo_estado_idx" ON "accounting_entries"("cuentaContable", "tipo", "estado");

-- CreateIndex
CREATE INDEX "accounting_entries_estado_deletedAt_idx" ON "accounting_entries"("estado", "deletedAt");

-- CreateIndex
CREATE INDEX "checks_entityId_idx" ON "checks"("entityId");

-- CreateIndex
CREATE UNIQUE INDEX "employees_inss_key" ON "employees"("inss");

-- CreateIndex
CREATE UNIQUE INDEX "employees_ruc_key" ON "employees"("ruc");

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "petty_cash_audits" ADD CONSTRAINT "petty_cash_audits_pettyCashId_fkey" FOREIGN KEY ("pettyCashId") REFERENCES "petty_cashes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "petty_cash_audits" ADD CONSTRAINT "petty_cash_audits_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
