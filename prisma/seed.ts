import "dotenv/config";
import { BookingStatus, PaymentStatus, PriceModel, PrismaClient, ServiceCategoryStatus, ServiceType, UserRole, VerificationStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const pool = new Pool({ connectionString, ssl: connectionString.includes("supabase.") ? { rejectUnauthorized: false } : undefined });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const passwordHash = "scrypt:Um0tdWWMTqIwbw4OQ1x2oQ:KIBLsEIofEwftnSdJvhxem-HpgCL9B0Fi9Q9WoTFf6UdhpnWXvltBxnAMbNPodNoix_vb5X5fRdiNO5a-bzjBQ"; // Password for all seeded users: password123

async function main() {
  await prisma.financeRule.deleteMany();
  await prisma.withdrawalRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.serviceOffering.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.emailOtp.deleteMany();
  await prisma.user.deleteMany({ where: { email: { endsWith: "@seed.wifme.id" } } });

  const admin = await prisma.user.create({ data: { email: "admin@seed.wifme.id", passwordHash, name: "Admin Wif-Me", role: "ADMIN", emailVerified: true } });
  const jamaah = await prisma.user.create({ data: { email: "rahman@seed.wifme.id", passwordHash, name: "Keluarga Rahman", role: "JAMAAH", phone: "+6281234567801", emailVerified: true } });
  const nabila = await prisma.user.create({ data: { email: "nabila@seed.wifme.id", passwordHash, name: "Nabila Putri", role: "JAMAAH", phone: "+6281234567802", emailVerified: true } });
  const travelCustomer = await prisma.user.create({ data: { email: "travel.amanah@seed.wifme.id", passwordHash, name: "Travel Amanah", role: "JAMAAH", emailVerified: true } });

  const abdullah = await createPartner("abdullah@seed.wifme.id", "Abdullah Al-Makki", UserRole.MUTHAWIF, "Makkah", "APPROVED");
  const aminah = await createPartner("aminah@seed.wifme.id", "Aminah Binti Yusuf", UserRole.MUTHAWIF, "Makkah", "REJECTED");
  const hijrah = await createPartner("hijrah@seed.wifme.id", "Hijrah Amanah Travel", UserRole.PROVIDER, "Jeddah", "PENDING");
  const safa = await createPartner("safa@seed.wifme.id", "Safa Transport", UserRole.PROVIDER, "Madinah", "APPROVED");
  const rawdah = await createPartner("rawdah@seed.wifme.id", "Rawdah Group Services", UserRole.PROVIDER, "Madinah", "APPROVED");
  const haramain = await createPartner("haramain@seed.wifme.id", "Haramain Fleet", UserRole.PROVIDER, "Jeddah", "PENDING");

  const categories = await seedServiceCategories();

  const offerings = await Promise.all([
    createOffering(abdullah.id, categories.MUTHAWIF_PERSONAL, "MUTHAWIF_PERSONAL", "Pendampingan Umrah Harian", "Muthawif personal untuk tawaf, sai, dan bimbingan doa.", 1500000, true),
    createOffering(abdullah.id, categories.MUTHAWIF_PERSONAL, "MUTHAWIF_PERSONAL", "Pendampingan Keluarga", "Paket muthawif untuk keluarga kecil dengan ritme fleksibel.", 4200000, true),
    createOffering(aminah.id, categories.MUTHAWIF_PERSONAL, "MUTHAWIF_PERSONAL", "Muthawif Rombongan Kecil", "Pendampingan rombongan mandiri dengan briefing manasik.", 8500000, false),
    createOffering(hijrah.id, categories.PROVIDER_MUTHAWIF, "PROVIDER_MUTHAWIF", "Supply Muthawif Travel", "Penyediaan beberapa muthawif untuk travel dan komunitas.", 18000000, true),
    createOffering(safa.id, categories.TRANSPORTATION, "TRANSPORTATION", "Transfer Bandara", "Penjemputan Jeddah/Madinah menuju hotel jamaah.", 1250000, true, "Jeddah", "Makkah"),
    createOffering(safa.id, categories.TRANSPORTATION, "TRANSPORTATION", "Rute Makkah–Madinah", "Perjalanan antar kota dengan kendaraan terjadwal.", 3200000, true, "Makkah", "Madinah"),
    createOffering(rawdah.id, categories.VISA_PROCESSING, "VISA_PROCESSING", "Visa Umrah Reguler", "Pengurusan visa umrah dengan pemeriksaan dokumen.", 2100000, true),
    createOffering(haramain.id, categories.ADDITIONAL_SERVICE, "ADDITIONAL_SERVICE", "Bantuan Kursi Roda", "Pendampingan mobilitas untuk jamaah yang membutuhkan bantuan.", 650000, false),
  ]);

  await createBooking(jamaah.id, offerings[0].id, "CONFIRMED", "HELD_IN_ESCROW", 4800000, "ESC-2401");
  await createBooking(travelCustomer.id, offerings[3].id, "IN_PROGRESS", "HELD_IN_ESCROW", 32500000, "ESC-2402");
  await createBooking(nabila.id, offerings[4].id, "COMPLETED", "RELEASED", 7250000, "ESC-2403");
  await createBooking(jamaah.id, offerings[6].id, "PENDING_PAYMENT", "REFUNDED", 12000000, "ESC-2404");

  await prisma.withdrawalRequest.createMany({ data: [
    { providerId: abdullah.id, amountIdr: 3900000, status: "REVIEW", bankName: "Bank Syariah Indonesia", bankAccountLast4: "7812" },
    { providerId: hijrah.id, amountIdr: 28000000, status: "APPROVED", bankName: "Al Rajhi", bankAccountLast4: "3321", reviewedAt: new Date() },
    { providerId: safa.id, amountIdr: 6500000, status: "PAID", bankName: "SNB", bankAccountLast4: "9930", reviewedAt: new Date(), paidAt: new Date() },
    { providerId: aminah.id, amountIdr: 2100000, status: "REJECTED", bankName: "Bank Muamalat", bankAccountLast4: "2201", reviewedAt: new Date() },
  ] });

  await prisma.financeRule.createMany({ data: [
    { key: "platformCommission", kind: "FEE", title: "Komisi platform", description: "Persentase komisi default dari layanan marketplace.", value: "10%", status: "ACTIVE" },
    { key: "providerCommission", kind: "FEE", title: "Komisi provider", description: "Komisi khusus untuk kerja sama provider B2B.", value: "7%", status: "ACTIVE" },
    { key: "withdrawalFee", kind: "FEE", title: "Biaya penarikan", description: "Biaya flat untuk setiap permintaan pencairan dana.", value: "Rp 6.500", status: "DRAFT" },
    { key: "paymentGateway", kind: "CHARGE", title: "Charge payment gateway", description: "Biaya pemrosesan dari kanal pembayaran.", value: "2,9% + Rp 2.000", status: "ACTIVE" },
    { key: "currencySpread", kind: "CHARGE", title: "Spread kurs", description: "Margin kecil untuk risiko perubahan kurs multi-currency.", value: "1,5%", status: "ACTIVE" },
    { key: "urgentProcessing", kind: "CHARGE", title: "Charge proses prioritas", description: "Biaya tambahan untuk proses dokumen atau layanan mendesak.", value: "Rp 150.000", status: "DRAFT" },
  ] });

  console.log(`Seeded Wif-Me sample data. Admin user: ${admin.email}`);
}

async function createPartner(email: string, name: string, role: UserRole, city: string, status: VerificationStatus) {
  const user = await prisma.user.create({ data: { email, passwordHash, name, role, emailVerified: true } });
  await prisma.providerProfile.create({ data: { userId: user.id, displayName: name, baseCity: city, languages: ["Indonesia", "Arab"], verificationStatus: status, verifiedAt: status === "APPROVED" ? new Date() : null } });
  return user;
}

async function seedServiceCategories() {
  const rows = [
    { key: "muthawifPersonal", slug: "muthawif", serviceType: ServiceType.MUTHAWIF_PERSONAL, title: "Muthawif Personal", description: "Pendamping personal untuk jamaah mandiri, keluarga, dan rombongan kecil.", priceModel: PriceModel.CURRENCY, displayOrder: 1, status: ServiceCategoryStatus.ACTIVE },
    { key: "providerMuthawif", slug: "provider", serviceType: ServiceType.PROVIDER_MUTHAWIF, title: "Provider Muthawif", description: "Kerja sama B2B untuk travel, komunitas, dan organisasi.", priceModel: PriceModel.B2B, displayOrder: 2, status: ServiceCategoryStatus.ACTIVE },
    { key: "transportation", slug: "transport", serviceType: ServiceType.TRANSPORTATION, title: "Transportasi", description: "Armada dan rute bandara, Makkah, Madinah, ziarah, dan antar kota.", priceModel: PriceModel.ROUTE, displayOrder: 3, status: ServiceCategoryStatus.ACTIVE },
    { key: "visaProcessing", slug: "visa", serviceType: ServiceType.VISA_PROCESSING, title: "Visa Processing", description: "Pengurusan visa dan dokumen pendukung yang dapat dipantau.", priceModel: PriceModel.DOCUMENT, displayOrder: 4, status: ServiceCategoryStatus.ACTIVE },
    { key: "additionalServices", slug: "additional", serviceType: ServiceType.ADDITIONAL_SERVICE, title: "Layanan Tambahan", description: "Kebutuhan pendukung yang dapat disambungkan ke booking utama.", priceModel: PriceModel.CUSTOM, displayOrder: 5, status: ServiceCategoryStatus.DRAFT },
  ];
  const entries = await Promise.all(rows.map((data) => prisma.serviceCategory.create({ data })));
  return Object.fromEntries(entries.map((entry) => [entry.serviceType, entry.id])) as Record<ServiceType, string>;
}

async function createOffering(ownerId: string, categoryId: string, type: ServiceType, title: string, description: string, basePriceIdr: number, isActive: boolean, routeFrom: string | null = null, routeTo: string | null = null) {
  return prisma.serviceOffering.create({ data: { ownerId, categoryId, type, title, description, basePriceIdr, isActive, routeFrom, routeTo } });
}

async function createBooking(customerId: string, serviceOfferingId: string, status: BookingStatus, paymentStatus: PaymentStatus, amountIdr: number, reference: string) {
  const booking = await prisma.booking.create({ data: { customerId, serviceOfferingId, status, scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), totalPriceIdr: amountIdr } });
  await prisma.payment.create({ data: { bookingId: booking.id, status: paymentStatus, amountIdr, gatewayReference: reference, escrowReleasedAt: paymentStatus === "RELEASED" ? new Date() : null } });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
