import "dotenv/config";
import { PaymentStatus, PriceModel, PrismaClient, ServiceCategoryStatus, ServiceType, UserRole, VerificationStatus, OrderStatus } from "@prisma/client";
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
  await prisma.order.deleteMany();
  await prisma.serviceOffering.deleteMany();
  await prisma.providerFleet.deleteMany();
  await prisma.providerStaff.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.emailOtp.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany({ where: { email: { endsWith: "@seed.wifme.id" } } });

  // --- 1. Seed Locations ---
  const locMakkah = await prisma.location.create({ data: { name: "Makkah", type: "CITY", countryCode: "SA", isMaster: true } });
  const locMadinah = await prisma.location.create({ data: { name: "Madinah", type: "CITY", countryCode: "SA", isMaster: true } });
  const locJeddah = await prisma.location.create({ data: { name: "Jeddah", type: "CITY", countryCode: "SA", isMaster: true } });
  const locTaif = await prisma.location.create({ data: { name: "Taif", type: "CITY", countryCode: "SA", isMaster: true } });
  const locJeddahAirport = await prisma.location.create({ data: { name: "Jeddah Airport", type: "AIRPORT", countryCode: "SA", isMaster: true } });
  const locMadinahAirport = await prisma.location.create({ data: { name: "Madinah Airport", type: "AIRPORT", countryCode: "SA", isMaster: true } });
  const locTrainStation = await prisma.location.create({ data: { name: "Train Station (Haramain)", type: "TRAIN_STATION", countryCode: "SA", isMaster: true } });

  const locations = { Makkah: locMakkah.id, Madinah: locMadinah.id, Jeddah: locJeddah.id, Taif: locTaif.id, "Jeddah Airport": locJeddahAirport.id, "Madinah Airport": locMadinahAirport.id, "Train Station": locTrainStation.id };

  const admin = await prisma.user.create({ data: { email: "admin@seed.wifme.id", passwordHash, name: "Admin Wif-Me", role: "ADMIN", emailVerified: true } });
  const officialTransport = await prisma.user.create({ data: { email: "official.transport@seed.wifme.id", passwordHash, name: "Wif-Me Official Transport", role: "ADMIN", emailVerified: true } });
  const jamaah = await prisma.user.create({ data: { email: "rahman@seed.wifme.id", passwordHash, name: "Keluarga Rahman", role: "JAMAAH", phone: "+6281234567801", emailVerified: true } });
  const nabila = await prisma.user.create({ data: { email: "nabila@seed.wifme.id", passwordHash, name: "Nabila Putri", role: "JAMAAH", phone: "+6281234567802", emailVerified: true } });
  const travelCustomer = await prisma.user.create({ data: { email: "travel.amanah@seed.wifme.id", passwordHash, name: "Travel Amanah", role: "JAMAAH", emailVerified: true } });

  const abdullah = await createPartner("abdullah@seed.wifme.id", "Abdullah Al-Makki", UserRole.MUTHAWIF, locations.Makkah, "APPROVED");
  const aminah = await createPartner("aminah@seed.wifme.id", "Aminah Binti Yusuf", UserRole.MUTHAWIF, locations.Makkah, "REJECTED");
  const hijrah = await createPartner("hijrah@seed.wifme.id", "Hijrah Amanah Travel", UserRole.PROVIDER, locations.Jeddah, "PENDING");
  const safa = await createPartner("safa@seed.wifme.id", "Safa Transport", UserRole.PROVIDER, locations.Madinah, "APPROVED");
  const rawdah = await createPartner("rawdah@seed.wifme.id", "Rawdah Group Services", UserRole.PROVIDER, locations.Madinah, "APPROVED");
  const haramain = await createPartner("haramain@seed.wifme.id", "Haramain Fleet", UserRole.PROVIDER, locations.Jeddah, "PENDING");

  const categories = await seedServiceCategories();

  await seedProviderResources(locations, { hijrah: hijrah.id, safa: safa.id, rawdah: rawdah.id, haramain: haramain.id });

  const offerings = await Promise.all([
    createOffering(abdullah.id, categories.MUTHAWIF_PERSONAL, "MUTHAWIF_PERSONAL", "Pendampingan Umrah Harian", "Muthawif personal untuk tawaf, sai, dan bimbingan doa.", 1500000, true, locations.Makkah),
    createOffering(abdullah.id, categories.MUTHAWIF_PERSONAL, "MUTHAWIF_PERSONAL", "Pendampingan Keluarga", "Paket muthawif untuk keluarga kecil dengan ritme fleksibel.", 4200000, true, locations.Makkah),
    createOffering(aminah.id, categories.MUTHAWIF_PERSONAL, "MUTHAWIF_PERSONAL", "Muthawif Rombongan Kecil", "Pendampingan rombongan mandiri dengan briefing manasik.", 8500000, false, locations.Makkah),
    createOffering(hijrah.id, categories.PROVIDER_MUTHAWIF, "PROVIDER_MUTHAWIF", "Supply Muthawif Travel", "Penyediaan beberapa muthawif untuk travel dan komunitas.", 18000000, true, locations.Jeddah),
    createOffering(rawdah.id, categories.VISA_PROCESSING, "VISA_PROCESSING", "Visa Umrah Reguler", "Pengurusan visa umrah dengan pemeriksaan dokumen.", 2100000, true, locations.Madinah),
    createOffering(haramain.id, categories.ADDITIONAL_SERVICE, "ADDITIONAL_SERVICE", "Bantuan Kursi Roda", "Pendampingan mobilitas untuk jamaah yang membutuhkan bantuan.", 650000, false, locations.Jeddah),
  ]);

  // --- Transport offerings (SAR pricing from route/vehicle matrix) ---
  const SAR_TO_IDR = Math.round(1 / 0.00024); // ≈ 4167
  const VEHICLES = ["Camry", "Hyundai H1", "GMC 2024", "HiAce", "Coaster", "Bus"] as const;

  type RouteSpec = {
    readonly title: string;
    readonly fromId: string;
    readonly toId: string;
    readonly prices: readonly [number, number, number, number, number, number];
  };

  const TRANSPORT_ROUTES: readonly RouteSpec[] = [
    { title: "Jeddah Airport to Makkah Hotel",      fromId: locations["Jeddah Airport"],  toId: locations.Makkah,   prices: [275, 375, 500, 400, 700, 1000] },
    { title: "Makkah Hotel to Jeddah Airport",       fromId: locations.Makkah,   toId: locations["Jeddah Airport"], prices: [250, 350, 500, 400, 700, 1000] },
    { title: "Makkah Hotel to Madina Hotel",         fromId: locations.Makkah,   toId: locations.Madinah,   prices: [500, 600, 1000, 700, 1200, 1500] },
    { title: "Madina Hotel to Makkah Hotel",         fromId: locations.Madinah,   toId: locations.Makkah,   prices: [500, 600, 1000, 700, 1200, 1500] },
    { title: "Madina Airport to Madina Hotel",       fromId: locations["Madinah Airport"], toId: locations.Madinah,   prices: [200, 250, 350, 350, 600, 800] },
    { title: "Madina Hotel to Madina Airport",       fromId: locations.Madinah,   toId: locations["Madinah Airport"], prices: [125, 200, 300, 250, 550, 800] },
    { title: "Jeddah Airport to Madina Hotel",       fromId: locations["Jeddah Airport"], toId: locations.Madinah,   prices: [500, 650, 1000, 750, 1200, 1500] },
    { title: "Madinah Hotel to Jeddah Airport",      fromId: locations.Madinah,   toId: locations["Jeddah Airport"], prices: [500, 600, 1000, 700, 1200, 1500] },
    { title: "Jeddah to Taif Ziyarat",               fromId: locations.Jeddah,         toId: locations.Taif,           prices: [700, 1000, 1500, 1200, 2000, 2500] },
    { title: "Makkah to Taif Ziyarat",               fromId: locations.Makkah,         toId: locations.Taif,           prices: [500, 650, 1000, 700, 1200, 1500] },
    { title: "Jeddah Airport to Jeddah Hotel",       fromId: locations["Jeddah Airport"], toId: locations.Jeddah,   prices: [200, 250, 350, 300, 450, 700] },
    { title: "Train Station to Hotel (Makkah)",      fromId: locations["Train Station"],  toId: locations.Makkah,          prices: [125, 175, 300, 250, 400, 600] },
  ];

  for (const route of TRANSPORT_ROUTES) {
    for (let v = 0; v < VEHICLES.length; v++) {
      const priceSar = route.prices[v];
      const priceIdr = priceSar * SAR_TO_IDR;
      await createOffering(
        officialTransport.id, categories.TRANSPORTATION, "TRANSPORTATION",
        `${route.title} — ${VEHICLES[v]}`,
        `Layanan transportasi rute ${route.title} menggunakan ${VEHICLES[v]}.`,
        priceIdr, true,
        route.fromId, route.fromId, route.toId,
        VEHICLES[v], "SAR", priceSar,
      );
    }
  }
  console.log(`  → Seeded ${TRANSPORT_ROUTES.length * VEHICLES.length} transport offerings`);

  await createOrder(jamaah.id, offerings[0].id, "PAID", "RELEASED", 4800000, "ESC-2401");
  await createOrder(travelCustomer.id, offerings[3].id, "PAID", "HELD_IN_ESCROW", 32500000, "ESC-2402");
  await createOrder(nabila.id, offerings[4].id, "PAID", "RELEASED", 7250000, "ESC-2403");
  await createOrder(jamaah.id, offerings[4].id, "PENDING_PAYMENT", "REFUNDED", 12000000, "ESC-2404");

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

async function createPartner(email: string, name: string, role: UserRole, baseLocationId: string, status: VerificationStatus) {
  const user = await prisma.user.create({ data: { email, passwordHash, name, role, emailVerified: true } });
  
  await prisma.providerProfile.create({
    data: {
      userId: user.id,
      companyName: role === UserRole.PROVIDER ? name : "Perorangan",
      displayName: name,
      companyType: role === UserRole.PROVIDER ? "other" : "muthawif_personal",
      baseLocationId,
      languages: ["Indonesia", "Arab"],
      verificationStatus: status,
      verifiedAt: status === "APPROVED" ? new Date() : null,
    },
  });
  return user;
}

async function seedProviderResources(locations: Record<string, string>, providerIds: { readonly hijrah: string; readonly safa: string; readonly rawdah: string; readonly haramain: string }) {
  await prisma.providerStaff.createMany({ data: [
    { providerId: providerIds.hijrah, name: "Ustaz Farhan", roleTitle: "Koordinator muthawif", phone: "+966501110001", languages: ["Indonesia", "Arab"], basePriceIdr: 1750000, baseCurrency: "IDR", originalPrice: 1750000, status: "ACTIVE", notes: "Menangani briefing travel sebelum keberangkatan." },
    { providerId: providerIds.hijrah, name: "Siti Maryam", roleTitle: "Admin operasional", phone: "+966501110002", languages: ["Indonesia", "Inggris"], basePriceIdr: 950000, baseCurrency: "IDR", originalPrice: 950000, status: "ON_DUTY" },
    { providerId: providerIds.rawdah, name: "Husain Al-Madani", roleTitle: "Petugas dokumen", phone: "+966501110003", languages: ["Arab", "Indonesia"], basePriceIdr: 1200000, baseCurrency: "IDR", originalPrice: 1200000, status: "ACTIVE" },
    { providerId: providerIds.safa, name: "Khalid Anwar", roleTitle: "Dispatcher", phone: "+966501110004", languages: ["Arab", "Inggris"], basePriceIdr: 1100000, baseCurrency: "IDR", originalPrice: 1100000, status: "ACTIVE" },
  ] });

  await prisma.providerFleet.createMany({ data: [
    { providerId: providerIds.safa, vehicleName: "Safa H1 01", vehicleType: "Hyundai H1", plateNumber: "JED-2147", capacity: 7, baseLocationId: locations.Jeddah, basePriceIdr: 1450000, baseCurrency: "IDR", originalPrice: 1450000, status: "AVAILABLE", notes: "Unit provider Safa, bukan layanan resmi Wif-Me." },
    { providerId: providerIds.safa, vehicleName: "Safa HiAce 03", vehicleType: "HiAce", plateNumber: "MAD-8802", capacity: 12, baseLocationId: locations.Madinah, basePriceIdr: 2200000, baseCurrency: "IDR", originalPrice: 2200000, status: "ASSIGNED" },
    { providerId: providerIds.haramain, vehicleName: "Haramain Bus 02", vehicleType: "Bus", plateNumber: "JED-9901", capacity: 45, baseLocationId: locations.Jeddah, basePriceIdr: 5200000, baseCurrency: "IDR", originalPrice: 5200000, status: "MAINTENANCE" },
    { providerId: providerIds.rawdah, vehicleName: "Rawdah Coaster 01", vehicleType: "Coaster", plateNumber: "MAD-5104", capacity: 22, baseLocationId: locations.Madinah, basePriceIdr: 3600000, baseCurrency: "IDR", originalPrice: 3600000, status: "AVAILABLE" },
  ] });
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

async function createOffering(
  ownerId: string, categoryId: string, type: ServiceType,
  title: string, description: string, basePriceIdr: number, isActive: boolean,
  baseLocationId?: string, routeOriginId?: string, routeDestinationId?: string,
  vehicleType: string | null = null,
  baseCurrency: "IDR" | "SAR" | "USD" = "IDR",
  originalPrice: number | null = null,
) {
  return prisma.serviceOffering.create({
    data: {
      ownerId, categoryId, type, title, description,
      basePriceIdr, isActive, baseLocationId, routeOriginId, routeDestinationId, vehicleType,
      baseCurrency, originalPrice,
    },
  });
}

async function createOrder(customerId: string, serviceOfferingId: string, orderStatus: OrderStatus, paymentStatus: PaymentStatus, amountIdr: number, reference: string) {
  const order = await prisma.order.create({ data: { customerId, status: orderStatus, subtotalIdr: amountIdr, totalIdr: amountIdr } });
  await prisma.booking.create({ data: { customerId, serviceOfferingId, orderId: order.id, status: "CONFIRMED", scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), totalPriceIdr: amountIdr } });
  
  if (orderStatus === "PAID" || paymentStatus === "HELD_IN_ESCROW" || paymentStatus === "RELEASED") {
    await prisma.payment.create({ data: { orderId: order.id, status: paymentStatus, amountIdr, gatewayReference: reference, escrowReleasedAt: paymentStatus === "RELEASED" ? new Date() : null } });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
