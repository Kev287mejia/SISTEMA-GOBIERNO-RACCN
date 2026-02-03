-- AlterTable
ALTER TABLE "bank_accounts" ADD COLUMN     "evidenceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
