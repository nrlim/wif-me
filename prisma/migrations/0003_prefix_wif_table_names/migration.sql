-- Prefix application table names with `wif_` and keep snake_case separators.
-- PostgreSQL updates foreign key references automatically when tables are renamed;
-- constraints and indexes are renamed separately for a clean schema history.

ALTER TABLE "users" RENAME TO "wif_user";
ALTER TABLE "provider_profiles" RENAME TO "wif_provider_profile";
ALTER TABLE "service_offerings" RENAME TO "wif_service_offering";
ALTER TABLE "bookings" RENAME TO "wif_booking";
ALTER TABLE "payments" RENAME TO "wif_payment";
ALTER TABLE "email_otps" RENAME TO "wif_email_otp";
ALTER TABLE "exchange_rates" RENAME TO "wif_exchange_rate";

ALTER TABLE "wif_user" RENAME CONSTRAINT "users_pkey" TO "wif_user_pkey";
ALTER TABLE "wif_provider_profile" RENAME CONSTRAINT "provider_profiles_pkey" TO "wif_provider_profile_pkey";
ALTER TABLE "wif_service_offering" RENAME CONSTRAINT "service_offerings_pkey" TO "wif_service_offering_pkey";
ALTER TABLE "wif_booking" RENAME CONSTRAINT "bookings_pkey" TO "wif_booking_pkey";
ALTER TABLE "wif_payment" RENAME CONSTRAINT "payments_pkey" TO "wif_payment_pkey";
ALTER TABLE "wif_email_otp" RENAME CONSTRAINT "email_otps_pkey" TO "wif_email_otp_pkey";
ALTER TABLE "wif_exchange_rate" RENAME CONSTRAINT "exchange_rates_pkey" TO "wif_exchange_rate_pkey";

ALTER TABLE "wif_provider_profile" RENAME CONSTRAINT "provider_profiles_userId_fkey" TO "wif_provider_profile_userId_fkey";
ALTER TABLE "wif_service_offering" RENAME CONSTRAINT "service_offerings_ownerId_fkey" TO "wif_service_offering_ownerId_fkey";
ALTER TABLE "wif_booking" RENAME CONSTRAINT "bookings_customerId_fkey" TO "wif_booking_customerId_fkey";
ALTER TABLE "wif_booking" RENAME CONSTRAINT "bookings_serviceOfferingId_fkey" TO "wif_booking_serviceOfferingId_fkey";
ALTER TABLE "wif_payment" RENAME CONSTRAINT "payments_bookingId_fkey" TO "wif_payment_bookingId_fkey";
ALTER TABLE "wif_email_otp" RENAME CONSTRAINT "email_otps_userId_fkey" TO "wif_email_otp_userId_fkey";

ALTER INDEX "users_email_key" RENAME TO "wif_user_email_key";
ALTER INDEX "users_role_idx" RENAME TO "wif_user_role_idx";
ALTER INDEX "users_createdAt_idx" RENAME TO "wif_user_createdAt_idx";
ALTER INDEX "provider_profiles_userId_key" RENAME TO "wif_provider_profile_userId_key";
ALTER INDEX "provider_profiles_verificationStatus_idx" RENAME TO "wif_provider_profile_verificationStatus_idx";
ALTER INDEX "service_offerings_type_isActive_idx" RENAME TO "wif_service_offering_type_isActive_idx";
ALTER INDEX "service_offerings_ownerId_idx" RENAME TO "wif_service_offering_ownerId_idx";
ALTER INDEX "bookings_customerId_status_idx" RENAME TO "wif_booking_customerId_status_idx";
ALTER INDEX "bookings_serviceOfferingId_scheduledStart_idx" RENAME TO "wif_booking_serviceOfferingId_scheduledStart_idx";
ALTER INDEX "payments_bookingId_key" RENAME TO "wif_payment_bookingId_key";
ALTER INDEX "payments_status_idx" RENAME TO "wif_payment_status_idx";
ALTER INDEX "email_otps_userId_purpose_expiresAt_idx" RENAME TO "wif_email_otp_userId_purpose_expiresAt_idx";
ALTER INDEX "email_otps_purpose_createdAt_idx" RENAME TO "wif_email_otp_purpose_createdAt_idx";
ALTER INDEX "exchange_rates_fetchedAt_idx" RENAME TO "wif_exchange_rate_fetchedAt_idx";
ALTER INDEX "exchange_rates_baseCurrency_targetCurrency_key" RENAME TO "wif_exchange_rate_baseCurrency_targetCurrency_key";
