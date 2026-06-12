import "server-only";

import { PaymentStatus, Prisma, WithdrawalStatus } from "@prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/currency/formatters";
import { FALLBACK_RATES } from "@/lib/currency/rates";
import { decryptSensitiveValue } from "@/lib/security/encryption";

export type PartnerWithdrawalRow = {
  readonly id: string;
  readonly amount: string;
  readonly amountIdr: number;
  readonly status: WithdrawalStatus;
  readonly bankName: string;
  readonly accountName: string;
  readonly accountLast4: string;
  readonly requestedNote: string | null;
  readonly reviewNote: string | null;
  readonly createdAt: string;
};

export type PartnerWithdrawalSummary = {
  readonly availableIdr: number;
  readonly available: string;
  readonly released: string;
  readonly inReview: string;
  readonly paid: string;
};

export async function getPartnerWithdrawalData(userId: string): Promise<{ readonly summary: PartnerWithdrawalSummary; readonly rows: readonly PartnerWithdrawalRow[] }> {
  const prisma = getPrismaClient();
  const [released, reserved, inReview, paid, rows] = await Promise.all([
    prisma.payment.aggregate({ _sum: { amountIdr: true }, where: { status: PaymentStatus.RELEASED, order: { bookings: { some: { serviceOffering: { ownerId: userId } } } } } }),
    prisma.withdrawalRequest.aggregate({ _sum: { amountIdr: true }, where: { providerId: userId, status: { not: WithdrawalStatus.REJECTED } } }),
    prisma.withdrawalRequest.aggregate({ _sum: { amountIdr: true }, where: { providerId: userId, status: { in: [WithdrawalStatus.REVIEW, WithdrawalStatus.APPROVED] } } }),
    prisma.withdrawalRequest.aggregate({ _sum: { amountIdr: true }, where: { providerId: userId, status: WithdrawalStatus.PAID } }),
    prisma.withdrawalRequest.findMany({ where: { providerId: userId }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  const releasedIdr = toNumber(released._sum.amountIdr);
  const reservedIdr = toNumber(reserved._sum.amountIdr);
  const availableIdr = Math.max(0, releasedIdr - reservedIdr);

  return {
  summary: {
    availableIdr,
    available: formatIdr(availableIdr),
    released: formatIdr(releasedIdr),
    inReview: formatIdr(inReview._sum.amountIdr),
    paid: formatIdr(paid._sum.amountIdr),
  },
  rows: rows.map(toPartnerWithdrawalRow),
};
}

export function getWithdrawalAccountNumber(row: { readonly bankAccountEncrypted: string | null; readonly bankAccountIv: string | null; readonly bankAccountTag: string | null }): string | null {
  if (!row.bankAccountEncrypted || !row.bankAccountIv || !row.bankAccountTag) return null;
  return decryptSensitiveValue({ encrypted: row.bankAccountEncrypted, iv: row.bankAccountIv, tag: row.bankAccountTag });
}

function toPartnerWithdrawalRow(row: Prisma.WithdrawalRequestGetPayload<object>): PartnerWithdrawalRow {
  return {
    id: row.id,
    amount: formatIdr(row.amountIdr),
    amountIdr: toNumber(row.amountIdr),
    status: row.status,
    bankName: row.bankName ?? "-",
    accountName: row.bankAccountName ?? "-",
    accountLast4: row.bankAccountLast4 ?? "-",
    requestedNote: row.requestedNote,
    reviewNote: row.reviewNote,
    createdAt: row.createdAt.toISOString(),
  };
}

function formatIdr(value: Prisma.Decimal | number | null | undefined): string {
  return formatCurrency(toNumber(value), "IDR", FALLBACK_RATES);
}

function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  return Number(value ?? 0);
}
