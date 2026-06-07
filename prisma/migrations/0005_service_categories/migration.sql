-- CreateEnum
CREATE TYPE "ServiceCategoryStatus" AS ENUM ('ACTIVE', 'DRAFT');

-- CreateEnum
CREATE TYPE "PriceModel" AS ENUM ('CURRENCY', 'B2B', 'ROUTE', 'DOCUMENT', 'CUSTOM');

-- CreateTable
CREATE TABLE "wif_service_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" TEXT NOT NULL,
    "priceModel" "PriceModel" NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 1,
    "status" "ServiceCategoryStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wif_service_category_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "wif_service_offering" ADD COLUMN "categoryId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "wif_service_category_key_key" ON "wif_service_category"("key");
CREATE UNIQUE INDEX "wif_service_category_slug_key" ON "wif_service_category"("slug");
CREATE UNIQUE INDEX "wif_service_category_serviceType_key" ON "wif_service_category"("serviceType");
CREATE INDEX "wif_service_category_status_displayOrder_idx" ON "wif_service_category"("status", "displayOrder");
CREATE INDEX "wif_service_offering_categoryId_isActive_idx" ON "wif_service_offering"("categoryId", "isActive");

-- AddForeignKey
ALTER TABLE "wif_service_offering" ADD CONSTRAINT "wif_service_offering_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "wif_service_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
