ALTER TABLE "wif_service_offering" ADD COLUMN IF NOT EXISTS "bookableResourceRef" VARCHAR(120);
CREATE INDEX IF NOT EXISTS "wif_service_offering_bookableResourceRef_idx" ON "wif_service_offering"("bookableResourceRef");
