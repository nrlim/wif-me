import { PaymentStatus, ServiceType, VerificationStatus, WithdrawalStatus } from "@prisma/client";

export function serviceTypeToKey(type: ServiceType | "MULTIPLE"): "muthawifPersonal" | "providerMuthawif" | "transportation" | "visaProcessing" | "additionalServices" | "multiple" {
  switch (type) {
    case ServiceType.MUTHAWIF_PERSONAL: return "muthawifPersonal";
    case ServiceType.PROVIDER_MUTHAWIF: return "providerMuthawif";
    case ServiceType.TRANSPORTATION: return "transportation";
    case ServiceType.VISA_PROCESSING: return "visaProcessing";
    case ServiceType.ADDITIONAL_SERVICE: return "additionalServices";
    case "MULTIPLE": return "multiple";
    default: return "multiple";
  }
}

export function paymentStatusToTransactionKey(status: PaymentStatus): "paid" | "escrow" | "completed" | "refunded" {
  switch (status) {
    case PaymentStatus.PENDING: return "paid";
    case PaymentStatus.HELD_IN_ESCROW: return "escrow";
    case PaymentStatus.RELEASED: return "completed";
    case PaymentStatus.REFUNDED: return "refunded";
    case PaymentStatus.FAILED: return "refunded";
  }
}

export function paymentStatusToEscrowKey(status: PaymentStatus): "held" | "releaseReview" | "released" {
  switch (status) {
    case PaymentStatus.HELD_IN_ESCROW: return "held";
    case PaymentStatus.RELEASED: return "released";
    default: return "releaseReview";
  }
}

export function verificationStatusToPartnerKey(status: VerificationStatus): "verified" | "review" | "paused" {
  switch (status) {
    case VerificationStatus.APPROVED: return "verified";
    case VerificationStatus.PENDING: return "review";
    default: return "paused";
  }
}

export function withdrawalStatusToKey(status: WithdrawalStatus): "review" | "approved" | "paid" | "rejected" {
  switch (status) {
    case WithdrawalStatus.REVIEW: return "review";
    case WithdrawalStatus.APPROVED: return "approved";
    case WithdrawalStatus.PAID: return "paid";
    case WithdrawalStatus.REJECTED: return "rejected";
  }
}
