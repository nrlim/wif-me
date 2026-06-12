import "server-only";

import { ServiceType, UserRole, VerificationStatus } from "@prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";

export type AdminPartnerReviewType = "personal" | "provider";

export type AdminPartnerReviewDetail = {
  readonly userId: string;
  readonly type: AdminPartnerReviewType;
  readonly name: string;
  readonly companyName: string | null;
  readonly companyType: string | null;
  readonly email: string;
  readonly phone: string | null;
  readonly whatsapp: string | null;
  readonly website: string | null;
  readonly address: string | null;
  readonly registrationNumber: string | null;
  readonly taxId: string | null;
  readonly logoUrl: string | null;
  readonly baseLocationName: string | null;
  readonly languages: readonly string[];
  readonly serviceTypes: readonly ServiceType[];
  readonly verificationStatus: VerificationStatus;
  readonly rejectionReason: string | null;
  readonly submittedAt: Date | null;
  readonly verifiedAt: Date | null;
  readonly isAvailable: boolean;
  readonly serviceCount: number;
  readonly bookingCount: number;
  readonly staffCount: number;
  readonly fleetCount: number;
};

export async function getAdminPartnerReviewDetail(id: string, type: AdminPartnerReviewType): Promise<AdminPartnerReviewDetail | null> {
  const prisma = getPrismaClient();
  const role = type === "personal" ? UserRole.MUTHAWIF : UserRole.PROVIDER;
  const user = await prisma.user.findFirst({
    where: { id, role },
    include: {
      providerProfile: { include: { baseLocation: true } },
      offeredServices: { include: { bookings: true } },
      providerStaff: { select: { id: true } },
      providerFleets: { select: { id: true } },
    },
  });

  if (!user) return null;

  const profile = user.providerProfile;
  const bookingCount = user.offeredServices.reduce((total, service) => total + service.bookings.length, 0);

  return {
    userId: user.id,
    type,
    name: profile?.displayName ?? user.name,
    companyName: profile?.companyName ?? null,
    companyType: profile?.companyType ?? null,
    email: user.email,
    phone: profile?.phone ?? user.phone,
    whatsapp: profile?.whatsapp ?? null,
    website: profile?.website ?? null,
    address: profile?.address ?? null,
    registrationNumber: profile?.registrationNumber ?? null,
    taxId: profile?.taxId ?? null,
    logoUrl: profile?.logoUrl ?? null,
    baseLocationName: profile?.baseLocation?.name ?? null,
    languages: profile?.languages ?? [],
    serviceTypes: profile?.serviceTypes ?? user.offeredServices.map((service) => service.type),
    verificationStatus: profile?.verificationStatus ?? VerificationStatus.DRAFT,
    rejectionReason: profile?.rejectionReason ?? null,
    submittedAt: profile?.submittedAt ?? null,
    verifiedAt: profile?.verifiedAt ?? null,
    isAvailable: user.isAvailable,
    serviceCount: user.offeredServices.length,
    bookingCount,
    staffCount: user.providerStaff.length,
    fleetCount: user.providerFleets.length,
  };
}
