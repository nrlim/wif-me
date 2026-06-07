export const SERVICE_CATEGORY_KEYS = [
  "muthawifPersonal",
  "providerMuthawif",
  "transportation",
  "visaProcessing",
  "additionalServices",
] as const;

export type ServiceCategoryKey = (typeof SERVICE_CATEGORY_KEYS)[number];

export type PublicServiceSlug = "muthawif" | "provider" | "transport" | "visa" | "additional";

export type PriceModelKey = "currency" | "b2b" | "route" | "document" | "custom";
export type ServiceStatusKey = "active" | "draft";

export type ServiceCategoryConfig = {
  readonly key: ServiceCategoryKey;
  readonly slug: PublicServiceSlug;
  readonly priceModelKey: PriceModelKey;
  readonly providerCount: number;
  readonly serviceCount: number;
  readonly order: number;
  readonly status: ServiceStatusKey;
};

export type PlatformServiceKey =
  | "personalUmrahBasic"
  | "familyMuthawif"
  | "groupMuthawif"
  | "travelMuthawifSupply"
  | "hotelToHaramShuttle"
  | "airportTransfer"
  | "makkahMadinahRoute"
  | "umrahVisaRegular"
  | "documentReview"
  | "wheelchairSupport"
  | "simCardAssistance";

export type PlatformServiceConfig = {
  readonly key: PlatformServiceKey;
  readonly categoryKey: ServiceCategoryKey;
  readonly code: string;
  readonly basePriceIdr: string;
  readonly durationKey: string;
  readonly status: ServiceStatusKey;
  readonly isFeatured?: boolean;
};

export const SERVICE_CATEGORIES: readonly ServiceCategoryConfig[] = [
  { key: "muthawifPersonal", slug: "muthawif", priceModelKey: "currency", providerCount: 28, serviceCount: 3, order: 1, status: "active" },
  { key: "providerMuthawif", slug: "provider", priceModelKey: "b2b", providerCount: 9, serviceCount: 1, order: 2, status: "active" },
  { key: "transportation", slug: "transport", priceModelKey: "route", providerCount: 14, serviceCount: 3, order: 3, status: "active" },
  { key: "visaProcessing", slug: "visa", priceModelKey: "document", providerCount: 6, serviceCount: 2, order: 4, status: "active" },
  { key: "additionalServices", slug: "additional", priceModelKey: "custom", providerCount: 3, serviceCount: 2, order: 5, status: "draft" },
];

export const PLATFORM_SERVICES: readonly PlatformServiceConfig[] = [
  { key: "personalUmrahBasic", categoryKey: "muthawifPersonal", code: "WIF-MT-01", basePriceIdr: "1500000", durationKey: "oneDay", status: "active", isFeatured: true },
  { key: "familyMuthawif", categoryKey: "muthawifPersonal", code: "WIF-MT-02", basePriceIdr: "4200000", durationKey: "threeDays", status: "active" },
  { key: "groupMuthawif", categoryKey: "muthawifPersonal", code: "WIF-MT-03", basePriceIdr: "8500000", durationKey: "fiveDays", status: "draft" },
  { key: "travelMuthawifSupply", categoryKey: "providerMuthawif", code: "WIF-PR-01", basePriceIdr: "18000000", durationKey: "perGroup", status: "active", isFeatured: true },
  { key: "hotelToHaramShuttle", categoryKey: "transportation", code: "WIF-TR-01", basePriceIdr: "450000", durationKey: "perTrip", status: "active" },
  { key: "airportTransfer", categoryKey: "transportation", code: "WIF-TR-02", basePriceIdr: "1250000", durationKey: "perTrip", status: "active", isFeatured: true },
  { key: "makkahMadinahRoute", categoryKey: "transportation", code: "WIF-TR-03", basePriceIdr: "3200000", durationKey: "intercity", status: "active" },
  { key: "umrahVisaRegular", categoryKey: "visaProcessing", code: "WIF-VS-01", basePriceIdr: "2100000", durationKey: "businessDays", status: "active", isFeatured: true },
  { key: "documentReview", categoryKey: "visaProcessing", code: "WIF-VS-02", basePriceIdr: "350000", durationKey: "oneDay", status: "active" },
  { key: "wheelchairSupport", categoryKey: "additionalServices", code: "WIF-AD-01", basePriceIdr: "650000", durationKey: "perDay", status: "draft" },
  { key: "simCardAssistance", categoryKey: "additionalServices", code: "WIF-AD-02", basePriceIdr: "250000", durationKey: "once", status: "draft" },
];

export function getCategoryByKey(key: string): ServiceCategoryConfig | undefined {
  return SERVICE_CATEGORIES.find((category) => category.key === key);
}

export function getCategoryBySlug(slug: string): ServiceCategoryConfig | undefined {
  return SERVICE_CATEGORIES.find((category) => category.slug === slug);
}

export function getServiceByKey(key: string): PlatformServiceConfig | undefined {
  return PLATFORM_SERVICES.find((service) => service.key === key);
}

export function getServicesByCategory(categoryKey: ServiceCategoryKey): readonly PlatformServiceConfig[] {
  return PLATFORM_SERVICES.filter((service) => service.categoryKey === categoryKey);
}
