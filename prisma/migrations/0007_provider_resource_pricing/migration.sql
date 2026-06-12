ALTER TABLE "wif_provider_staff" ADD COLUMN IF NOT EXISTS "basePriceIdr" DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE "wif_provider_staff" ADD COLUMN IF NOT EXISTS "baseCurrency" "CurrencyCode" NOT NULL DEFAULT 'IDR';
ALTER TABLE "wif_provider_staff" ADD COLUMN IF NOT EXISTS "originalPrice" DECIMAL(14,2);

ALTER TABLE "wif_provider_fleet" ADD COLUMN IF NOT EXISTS "basePriceIdr" DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE "wif_provider_fleet" ADD COLUMN IF NOT EXISTS "baseCurrency" "CurrencyCode" NOT NULL DEFAULT 'IDR';
ALTER TABLE "wif_provider_fleet" ADD COLUMN IF NOT EXISTS "originalPrice" DECIMAL(14,2);
