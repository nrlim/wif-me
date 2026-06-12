import "server-only";

import { BookingStatus, PaymentStatus, Prisma, ServiceType } from "@prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/currency/formatters";
import { FALLBACK_RATES } from "@/lib/currency/rates";
import { getBookableCatalogRowById, getBookableCatalogRows, type CatalogSource } from "@/lib/services/bookable-catalog";
import type { BookingListQuery, PaymentListQuery, ServiceSearchQuery } from "@/lib/validators/jamaah";

export type PaginatedResult<T> = {
  readonly rows: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly perPage: number;
  readonly pageCount: number;
};

export type JamaahServiceRow = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: ServiceType;
  readonly categoryTitle: string;
  readonly ownerName: string;
  readonly ownerLogoUrl: string;
  readonly source: CatalogSource;
  readonly routeLabel: string | null;
  readonly basePrice: string;
  readonly basePriceIdr: number;
  readonly ownerAvailable: boolean;
};

export type JamaahBookingRow = {
  readonly id: string;
  readonly serviceTitle: string;
  readonly providerName: string;
  readonly status: BookingStatus;
  readonly scheduledStart: string;
  readonly totalPrice: string;
  readonly paymentId: string | null;
  readonly paymentStatus: PaymentStatus | null;
};

export type JamaahPaymentRow = {
  readonly id: string;
  readonly orderId: string;
  readonly reference: string;
  readonly orderTitle: string;
  readonly status: PaymentStatus;
  readonly amount: string;
  readonly createdAt: string;
  readonly proofUrl: string | null;
  readonly proofFileName: string | null;
  readonly proofMimeType: string | null;
  readonly proofUploadedAt: string | null;
  readonly proofRejectedAt: string | null;
  readonly proofReviewNote: string | null;
};

export type JamaahProfile = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly preferredCurrency: string;
  readonly createdAt: string;
  readonly emailVerified: boolean;
};

export async function getJamaahProfile(userId: string): Promise<JamaahProfile | null> {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, preferredCurrency: true, createdAt: true, emailVerified: true },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    preferredCurrency: user.preferredCurrency,
    createdAt: user.createdAt.toISOString(),
    emailVerified: user.emailVerified,
  };
}

export async function getJamaahOverview(userId: string): Promise<{
  readonly activeBookings: number;
  readonly pendingPayments: number;
  readonly escrowPayments: number;
  readonly upcoming: JamaahBookingRow | null;
}> {
  const prisma = getPrismaClient();
  const [activeBookings, pendingPayments, escrowPayments, upcoming] = await Promise.all([
    prisma.booking.count({ where: { customerId: userId, status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] } } }),
    prisma.payment.count({ where: { order: { customerId: userId }, status: PaymentStatus.PENDING } }),
    prisma.payment.count({ where: { order: { customerId: userId }, status: PaymentStatus.HELD_IN_ESCROW } }),
    prisma.booking.findFirst({
      where: { customerId: userId, status: { in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] } },
      include: { serviceOffering: { include: { owner: { include: { providerProfile: true } } } }, order: { include: { payment: true } } },
      orderBy: { scheduledStart: "asc" },
    }),
  ]);

  return { activeBookings, pendingPayments, escrowPayments, upcoming: upcoming ? toBookingRow(upcoming) : null };
}

export async function searchJamaahServices(query: ServiceSearchQuery): Promise<PaginatedResult<JamaahServiceRow>> {
  const rows = await getBookableCatalogRows(query);
  const offset = (query.page - 1) * query.perPage;
  return toPaginatedResult(rows.slice(offset, offset + query.perPage), rows.length, query.page, query.perPage);
}

export async function getServiceForCheckout(serviceId: string): Promise<JamaahServiceRow | null> {
  return getBookableCatalogRowById(serviceId);
}

export async function getJamaahBookings(userId: string, query: BookingListQuery): Promise<PaginatedResult<JamaahBookingRow>> {
  const prisma = getPrismaClient();
  const where: Prisma.BookingWhereInput = {
    customerId: userId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.q ? { serviceOffering: { title: { contains: query.q, mode: "insensitive" } } } : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({ where, include: { serviceOffering: { include: { owner: { include: { providerProfile: true } } } }, order: { include: { payment: true } } }, orderBy: bookingOrderBy(query.sort, query.order), skip: (query.page - 1) * query.perPage, take: query.perPage }),
  ]);

  return toPaginatedResult(rows.map(toBookingRow), total, query.page, query.perPage);
}

export async function getJamaahPayments(userId: string, query: PaymentListQuery): Promise<PaginatedResult<JamaahPaymentRow>> {
  const prisma = getPrismaClient();
  const where: Prisma.PaymentWhereInput = {
    order: { customerId: userId, ...(query.q ? { bookings: { some: { serviceOffering: { title: { contains: query.q, mode: "insensitive" } } } } } : {}) },
    ...(query.status ? { status: query.status } : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({ where, include: { order: { include: { bookings: { include: { serviceOffering: true } } } } }, orderBy: paymentOrderBy(query.sort, query.order), skip: (query.page - 1) * query.perPage, take: query.perPage }),
  ]);

  return toPaginatedResult(rows.map(toPaymentRow), total, query.page, query.perPage);
}

export async function getJamaahPaymentDetail(userId: string, paymentId: string): Promise<JamaahPaymentRow | null> {
  const prisma = getPrismaClient();
  const payment = await prisma.payment.findFirst({ where: { id: paymentId, order: { customerId: userId } }, include: { order: { include: { bookings: { include: { serviceOffering: true } } } } } });
  return payment ? toPaymentRow(payment) : null;
}

function bookingOrderBy(sort: BookingListQuery["sort"], order: BookingListQuery["order"]): Prisma.BookingOrderByWithRelationInput {
  if (sort === "schedule") return { scheduledStart: order };
  if (sort === "price") return { totalPriceIdr: order };
  return { createdAt: order };
}

function paymentOrderBy(sort: PaymentListQuery["sort"], order: PaymentListQuery["order"]): Prisma.PaymentOrderByWithRelationInput {
  if (sort === "amount") return { amountIdr: order };
  return { createdAt: order };
}

function toBookingRow(row: Prisma.BookingGetPayload<{ include: { serviceOffering: { include: { owner: { include: { providerProfile: true } } } }; order: { include: { payment: true } } } }>): JamaahBookingRow {
  return {
    id: row.id,
    serviceTitle: row.serviceOffering.title,
    providerName: row.serviceOffering.owner.providerProfile?.displayName ?? row.serviceOffering.owner.name,
    status: row.status,
    scheduledStart: row.scheduledStart.toISOString(),
    totalPrice: formatCurrency(Number(row.totalPriceIdr), "IDR", FALLBACK_RATES),
    paymentId: row.order?.payment?.id ?? null,
    paymentStatus: row.order?.payment?.status ?? null,
  };
}

function toPaymentRow(row: Prisma.PaymentGetPayload<{ include: { order: { include: { bookings: { include: { serviceOffering: true } } } } } }>): JamaahPaymentRow {
  const bookingsCount = row.order.bookings.length;
  const title = bookingsCount === 1 
    ? row.order.bookings[0].serviceOffering.title 
    : `${bookingsCount} Layanan (${row.order.bookings[0].serviceOffering.title} & lainnya)`;

  return {
    id: row.id,
    orderId: row.orderId,
    reference: row.gatewayReference ?? row.id.slice(0, 8).toUpperCase(),
    orderTitle: title,
    status: row.status,
    amount: formatCurrency(Number(row.amountIdr), "IDR", FALLBACK_RATES),
    createdAt: row.createdAt.toISOString(),
    proofUrl: row.proofUrl,
    proofFileName: row.proofFileName,
    proofMimeType: row.proofMimeType,
    proofUploadedAt: row.proofUploadedAt?.toISOString() ?? null,
    proofRejectedAt: row.proofRejectedAt?.toISOString() ?? null,
    proofReviewNote: row.proofReviewNote,
  };
}

function toPaginatedResult<T>(rows: readonly T[], total: number, page: number, perPage: number): PaginatedResult<T> {
  return { rows, total, page, perPage, pageCount: Math.max(1, Math.ceil(total / perPage)) };
}
