-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('REVIEW', 'APPROVED', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "FinanceRuleKind" AS ENUM ('FEE', 'CHARGE');

-- CreateEnum
CREATE TYPE "FinanceRuleStatus" AS ENUM ('ACTIVE', 'DRAFT');

-- AlterTable
CREATE INDEX "wif_booking_status_createdAt_idx" ON "wif_booking"("status", "createdAt");

-- CreateTable
CREATE TABLE "wif_withdrawal_request" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "providerId" UUID NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'REVIEW',
    "amountIdr" DECIMAL(14,2) NOT NULL,
    "bankName" VARCHAR(120),
    "bankAccountLast4" VARCHAR(8),
    "reviewedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wif_withdrawal_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wif_finance_rule" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" VARCHAR(80) NOT NULL,
    "kind" "FinanceRuleKind" NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" TEXT NOT NULL,
    "value" VARCHAR(80) NOT NULL,
    "status" "FinanceRuleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wif_finance_rule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wif_withdrawal_request_providerId_status_idx" ON "wif_withdrawal_request"("providerId", "status");

-- CreateIndex
CREATE INDEX "wif_withdrawal_request_status_createdAt_idx" ON "wif_withdrawal_request"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "wif_finance_rule_key_key" ON "wif_finance_rule"("key");

-- CreateIndex
CREATE INDEX "wif_finance_rule_kind_status_idx" ON "wif_finance_rule"("kind", "status");

-- AddForeignKey
ALTER TABLE "wif_withdrawal_request" ADD CONSTRAINT "wif_withdrawal_request_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "wif_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
