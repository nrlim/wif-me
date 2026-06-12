import "server-only";

import { ServiceType, UserRole, VerificationStatus, type CurrencyCode } from "@prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";
import { parseBookableResourceRef } from "@/lib/services/bookable-catalog";

export type ResolvedBookableService = {
  readonly serviceOfferingId: string | null;
  readonly resourceRef: string;
  readonly ownerId: string;
  readonly categoryId: string;
  readonly type: ServiceType;
  readonly title: string;
  readonly description: string;
  readonly basePriceIdr: number;
  readonly baseCurrency: CurrencyCode;
  readonly originalPrice: number | null;
  readonly baseLocationId: string | null;
  readonly routeOriginId: string | null;
  readonly routeDestinationId: string | null;
  readonly vehicleType: string | null;
};

export async function resolveBookableService(serviceId: string): Promise<ResolvedBookableService | null> {
  const prisma = getPrismaClient();
  const ref = parseBookableResourceRef(serviceId);

  if (ref.kind === "serviceOffering") {
    const service = await prisma.serviceOffering.findFirst({
      where: { id: ref.id, isActive: true, type: { not: ServiceType.PROVIDER_MUTHAWIF }, category: { status: "ACTIVE" }, owner: { isAvailable: true } },
      select: { id: true, ownerId: true, categoryId: true, type: true, title: true, description: true, basePriceIdr: true, baseCurrency: true, originalPrice: true, baseLocationId: true, routeOriginId: true, routeDestinationId: true, vehicleType: true },
    });
    if (!service?.categoryId) return null;
    return { ...service, serviceOfferingId: service.id, resourceRef: `service:${service.id}`, categoryId: service.categoryId, basePriceIdr: Number(service.basePriceIdr), originalPrice: service.originalPrice ? Number(service.originalPrice) : null };
  }

  if (ref.kind === "providerStaff") {
    const [category, staff] = await Promise.all([
      prisma.serviceCategory.findFirst({ where: { serviceType: ServiceType.MUTHAWIF_PERSONAL, status: "ACTIVE" }, select: { id: true } }),
      prisma.providerStaff.findFirst({
        where: { id: ref.id, status: "ACTIVE", provider: { role: UserRole.PROVIDER, isAvailable: true, providerProfile: { is: { verificationStatus: VerificationStatus.APPROVED } } } },
        select: { providerId: true, name: true, roleTitle: true, languages: true, notes: true, basePriceIdr: true, baseCurrency: true, originalPrice: true },
      }),
    ]);
    if (!category || !staff) return null;
    const description = [staff.roleTitle, staff.languages.join(" · "), staff.notes].filter((part): part is string => Boolean(part)).join(". ");
    return { serviceOfferingId: null, resourceRef: serviceId, ownerId: staff.providerId, categoryId: category.id, type: ServiceType.MUTHAWIF_PERSONAL, title: staff.name, description, basePriceIdr: Number(staff.basePriceIdr), baseCurrency: staff.baseCurrency, originalPrice: staff.originalPrice ? Number(staff.originalPrice) : null, baseLocationId: null, routeOriginId: null, routeDestinationId: null, vehicleType: null };
  }

  const [category, fleet] = await Promise.all([
    prisma.serviceCategory.findFirst({ where: { serviceType: ServiceType.TRANSPORTATION, status: "ACTIVE" }, select: { id: true } }),
    prisma.providerFleet.findFirst({
      where: { id: ref.id, status: "AVAILABLE", provider: { role: UserRole.PROVIDER, isAvailable: true, providerProfile: { is: { verificationStatus: VerificationStatus.APPROVED } } } },
      select: { providerId: true, vehicleName: true, vehicleType: true, capacity: true, baseLocation: true, baseLocationId: true, notes: true, basePriceIdr: true, baseCurrency: true, originalPrice: true },
    }),
  ]);
  if (!category || !fleet) return null;
  const description = [fleet.vehicleType, String(fleet.capacity), fleet.baseLocation?.name, fleet.notes].filter((part): part is string | undefined => Boolean(part)).join(" · ");
  return { serviceOfferingId: null, resourceRef: serviceId, ownerId: fleet.providerId, categoryId: category.id, type: ServiceType.TRANSPORTATION, title: fleet.vehicleName, description, basePriceIdr: Number(fleet.basePriceIdr), baseCurrency: fleet.baseCurrency, originalPrice: fleet.originalPrice ? Number(fleet.originalPrice) : null, baseLocationId: fleet.baseLocationId, routeOriginId: null, routeDestinationId: null, vehicleType: fleet.vehicleType };
}
