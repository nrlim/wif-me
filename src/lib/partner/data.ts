import "server-only";

import { BookingStatus, PaymentStatus, Prisma, ServiceType, UserRole, VerificationStatus, WithdrawalStatus } from "@prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/currency/formatters";
import { FALLBACK_RATES } from "@/lib/currency/rates";

export type PartnerDashboard = {
  readonly displayName: string;
  readonly verificationStatus: VerificationStatus;
  readonly isAvailable: boolean;
  readonly serviceCount: number;
  readonly activeBookings: number;
  readonly escrowAmount: string;
  readonly releasedAmount: string;
  readonly upcoming: readonly PartnerBookingRow[];
};

export type PartnerBookingRow = {
  readonly id: string;
  readonly customerName: string;
  readonly serviceTitle: string;
  readonly status: BookingStatus;
  readonly paymentStatus: PaymentStatus | null;
  readonly amount: string;
  readonly scheduledStart: string;
};

export type PartnerServiceRow = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: ServiceType;
  readonly basePrice: string;
  readonly routeLabel: string | null;
  readonly isActive: boolean;
  readonly bookingCount: number;
};

export type PartnerEarningRow = {
  readonly id: string;
  readonly reference: string;
  readonly serviceTitle: string;
  readonly customerName: string;
  readonly amount: string;
  readonly status: PaymentStatus;
  readonly createdAt: string;
};

export type MuthawifProfile = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly displayName: string;
  readonly bio: string;
  readonly baseCity: string;
  readonly languages: readonly string[];
  readonly createdAt: string;
  readonly emailVerified: boolean;
  readonly isAvailable: boolean;
  readonly verificationStatus: VerificationStatus;
};

export type ProviderProfile = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly displayName: string;
  readonly companyName: string;
  readonly companyType: string;
  readonly registrationNumber: string;
  readonly taxId: string;
  readonly whatsapp: string;
  readonly website: string;
  readonly address: string;
  readonly baseCity: string;
  readonly baseLocationId: string | null;
  readonly country: string;
  readonly languages: readonly string[];
  readonly bio: string;
  readonly emailVerified: boolean;
  readonly verificationStatus: VerificationStatus;
};

const bookingInclude = {
  customer: true,
  serviceOffering: true,
  order: { include: { payment: true } },
} as const satisfies Prisma.BookingInclude;

const serviceInclude = {
  bookings: true,
  routeOrigin: true,
  routeDestination: true,
} as const satisfies Prisma.ServiceOfferingInclude;

const earningInclude = {
  order: { include: { bookings: { include: { customer: true, serviceOffering: true } } } },
} as const satisfies Prisma.PaymentInclude;

export async function getMuthawifProfile(userId: string): Promise<MuthawifProfile | null> {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { providerProfile: { include: { baseLocation: true } } },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    displayName: user.providerProfile?.displayName ?? user.name,
    bio: user.providerProfile?.bio ?? "",
    baseCity: user.providerProfile?.baseLocation?.name ?? "",
    languages: user.providerProfile?.languages ?? [],
    createdAt: user.createdAt.toISOString(),
    emailVerified: user.emailVerified,
    isAvailable: user.isAvailable,
    verificationStatus: user.providerProfile?.verificationStatus ?? VerificationStatus.DRAFT,
  };
}

export async function getProviderProfile(userId: string): Promise<ProviderProfile | null> {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { providerProfile: { include: { baseLocation: true } } },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.providerProfile?.phone ?? user.phone ?? "",
    displayName: user.providerProfile?.displayName ?? user.name,
    companyName: user.providerProfile?.companyName ?? user.name,
    companyType: user.providerProfile?.companyType ?? "provider",
    registrationNumber: user.providerProfile?.registrationNumber ?? "",
    taxId: user.providerProfile?.taxId ?? "",
    whatsapp: user.providerProfile?.whatsapp ?? "",
    website: user.providerProfile?.website ?? "",
    address: user.providerProfile?.address ?? "",
    baseCity: user.providerProfile?.baseLocation?.name ?? "",
    baseLocationId: user.providerProfile?.baseLocationId ?? null,
    country: user.providerProfile?.country ?? "ID",
    languages: user.providerProfile?.languages ?? [],
    bio: user.providerProfile?.bio ?? "",
    emailVerified: user.emailVerified,
    verificationStatus: user.providerProfile?.verificationStatus ?? VerificationStatus.DRAFT,
  };
}

export async function getPartnerDashboard(userId: string): Promise<PartnerDashboard> {
  const prisma = getPrismaClient();
  const [user, serviceCount, activeBookings, escrow, released, upcoming] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { providerProfile: true } }),
    prisma.serviceOffering.count({ where: { ownerId: userId } }),
    prisma.booking.count({ where: { serviceOffering: { ownerId: userId }, status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] } } }),
    prisma.payment.aggregate({ _sum: { amountIdr: true }, where: { status: PaymentStatus.HELD_IN_ESCROW, order: { bookings: { some: { serviceOffering: { ownerId: userId } } } } } }),
    prisma.payment.aggregate({ _sum: { amountIdr: true }, where: { status: PaymentStatus.RELEASED, order: { bookings: { some: { serviceOffering: { ownerId: userId } } } } } }),
    prisma.booking.findMany({
      where: { serviceOffering: { ownerId: userId }, status: { in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] } },
      include: bookingInclude,
      orderBy: { scheduledStart: "asc" },
      take: 4,
    }),
  ]);

  return {
    displayName: user?.providerProfile?.displayName ?? user?.name ?? "-",
    verificationStatus: user?.providerProfile?.verificationStatus ?? VerificationStatus.DRAFT,
    isAvailable: user?.isAvailable ?? false,
    serviceCount,
    activeBookings,
    escrowAmount: formatCurrency(Number(escrow._sum.amountIdr ?? 0), "IDR", FALLBACK_RATES),
    releasedAmount: formatCurrency(Number(released._sum.amountIdr ?? 0), "IDR", FALLBACK_RATES),
    upcoming: upcoming.map(toBookingRow),
  };
}

export async function getPartnerBookings(userId: string): Promise<readonly PartnerBookingRow[]> {
  const prisma = getPrismaClient();
  const rows = await prisma.booking.findMany({
    where: { serviceOffering: { ownerId: userId } },
    include: bookingInclude,
    orderBy: { scheduledStart: "desc" },
    take: 50,
  });

  return rows.map(toBookingRow);
}

export async function getPartnerServices(userId: string, types?: readonly ServiceType[]): Promise<readonly PartnerServiceRow[]> {
  const prisma = getPrismaClient();
  const rows = await prisma.serviceOffering.findMany({
    where: { ownerId: userId, ...(types ? { type: { in: [...types] } } : {}) },
    include: serviceInclude,
    orderBy: { createdAt: "desc" },
  });

  return rows.map(toServiceRow);
}

export async function getPartnerEarnings(userId: string): Promise<readonly PartnerEarningRow[]> {
  const prisma = getPrismaClient();
  const rows = await prisma.payment.findMany({
    where: { order: { bookings: { some: { serviceOffering: { ownerId: userId } } } } },
    include: earningInclude,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return rows.map(toEarningRow);
}

export function assertPartnerRole(role: UserRole, expected: "muthawif" | "provider"): boolean {
  return expected === "muthawif" ? role === UserRole.MUTHAWIF : role === UserRole.PROVIDER;
}

function toBookingRow(row: Prisma.BookingGetPayload<{ include: typeof bookingInclude }>): PartnerBookingRow {
  return {
    id: row.id,
    customerName: row.customer.name,
    serviceTitle: row.serviceOffering.title,
    status: row.status,
    paymentStatus: row.order?.payment?.status ?? null,
    amount: formatCurrency(Number(row.totalPriceIdr), "IDR", FALLBACK_RATES),
    scheduledStart: row.scheduledStart.toISOString(),
  };
}

function toServiceRow(row: Prisma.ServiceOfferingGetPayload<{ include: typeof serviceInclude }>): PartnerServiceRow {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    basePrice: formatCurrency(Number(row.basePriceIdr), "IDR", FALLBACK_RATES),
    routeLabel: row.routeOrigin && row.routeDestination ? `${row.routeOrigin.name} → ${row.routeDestination.name}` : null,
    isActive: row.isActive,
    bookingCount: row.bookings.length,
  };
}

function toEarningRow(row: Prisma.PaymentGetPayload<{ include: typeof earningInclude }>): PartnerEarningRow {
  const serviceTitle = row.order.bookings.length === 1 
    ? row.order.bookings[0].serviceOffering.title 
    : `${row.order.bookings.length} Layanan (${row.order.bookings[0]?.serviceOffering.title} & lainnya)`;

  return {
    id: row.id,
    reference: row.gatewayReference ?? row.id.slice(0, 8).toUpperCase(),
    serviceTitle,
    customerName: row.order.bookings[0]?.customer.name ?? "-",
    amount: formatCurrency(Number(row.amountIdr), "IDR", FALLBACK_RATES),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export { BookingStatus, PaymentStatus, ServiceType, VerificationStatus, WithdrawalStatus };
