import "server-only";

import { type BookingStatus, type PaymentStatus, type Prisma, type ServiceType } from "@prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";
import { formatIdr } from "@/lib/admin/data";

export type AdminTransactionItem = {
  readonly bookingId: string;
  readonly serviceTitle: string;
  readonly serviceType: ServiceType;
  readonly categoryTitle: string | null;
  readonly providerName: string;
  readonly scheduledStart: string;
  readonly bookingStatus: BookingStatus;
  readonly totalPrice: string;
  readonly routeLabel: string | null;
  readonly locationLabel: string | null;
  readonly vehicleType: string | null;
  readonly notes: string | null;
};

export type AdminTransactionDetail = {
  readonly id: string;
  readonly paymentId: string;
  readonly orderId: string;
  readonly customerName: string;
  readonly customerEmail: string;
  readonly amount: string;
  readonly status: PaymentStatus;
  readonly proofUrl: string | null;
  readonly proofFileName: string | null;
  readonly proofMimeType: string | null;
  readonly proofUploadedAt: string | null;
  readonly proofRejectedAt: string | null;
  readonly proofReviewNote: string | null;
  readonly items: readonly AdminTransactionItem[];
};

type PaymentDetailPayload = Prisma.PaymentGetPayload<{
  include: {
    order: {
      include: {
        customer: true;
        bookings: {
          include: {
            serviceOffering: {
              include: {
                category: true;
                owner: { include: { providerProfile: true } };
                baseLocation: true;
                routeOrigin: true;
                routeDestination: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export async function getAdminTransactionDetail(reference: string): Promise<AdminTransactionDetail | null> {
  const prisma = getPrismaClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(reference);

  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        ...(isUuid ? [{ id: reference }, { orderId: reference }] : []),
        { gatewayReference: reference },
      ],
    },
    include: {
      order: {
        include: {
          customer: true,
          bookings: {
            include: {
              serviceOffering: {
                include: {
                  category: true,
                  owner: { include: { providerProfile: true } },
                  baseLocation: true,
                  routeOrigin: true,
                  routeDestination: true,
                },
              },
            },
            orderBy: { scheduledStart: "asc" },
          },
        },
      },
    },
  });

  return payment ? toAdminTransactionDetail(payment) : null;
}

function toAdminTransactionDetail(payment: PaymentDetailPayload): AdminTransactionDetail {
  return {
    id: payment.gatewayReference ?? payment.id,
    paymentId: payment.id,
    orderId: payment.orderId,
    customerName: payment.order.customer.name,
    customerEmail: payment.order.customer.email,
    amount: formatIdr(payment.amountIdr),
    status: payment.status,
    proofUrl: payment.proofUrl,
    proofFileName: payment.proofFileName,
    proofMimeType: payment.proofMimeType,
    proofUploadedAt: payment.proofUploadedAt?.toISOString() ?? null,
    proofRejectedAt: payment.proofRejectedAt?.toISOString() ?? null,
    proofReviewNote: payment.proofReviewNote,
    items: payment.order.bookings.map((booking) => {
      const service = booking.serviceOffering;
      return {
        bookingId: booking.id,
        serviceTitle: service.title,
        serviceType: service.type,
        categoryTitle: service.category?.title ?? null,
        providerName: service.owner.providerProfile?.displayName ?? service.owner.name,
        scheduledStart: booking.scheduledStart.toISOString(),
        bookingStatus: booking.status,
        totalPrice: formatIdr(booking.totalPriceIdr),
        routeLabel: service.routeOrigin && service.routeDestination ? `${service.routeOrigin.name} → ${service.routeDestination.name}` : null,
        locationLabel: service.baseLocation?.name ?? null,
        vehicleType: service.vehicleType,
        notes: booking.notes,
      };
    }),
  };
}
