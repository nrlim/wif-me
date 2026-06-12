-- Master Location + multi-booking Order checkout migration.
-- This migration keeps existing service/booking/payment data by creating location rows
-- from legacy free-text route/base-city fields and grouping each existing booking into
-- an order before moving payments from bookingId to orderId.

DO $$ BEGIN
  CREATE TYPE "LocationType" AS ENUM ('CITY', 'AIRPORT', 'TRAIN_STATION', 'HOLY_SITE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM ('CART', 'PENDING_PAYMENT', 'PAID', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "wif_location" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(120) NOT NULL,
  "type" "LocationType" NOT NULL DEFAULT 'CITY',
  "countryCode" VARCHAR(2) NOT NULL DEFAULT 'SA',
  "isMaster" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "wif_location_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "wif_location_type_idx" ON "wif_location"("type");
CREATE INDEX IF NOT EXISTS "wif_location_countryCode_idx" ON "wif_location"("countryCode");

CREATE TABLE IF NOT EXISTS "wif_order" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "customerId" UUID NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'CART',
  "subtotalIdr" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "discountIdr" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "totalIdr" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "voucherCode" VARCHAR(60),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "wif_order_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "wif_order_customerId_status_idx" ON "wif_order"("customerId", "status");
CREATE INDEX IF NOT EXISTS "wif_order_status_createdAt_idx" ON "wif_order"("status", "createdAt");

DO $$ BEGIN
  ALTER TABLE "wif_order" ADD CONSTRAINT "wif_order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "wif_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "wif_service_offering" ADD COLUMN IF NOT EXISTS "baseLocationId" UUID;
ALTER TABLE "wif_service_offering" ADD COLUMN IF NOT EXISTS "routeOriginId" UUID;
ALTER TABLE "wif_service_offering" ADD COLUMN IF NOT EXISTS "routeDestinationId" UUID;
ALTER TABLE "wif_booking" ADD COLUMN IF NOT EXISTS "orderId" UUID;
ALTER TABLE "wif_payment" ADD COLUMN IF NOT EXISTS "orderId" UUID;
ALTER TABLE "wif_provider_profile" ADD COLUMN IF NOT EXISTS "baseLocationId" UUID;
ALTER TABLE "wif_provider_fleet" ADD COLUMN IF NOT EXISTS "baseLocationId" UUID;

-- Ensure location rows exist for legacy free-text data before backfilling relations.
-- Some local databases were already db-pushed and no longer have routeFrom/routeTo/baseCity,
-- so every legacy-column access is guarded with dynamic SQL.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wif_service_offering' AND column_name = 'routeFrom') THEN
    EXECUTE 'INSERT INTO "wif_location" ("name", "type", "countryCode", "isMaster")
      SELECT DISTINCT TRIM("routeFrom"), ''CITY''::"LocationType", ''SA'', true
      FROM "wif_service_offering"
      WHERE "routeFrom" IS NOT NULL AND TRIM("routeFrom") <> ''''
        AND NOT EXISTS (SELECT 1 FROM "wif_location" existing WHERE LOWER(existing."name") = LOWER(TRIM("routeFrom")))';

    EXECUTE 'UPDATE "wif_service_offering" offering
      SET "routeOriginId" = location."id"
      FROM "wif_location" location
      WHERE offering."routeOriginId" IS NULL
        AND offering."routeFrom" IS NOT NULL
        AND LOWER(location."name") = LOWER(TRIM(offering."routeFrom"))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wif_service_offering' AND column_name = 'routeTo') THEN
    EXECUTE 'INSERT INTO "wif_location" ("name", "type", "countryCode", "isMaster")
      SELECT DISTINCT TRIM("routeTo"), ''CITY''::"LocationType", ''SA'', true
      FROM "wif_service_offering"
      WHERE "routeTo" IS NOT NULL AND TRIM("routeTo") <> ''''
        AND NOT EXISTS (SELECT 1 FROM "wif_location" existing WHERE LOWER(existing."name") = LOWER(TRIM("routeTo")))';

    EXECUTE 'UPDATE "wif_service_offering" offering
      SET "routeDestinationId" = location."id"
      FROM "wif_location" location
      WHERE offering."routeDestinationId" IS NULL
        AND offering."routeTo" IS NOT NULL
        AND LOWER(location."name") = LOWER(TRIM(offering."routeTo"))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wif_provider_profile' AND column_name = 'baseCity') THEN
    EXECUTE 'INSERT INTO "wif_location" ("name", "type", "countryCode", "isMaster")
      SELECT DISTINCT TRIM("baseCity"), ''CITY''::"LocationType", ''SA'', true
      FROM "wif_provider_profile"
      WHERE "baseCity" IS NOT NULL AND TRIM("baseCity") <> ''''
        AND NOT EXISTS (SELECT 1 FROM "wif_location" existing WHERE LOWER(existing."name") = LOWER(TRIM("baseCity")))';

    EXECUTE 'UPDATE "wif_provider_profile" profile
      SET "baseLocationId" = location."id"
      FROM "wif_location" location
      WHERE profile."baseLocationId" IS NULL
        AND profile."baseCity" IS NOT NULL
        AND LOWER(location."name") = LOWER(TRIM(profile."baseCity"))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wif_provider_fleet' AND column_name = 'baseCity') THEN
    EXECUTE 'INSERT INTO "wif_location" ("name", "type", "countryCode", "isMaster")
      SELECT DISTINCT TRIM("baseCity"), ''CITY''::"LocationType", ''SA'', true
      FROM "wif_provider_fleet"
      WHERE "baseCity" IS NOT NULL AND TRIM("baseCity") <> ''''
        AND NOT EXISTS (SELECT 1 FROM "wif_location" existing WHERE LOWER(existing."name") = LOWER(TRIM("baseCity")))';

    EXECUTE 'UPDATE "wif_provider_fleet" fleet
      SET "baseLocationId" = location."id"
      FROM "wif_location" location
      WHERE fleet."baseLocationId" IS NULL
        AND fleet."baseCity" IS NOT NULL
        AND LOWER(location."name") = LOWER(TRIM(fleet."baseCity"))';
  END IF;
END $$;

UPDATE "wif_service_offering" offering
SET "baseLocationId" = COALESCE(offering."routeDestinationId", offering."routeOriginId")
WHERE offering."baseLocationId" IS NULL
  AND offering."type" <> 'TRANSPORTATION';

-- Create one order per legacy booking so existing payment rows can be moved safely.
INSERT INTO "wif_order" ("customerId", "status", "subtotalIdr", "discountIdr", "totalIdr", "createdAt", "updatedAt")
SELECT
  booking."customerId",
  CASE
    WHEN booking."status" = 'DRAFT' THEN 'CART'::"OrderStatus"
    WHEN booking."status" = 'PENDING_PAYMENT' THEN 'PENDING_PAYMENT'::"OrderStatus"
    WHEN booking."status" = 'CANCELLED' THEN 'CANCELLED'::"OrderStatus"
    ELSE 'PAID'::"OrderStatus"
  END,
  booking."totalPriceIdr",
  0,
  booking."totalPriceIdr",
  booking."createdAt",
  booking."updatedAt"
FROM "wif_booking" booking
WHERE booking."orderId" IS NULL;

WITH ordered_bookings AS (
  SELECT
    booking."id" AS "bookingId",
    order_row."id" AS "orderId",
    ROW_NUMBER() OVER (PARTITION BY booking."id" ORDER BY order_row."createdAt" DESC, order_row."id") AS row_number
  FROM "wif_booking" booking
  JOIN "wif_order" order_row
    ON order_row."customerId" = booking."customerId"
   AND order_row."totalIdr" = booking."totalPriceIdr"
   AND order_row."createdAt" = booking."createdAt"
  WHERE booking."orderId" IS NULL
)
UPDATE "wif_booking" booking
SET "orderId" = ordered_bookings."orderId"
FROM ordered_bookings
WHERE booking."id" = ordered_bookings."bookingId"
  AND ordered_bookings.row_number = 1;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wif_payment' AND column_name = 'bookingId'
  ) THEN
    UPDATE "wif_payment" payment
    SET "orderId" = booking."orderId"
    FROM "wif_booking" booking
    WHERE payment."orderId" IS NULL
      AND payment."bookingId" = booking."id";
  END IF;
END $$;

-- Constraints and indexes for new relations.
CREATE INDEX IF NOT EXISTS "wif_booking_orderId_idx" ON "wif_booking"("orderId");
CREATE UNIQUE INDEX IF NOT EXISTS "wif_payment_orderId_key" ON "wif_payment"("orderId") WHERE "orderId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "wif_service_offering_baseLocationId_idx" ON "wif_service_offering"("baseLocationId");
CREATE INDEX IF NOT EXISTS "wif_service_offering_routeOriginId_idx" ON "wif_service_offering"("routeOriginId");
CREATE INDEX IF NOT EXISTS "wif_service_offering_routeDestinationId_idx" ON "wif_service_offering"("routeDestinationId");

DO $$ BEGIN
  ALTER TABLE "wif_service_offering" ADD CONSTRAINT "wif_service_offering_baseLocationId_fkey" FOREIGN KEY ("baseLocationId") REFERENCES "wif_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "wif_service_offering" ADD CONSTRAINT "wif_service_offering_routeOriginId_fkey" FOREIGN KEY ("routeOriginId") REFERENCES "wif_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "wif_service_offering" ADD CONSTRAINT "wif_service_offering_routeDestinationId_fkey" FOREIGN KEY ("routeDestinationId") REFERENCES "wif_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "wif_booking" ADD CONSTRAINT "wif_booking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "wif_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "wif_provider_profile" ADD CONSTRAINT "wif_provider_profile_baseLocationId_fkey" FOREIGN KEY ("baseLocationId") REFERENCES "wif_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "wif_provider_fleet" ADD CONSTRAINT "wif_provider_fleet_baseLocationId_fkey" FOREIGN KEY ("baseLocationId") REFERENCES "wif_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "wif_payment" ADD CONSTRAINT "wif_payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "wif_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Move payment relation fully from bookingId to orderId when legacy column exists.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wif_payment' AND column_name = 'bookingId'
  ) THEN
    ALTER TABLE "wif_payment" DROP CONSTRAINT IF EXISTS "wif_payment_bookingId_fkey";
    DROP INDEX IF EXISTS "wif_payment_bookingId_key";
    ALTER TABLE "wif_payment" DROP COLUMN IF EXISTS "bookingId";
  END IF;
END $$;

ALTER TABLE "wif_payment" ALTER COLUMN "orderId" SET NOT NULL;
DROP INDEX IF EXISTS "wif_payment_orderId_key";
CREATE UNIQUE INDEX "wif_payment_orderId_key" ON "wif_payment"("orderId");

ALTER TABLE "wif_service_offering" DROP COLUMN IF EXISTS "routeFrom";
ALTER TABLE "wif_service_offering" DROP COLUMN IF EXISTS "routeTo";
ALTER TABLE "wif_provider_profile" DROP COLUMN IF EXISTS "baseCity";
ALTER TABLE "wif_provider_fleet" DROP COLUMN IF EXISTS "baseCity";
