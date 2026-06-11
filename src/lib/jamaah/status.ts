import { BookingStatus, PaymentStatus } from "@prisma/client";
import type { StatusBadgeVariant } from "@/components/shared/status-badge";

export function bookingStatusVariant(status: BookingStatus): StatusBadgeVariant {
  switch (status) {
    case BookingStatus.CONFIRMED:
    case BookingStatus.IN_PROGRESS:
    case BookingStatus.COMPLETED:
      return "success";
    case BookingStatus.PENDING_PAYMENT:
    case BookingStatus.DRAFT:
      return "warning";
    case BookingStatus.CANCELLED:
      return "danger";
  }
}

export function paymentStatusVariant(status: PaymentStatus): StatusBadgeVariant {
  switch (status) {
    case PaymentStatus.HELD_IN_ESCROW:
    case PaymentStatus.RELEASED:
      return "success";
    case PaymentStatus.PENDING:
      return "warning";
    case PaymentStatus.REFUNDED:
    case PaymentStatus.FAILED:
      return "danger";
  }
}
