-- Custom authentication fields and OTP support
CREATE TYPE "OtpPurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

ALTER TABLE "users"
  ADD COLUMN "passwordHash" VARCHAR(255) NOT NULL DEFAULT '',
  ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);

CREATE TABLE "email_otps" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "purpose" "OtpPurpose" NOT NULL,
  "otpHash" VARCHAR(128) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "email_otps_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "email_otps_userId_purpose_expiresAt_idx" ON "email_otps"("userId", "purpose", "expiresAt");
CREATE INDEX "email_otps_purpose_createdAt_idx" ON "email_otps"("purpose", "createdAt");

ALTER TABLE "email_otps"
  ADD CONSTRAINT "email_otps_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
