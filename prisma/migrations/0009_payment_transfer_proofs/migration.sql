ALTER TABLE "wif_payment" ADD COLUMN IF NOT EXISTS "proofUrl" VARCHAR(500);
ALTER TABLE "wif_payment" ADD COLUMN IF NOT EXISTS "proofFileName" VARCHAR(180);
ALTER TABLE "wif_payment" ADD COLUMN IF NOT EXISTS "proofMimeType" VARCHAR(120);
ALTER TABLE "wif_payment" ADD COLUMN IF NOT EXISTS "proofUploadedAt" TIMESTAMP(3);
ALTER TABLE "wif_payment" ADD COLUMN IF NOT EXISTS "proofVerifiedAt" TIMESTAMP(3);
ALTER TABLE "wif_payment" ADD COLUMN IF NOT EXISTS "proofRejectedAt" TIMESTAMP(3);
ALTER TABLE "wif_payment" ADD COLUMN IF NOT EXISTS "proofReviewNote" TEXT;

CREATE INDEX IF NOT EXISTS "wif_payment_status_proofUploadedAt_idx" ON "wif_payment"("status", "proofUploadedAt");
