-- CreateEnum safely for environments that may already have partial local schema changes
DO $$ BEGIN
  CREATE TYPE "ProviderStaffStatus" AS ENUM ('ACTIVE', 'ON_DUTY', 'INACTIVE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ProviderFleetStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'MAINTENANCE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Service offering official transport metadata
ALTER TABLE "wif_service_offering" ADD COLUMN IF NOT EXISTS "baseCurrency" "CurrencyCode" NOT NULL DEFAULT 'IDR';
ALTER TABLE "wif_service_offering" ADD COLUMN IF NOT EXISTS "originalPrice" DECIMAL(14,2);
ALTER TABLE "wif_service_offering" ADD COLUMN IF NOT EXISTS "vehicleType" VARCHAR(60);

-- Provider-owned staff list. This is intentionally separate from official Wif-Me service offerings.
CREATE TABLE IF NOT EXISTS "wif_provider_staff" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "providerId" UUID NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "roleTitle" VARCHAR(120) NOT NULL,
  "phone" VARCHAR(32),
  "languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "status" "ProviderStaffStatus" NOT NULL DEFAULT 'ACTIVE',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "wif_provider_staff_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "wif_provider_fleet" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "providerId" UUID NOT NULL,
  "vehicleName" VARCHAR(160) NOT NULL,
  "vehicleType" VARCHAR(80) NOT NULL,
  "plateNumber" VARCHAR(40),
  "capacity" INTEGER NOT NULL,
  "baseCity" VARCHAR(120),
  "status" "ProviderFleetStatus" NOT NULL DEFAULT 'AVAILABLE',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "wif_provider_fleet_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "wif_provider_staff_providerId_status_idx" ON "wif_provider_staff"("providerId", "status");
CREATE INDEX IF NOT EXISTS "wif_provider_staff_providerId_createdAt_idx" ON "wif_provider_staff"("providerId", "createdAt");
CREATE INDEX IF NOT EXISTS "wif_provider_fleet_providerId_status_idx" ON "wif_provider_fleet"("providerId", "status");
CREATE INDEX IF NOT EXISTS "wif_provider_fleet_providerId_createdAt_idx" ON "wif_provider_fleet"("providerId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "wif_provider_staff" ADD CONSTRAINT "wif_provider_staff_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "wif_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "wif_provider_fleet" ADD CONSTRAINT "wif_provider_fleet_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "wif_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
