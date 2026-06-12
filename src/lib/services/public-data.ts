import "server-only";

import { ServiceType, type ServiceType as PrismaServiceType } from "@prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";
import { getBookableCatalogRows, type CatalogSource } from "@/lib/services/bookable-catalog";

export type PublicOfferingRow = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly ownerName: string;
  readonly ownerLogoUrl: string;
  readonly source: CatalogSource;
  readonly basePrice: string;
  readonly basePriceIdr: number;
  readonly type: ServiceType;
  readonly routeLabel: string | null;
  readonly vehicleType: string | null;
};

export type PublicCategoryFilters = {
  readonly q?: string;
  readonly source?: CatalogSource;
  readonly vehicleType?: string;
  readonly locationId?: string;
};

export type PublicCategoryFacet = {
  readonly value: string;
  readonly label: string;
  readonly count: number;
};

export type PublicCategoryDetail = {
  readonly key: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly offerings: readonly PublicOfferingRow[];
  readonly providerCount: number;
  readonly totalOfferings: number;
  readonly providerBackedCount: number;
  readonly vehicleTypes: readonly PublicCategoryFacet[];
  readonly sourceCounts: Readonly<Record<"direct" | "providerStaff" | "providerFleet", number>>;
};

export type PublicCategorySummary = {
  readonly key: string;
  readonly slug: string;
  readonly providerCount: number;
  readonly serviceCount: number;
};

const CATEGORY_SERVICE_TYPES = {
  muthawifPersonal: ServiceType.MUTHAWIF_PERSONAL,
  transportation: ServiceType.TRANSPORTATION,
  visaProcessing: ServiceType.VISA_PROCESSING,
  additionalServices: ServiceType.ADDITIONAL_SERVICE,
} as const satisfies Record<string, ServiceType>;

export async function getPublicCategoryDetail(slug: string, filters: PublicCategoryFilters = {}): Promise<PublicCategoryDetail | null> {
  const prisma = getPrismaClient();
  const category = await prisma.serviceCategory.findFirst({
    where: { slug, status: "ACTIVE", key: { not: "providerMuthawif" } },
    select: { key: true, slug: true, title: true, description: true },
  });

  if (!category) return null;

  const serviceType = CATEGORY_SERVICE_TYPES[category.key as keyof typeof CATEGORY_SERVICE_TYPES];
  if (!serviceType) return null;

  const allRows = await getBookableCatalogRows({ serviceType, q: filters.q, locationId: filters.locationId, page: 1, perPage: 50, sort: "latest", order: "desc" });
  const filteredRows = allRows.filter((row) => (!filters.source || row.source === filters.source) && (!filters.vehicleType || row.vehicleType === filters.vehicleType));
  const providerNames = new Set(filteredRows.map((offering) => offering.ownerName));

  return {
    key: category.key,
    slug: category.slug,
    title: category.title,
    description: category.description,
    offerings: filteredRows.map(toPublicOfferingRow),
    providerCount: providerNames.size,
    totalOfferings: allRows.length,
    providerBackedCount: new Set(allRows.filter((row) => row.source === "providerStaff" || row.source === "providerFleet").map((row) => row.ownerName)).size,
    vehicleTypes: toVehicleFacets(allRows),
    sourceCounts: {
      direct: allRows.filter((row) => row.source === "direct").length,
      providerStaff: allRows.filter((row) => row.source === "providerStaff").length,
      providerFleet: allRows.filter((row) => row.source === "providerFleet").length,
    },
  };
}

export async function getPublicCategoriesSummary(): Promise<readonly PublicCategorySummary[]> {
  const prisma = getPrismaClient();
  const [categories, rows] = await Promise.all([
    prisma.serviceCategory.findMany({ where: { status: "ACTIVE", key: { not: "providerMuthawif" } }, select: { key: true, slug: true, serviceType: true }, orderBy: { displayOrder: "asc" } }),
    getBookableCatalogRows({ page: 1, perPage: 50, sort: "latest", order: "desc" }),
  ]);

  return categories.map((category) => toCategorySummary(category, rows));
}

export async function getPublicLocations(): Promise<readonly { readonly id: string; readonly name: string; readonly isAirport: boolean }[]> {
  const prisma = getPrismaClient();
  const locations = await prisma.location.findMany({ select: { id: true, name: true, type: true }, orderBy: { name: "asc" } });
  return locations.map((location) => ({ id: location.id, name: location.name, isAirport: location.type === "AIRPORT" }));
}

function toPublicOfferingRow(row: Awaited<ReturnType<typeof getBookableCatalogRows>>[number]): PublicOfferingRow {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    ownerName: row.ownerName,
    ownerLogoUrl: row.ownerLogoUrl,
    source: row.source,
    basePrice: row.basePrice,
    basePriceIdr: row.basePriceIdr,
    type: row.type,
    routeLabel: row.routeLabel,
    vehicleType: row.vehicleType,
  };
}

function toVehicleFacets(rows: Awaited<ReturnType<typeof getBookableCatalogRows>>): readonly PublicCategoryFacet[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!row.vehicleType) continue;
    counts.set(row.vehicleType, (counts.get(row.vehicleType) ?? 0) + 1);
  }
  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([label, count]) => ({ value: label, label, count }));
}

function toCategorySummary(category: { readonly key: string; readonly slug: string; readonly serviceType: PrismaServiceType }, rows: Awaited<ReturnType<typeof getBookableCatalogRows>>): PublicCategorySummary {
  const categoryRows = rows.filter((row) => row.type === category.serviceType);
  return {
    key: category.key,
    slug: category.slug,
    providerCount: new Set(categoryRows.map((row) => row.ownerName)).size,
    serviceCount: categoryRows.length,
  };
}
