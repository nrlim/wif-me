import "server-only";

import { Prisma, ServiceType, UserRole, VerificationStatus } from "@prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/currency/formatters";
import { FALLBACK_RATES } from "@/lib/currency/rates";
import { getPublicUrl } from "@/lib/storage/supabase";
import type { ServiceSearchQuery } from "@/lib/validators/jamaah";

export type CatalogSource = "direct" | "providerStaff" | "providerFleet";

const WIF_ME_SERVICE_LOGO = "/logo-icon.png";

export type BookableCatalogRow = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: ServiceType;
  readonly categoryTitle: string;
  readonly ownerName: string;
  readonly ownerLogoUrl: string;
  readonly source: CatalogSource;
  readonly routeLabel: string | null;
  readonly vehicleType: string | null;
  readonly basePrice: string;
  readonly basePriceIdr: number;
  readonly ownerAvailable: boolean;
  readonly createdAt: string;
};

export type BookableResourceRef =
  | { readonly kind: "serviceOffering"; readonly id: string }
  | { readonly kind: "providerStaff"; readonly id: string }
  | { readonly kind: "providerFleet"; readonly id: string };

const providerStaffPrefix = "staff:";
const providerFleetPrefix = "fleet:";

const serviceSelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  basePriceIdr: true,
  routeOrigin: { select: { name: true } },
  routeDestination: { select: { name: true } },
  vehicleType: true,
  createdAt: true,
  owner: { select: { isAvailable: true, name: true, role: true, providerProfile: { select: { displayName: true, logoUrl: true } } } },
  category: { select: { title: true } },
} as const satisfies Prisma.ServiceOfferingSelect;

const staffSelect = {
  id: true,
  name: true,
  roleTitle: true,
  languages: true,
  notes: true,
  basePriceIdr: true,
  createdAt: true,
  provider: { select: { isAvailable: true, name: true, providerProfile: { select: { displayName: true, logoUrl: true } } } },
} as const satisfies Prisma.ProviderStaffSelect;

const fleetSelect = {
  id: true,
  vehicleName: true,
  vehicleType: true,
  capacity: true,
  baseLocation: { select: { name: true } },
  notes: true,
  basePriceIdr: true,
  createdAt: true,
  provider: { select: { isAvailable: true, name: true, providerProfile: { select: { displayName: true, logoUrl: true } } } },
} as const satisfies Prisma.ProviderFleetSelect;

type ServicePayload = Prisma.ServiceOfferingGetPayload<{ select: typeof serviceSelect }>;
type StaffPayload = Prisma.ProviderStaffGetPayload<{ select: typeof staffSelect }>;
type FleetPayload = Prisma.ProviderFleetGetPayload<{ select: typeof fleetSelect }>;

type CategoryLookup = Partial<Record<ServiceType, string>>;

export function providerStaffServiceId(id: string): string {
  return `${providerStaffPrefix}${id}`;
}

export function providerFleetServiceId(id: string): string {
  return `${providerFleetPrefix}${id}`;
}

export function parseBookableResourceRef(value: string): BookableResourceRef {
  if (value.startsWith(providerStaffPrefix)) return { kind: "providerStaff", id: value.slice(providerStaffPrefix.length) };
  if (value.startsWith(providerFleetPrefix)) return { kind: "providerFleet", id: value.slice(providerFleetPrefix.length) };
  return { kind: "serviceOffering", id: value };
}

export async function getBookableCatalogRows(query: ServiceSearchQuery): Promise<readonly BookableCatalogRow[]> {
  const prisma = getPrismaClient();
  const categoryLookup = await getCategoryLookup();
  const [services, staff, fleets] = await Promise.all([
    shouldIncludeDirectServices(query.serviceType) ? prisma.serviceOffering.findMany({ where: serviceWhereInput(query), select: serviceSelect }) : Promise.resolve([] as ServicePayload[]),
    shouldIncludeStaff(query.serviceType) ? prisma.providerStaff.findMany({ where: staffWhereInput(query), select: staffSelect }) : Promise.resolve([] as StaffPayload[]),
    shouldIncludeFleet(query.serviceType) ? prisma.providerFleet.findMany({ where: fleetWhereInput(query), select: fleetSelect }) : Promise.resolve([] as FleetPayload[]),
  ]);

  return [...services.map(toDirectCatalogRow), ...staff.map((row) => toStaffCatalogRow(row, categoryLookup)), ...fleets.map((row) => toFleetCatalogRow(row, categoryLookup))]
    .filter((row) => row.categoryTitle !== "")
    .sort((a, b) => compareCatalogRows(a, b, query.sort, query.order));
}

export async function getBookableCatalogRowById(serviceId: string): Promise<BookableCatalogRow | null> {
  const prisma = getPrismaClient();
  const ref = parseBookableResourceRef(serviceId);
  if (ref.kind === "serviceOffering") {
    const service = await prisma.serviceOffering.findFirst({ where: { id: ref.id, isActive: true, type: { not: ServiceType.PROVIDER_MUTHAWIF }, category: { status: "ACTIVE" } }, select: serviceSelect });
    return service ? toDirectCatalogRow(service) : null;
  }

  const categoryLookup = await getCategoryLookup();
  if (ref.kind === "providerStaff") {
    const staff = await prisma.providerStaff.findFirst({ where: { id: ref.id, ...staffBaseWhereInput() }, select: staffSelect });
    return staff ? toStaffCatalogRow(staff, categoryLookup) : null;
  }

  const fleet = await prisma.providerFleet.findFirst({ where: { id: ref.id, ...fleetBaseWhereInput() }, select: fleetSelect });
  return fleet ? toFleetCatalogRow(fleet, categoryLookup) : null;
}

export async function getCategoryLookup(): Promise<CategoryLookup> {
  const prisma = getPrismaClient();
  const categories = await prisma.serviceCategory.findMany({ where: { status: "ACTIVE" }, select: { serviceType: true, title: true } });
  return Object.fromEntries(categories.map((category) => [category.serviceType, category.title])) as CategoryLookup;
}

function serviceWhereInput(query: ServiceSearchQuery): Prisma.ServiceOfferingWhereInput {
  return {
    isActive: true,
    type: serviceTypeFilter(query.serviceType),
    category: { status: "ACTIVE" },
    ...(query.locationId ? { OR: [{ baseLocationId: query.locationId }, { routeOriginId: query.locationId }] } : {}),
    ...(query.q ? { AND: [{ OR: [{ title: { contains: query.q, mode: "insensitive" } }, { description: { contains: query.q, mode: "insensitive" } }, { owner: { name: { contains: query.q, mode: "insensitive" } } }] }] } : {}),
  };
}

function serviceTypeFilter(serviceType: ServiceType | undefined): Prisma.EnumServiceTypeFilter<"ServiceOffering"> {
  if (serviceType) return { equals: serviceType };
  return { not: ServiceType.PROVIDER_MUTHAWIF };
}

function staffWhereInput(query: ServiceSearchQuery): Prisma.ProviderStaffWhereInput {
  return {
    ...staffBaseWhereInput(),
    ...(query.locationId ? { provider: { providerProfile: { baseLocationId: query.locationId } } } : {}),
    ...(query.q ? { AND: [{ OR: [{ name: { contains: query.q, mode: "insensitive" } }, { roleTitle: { contains: query.q, mode: "insensitive" } }, { notes: { contains: query.q, mode: "insensitive" } }, { provider: { name: { contains: query.q, mode: "insensitive" } } }] }] } : {}),
  };
}

function fleetWhereInput(query: ServiceSearchQuery): Prisma.ProviderFleetWhereInput {
  return {
    ...fleetBaseWhereInput(),
    ...(query.locationId ? { baseLocationId: query.locationId } : {}),
    ...(query.q ? { AND: [{ OR: [{ vehicleName: { contains: query.q, mode: "insensitive" } }, { vehicleType: { contains: query.q, mode: "insensitive" } }, { baseLocation: { name: { contains: query.q, mode: "insensitive" } } }, { provider: { name: { contains: query.q, mode: "insensitive" } } }] }] } : {}),
  };
}

function staffBaseWhereInput(): Prisma.ProviderStaffWhereInput {
  return { status: "ACTIVE", provider: { role: UserRole.PROVIDER, isAvailable: true, providerProfile: { is: { verificationStatus: VerificationStatus.APPROVED } } } };
}

function fleetBaseWhereInput(): Prisma.ProviderFleetWhereInput {
  return { status: "AVAILABLE", provider: { role: UserRole.PROVIDER, isAvailable: true, providerProfile: { is: { verificationStatus: VerificationStatus.APPROVED } } } };
}

function shouldIncludeDirectServices(serviceType: ServiceType | undefined): boolean {
  return serviceType !== ServiceType.PROVIDER_MUTHAWIF;
}

function shouldIncludeStaff(serviceType: ServiceType | undefined): boolean {
  return !serviceType || serviceType === ServiceType.MUTHAWIF_PERSONAL || serviceType === ServiceType.PROVIDER_MUTHAWIF;
}

function shouldIncludeFleet(serviceType: ServiceType | undefined): boolean {
  return !serviceType || serviceType === ServiceType.TRANSPORTATION;
}

function toDirectCatalogRow(service: ServicePayload): BookableCatalogRow {
  return {
    id: service.id,
    title: service.title,
    description: service.description,
    type: service.type,
    categoryTitle: service.category?.title ?? "",
    ownerName: service.owner.providerProfile?.displayName ?? service.owner.name,
    ownerLogoUrl: ownerLogoUrl(service.owner.role, service.owner.providerProfile?.logoUrl ?? null),
    source: "direct",
    routeLabel: service.routeOrigin && service.routeDestination ? `${service.routeOrigin.name} → ${service.routeDestination.name}` : null,
    vehicleType: service.vehicleType,
    basePrice: formatCurrency(Number(service.basePriceIdr), "IDR", FALLBACK_RATES),
    basePriceIdr: Number(service.basePriceIdr),
    ownerAvailable: service.owner.isAvailable,
    createdAt: service.createdAt.toISOString(),
  };
}

function toStaffCatalogRow(staff: StaffPayload, categories: CategoryLookup): BookableCatalogRow {
  const descriptionParts = [staff.roleTitle, staff.languages.join(" · "), staff.notes].filter((part): part is string => Boolean(part));
  return {
    id: providerStaffServiceId(staff.id),
    title: staff.name,
    description: descriptionParts.join(". "),
    type: ServiceType.MUTHAWIF_PERSONAL,
    categoryTitle: categories[ServiceType.MUTHAWIF_PERSONAL] ?? "",
    ownerName: staff.provider.providerProfile?.displayName ?? staff.provider.name,
    ownerLogoUrl: providerLogoUrl(staff.provider.providerProfile?.logoUrl ?? null),
    source: "providerStaff",
    routeLabel: null,
    vehicleType: null,
    basePrice: formatCurrency(Number(staff.basePriceIdr), "IDR", FALLBACK_RATES),
    basePriceIdr: Number(staff.basePriceIdr),
    ownerAvailable: staff.provider.isAvailable,
    createdAt: staff.createdAt.toISOString(),
  };
}

function toFleetCatalogRow(fleet: FleetPayload, categories: CategoryLookup): BookableCatalogRow {
  const descriptionParts = [fleet.vehicleType, String(fleet.capacity), fleet.baseLocation?.name, fleet.notes].filter((part): part is string => Boolean(part));
  return {
    id: providerFleetServiceId(fleet.id),
    title: fleet.vehicleName,
    description: descriptionParts.join(" · "),
    type: ServiceType.TRANSPORTATION,
    categoryTitle: categories[ServiceType.TRANSPORTATION] ?? "",
    ownerName: fleet.provider.providerProfile?.displayName ?? fleet.provider.name,
    ownerLogoUrl: providerLogoUrl(fleet.provider.providerProfile?.logoUrl ?? null),
    source: "providerFleet",
    routeLabel: fleet.baseLocation?.name ?? "-",
    vehicleType: fleet.vehicleType,
    basePrice: formatCurrency(Number(fleet.basePriceIdr), "IDR", FALLBACK_RATES),
    basePriceIdr: Number(fleet.basePriceIdr),
    ownerAvailable: fleet.provider.isAvailable,
    createdAt: fleet.createdAt.toISOString(),
  };
}

function ownerLogoUrl(role: UserRole, logoPath: string | null): string {
  if (role === UserRole.PROVIDER) return providerLogoUrl(logoPath);
  return WIF_ME_SERVICE_LOGO;
}

function providerLogoUrl(logoPath: string | null): string {
  return getPublicUrl(logoPath) ?? WIF_ME_SERVICE_LOGO;
}

function compareCatalogRows(a: BookableCatalogRow, b: BookableCatalogRow, sort: ServiceSearchQuery["sort"], order: ServiceSearchQuery["order"]): number {
  const direction = order === "asc" ? 1 : -1;
  if (sort === "price") return (a.basePriceIdr - b.basePriceIdr) * direction;
  if (sort === "title") return a.title.localeCompare(b.title) * direction;
  return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
}
