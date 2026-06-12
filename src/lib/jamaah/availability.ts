import "server-only";

import { BookingStatus, Prisma, ServiceType } from "@prisma/client";

const LIMITED_SERVICE_TYPES: readonly ServiceType[] = [ServiceType.MUTHAWIF_PERSONAL, ServiceType.TRANSPORTATION];
const BLOCKING_BOOKING_STATUSES: readonly BookingStatus[] = [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS];

type AvailabilityEntry = {
  readonly serviceOfferingId: string | null;
  readonly resourceRef: string;
  readonly ownerId: string;
  readonly type: ServiceType;
  readonly title: string;
  readonly scheduledStart: string;
};

export type AvailabilityConflict = {
  readonly title: string;
  readonly scheduledDate: string;
};

export async function findBookingAvailabilityConflict(tx: Prisma.TransactionClient, entries: readonly AvailabilityEntry[]): Promise<AvailabilityConflict | null> {
  const duplicate = findDuplicateLimitedEntry(entries);
  if (duplicate) return duplicate;

  for (const entry of entries) {
    if (!isLimitedServiceType(entry.type)) continue;

    const range = getUtcDayRange(entry.scheduledStart);
    const booking = await tx.booking.findFirst({
      where: {
        status: { in: [...BLOCKING_BOOKING_STATUSES] },
        scheduledStart: { gte: range.start, lt: range.end },
        OR: buildResourceBookingWhere(entry),
      },
      select: { id: true },
    });

    if (booking) return { title: entry.title, scheduledDate: entry.scheduledStart };
  }

  return null;
}

function findDuplicateLimitedEntry(entries: readonly AvailabilityEntry[]): AvailabilityConflict | null {
  const seen = new Map<string, AvailabilityEntry>();

  for (const entry of entries) {
    if (!isLimitedServiceType(entry.type)) continue;

    const key = `${entry.resourceRef}:${entry.scheduledStart}`;
    const previous = seen.get(key);
    if (previous) return { title: entry.title, scheduledDate: entry.scheduledStart };
    seen.set(key, entry);
  }

  return null;
}

function buildResourceBookingWhere(entry: AvailabilityEntry): Prisma.BookingWhereInput[] {
  const where: Prisma.BookingWhereInput[] = [{ serviceOffering: { bookableResourceRef: entry.resourceRef } }];

  if (entry.serviceOfferingId) {
    where.push({ serviceOfferingId: entry.serviceOfferingId });
  } else {
    where.push({ serviceOffering: { ownerId: entry.ownerId, type: entry.type, title: entry.title } });
  }

  return where;
}

function isLimitedServiceType(type: ServiceType): boolean {
  return LIMITED_SERVICE_TYPES.includes(type);
}

function getUtcDayRange(dateValue: string): { readonly start: Date; readonly end: Date } {
  const start = new Date(`${dateValue}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}
