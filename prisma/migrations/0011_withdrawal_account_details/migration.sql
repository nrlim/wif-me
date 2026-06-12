ALTER TABLE "wif_withdrawal_request" ADD COLUMN IF NOT EXISTS "bankAccountName" VARCHAR(160);
ALTER TABLE "wif_withdrawal_request" ADD COLUMN IF NOT EXISTS "bankAccountEncrypted" TEXT;
ALTER TABLE "wif_withdrawal_request" ADD COLUMN IF NOT EXISTS "bankAccountIv" VARCHAR(64);
ALTER TABLE "wif_withdrawal_request" ADD COLUMN IF NOT EXISTS "bankAccountTag" VARCHAR(64);
ALTER TABLE "wif_withdrawal_request" ADD COLUMN IF NOT EXISTS "requestedNote" TEXT;
ALTER TABLE "wif_withdrawal_request" ADD COLUMN IF NOT EXISTS "reviewNote" TEXT;
