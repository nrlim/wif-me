import "server-only";

import { Prisma, WithdrawalStatus } from "@prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";
import { formatIdr } from "@/lib/admin/data";
import { getWithdrawalAccountNumber } from "@/lib/partner/withdrawals";

export type AdminWithdrawalRow = {
  readonly id: string;
  readonly partnerName: string;
  readonly partnerEmail: string;
  readonly amount: string;
  readonly status: WithdrawalStatus;
  readonly bankName: string;
  readonly accountName: string;
  readonly accountLast4: string;
  readonly createdAt: string;
};

export type AdminWithdrawalDetail = AdminWithdrawalRow & {
  readonly accountNumber: string | null;
  readonly requestedNote: string | null;
  readonly reviewNote: string | null;
  readonly reviewedAt: string | null;
  readonly paidAt: string | null;
};

type WithdrawalPayload = Prisma.WithdrawalRequestGetPayload<{ include: { provider: { include: { providerProfile: true } } } }>;

export type AdminWithdrawalQuery = {
  readonly q?: string;
  readonly status?: string;
  readonly sort?: string;
};

export async function getAdminWithdrawals(query: AdminWithdrawalQuery = {}): Promise<readonly AdminWithdrawalRow[]> {
  const prisma = getPrismaClient();
  const status = parseStatus(query.status);
  const keyword = query.q?.trim();
  const where: Prisma.WithdrawalRequestWhereInput = {
    ...(status ? { status } : {}),
    ...(keyword ? { OR: [
      { provider: { name: { contains: keyword, mode: "insensitive" } } },
      { provider: { email: { contains: keyword, mode: "insensitive" } } },
      { provider: { providerProfile: { displayName: { contains: keyword, mode: "insensitive" } } } },
      { bankName: { contains: keyword, mode: "insensitive" } },
    ] } : {}),
  };
  const rows = await prisma.withdrawalRequest.findMany({ where, include: { provider: { include: { providerProfile: true } } }, orderBy: query.sort === "amount" ? { amountIdr: "desc" } : { createdAt: "desc" }, take: 50 });
  return rows.map(toAdminWithdrawalRow);
}

export async function getAdminWithdrawalDetail(id: string): Promise<AdminWithdrawalDetail | null> {
  const prisma = getPrismaClient();
  const row = await prisma.withdrawalRequest.findUnique({ where: { id }, include: { provider: { include: { providerProfile: true } } } });
  if (!row) return null;
  return { ...toAdminWithdrawalRow(row), accountNumber: getWithdrawalAccountNumber(row), requestedNote: row.requestedNote, reviewNote: row.reviewNote, reviewedAt: row.reviewedAt?.toISOString() ?? null, paidAt: row.paidAt?.toISOString() ?? null };
}

function parseStatus(status: string | undefined): WithdrawalStatus | undefined {
  if (!status) return undefined;
  const upper = status.toUpperCase();
  if (upper === WithdrawalStatus.REVIEW || upper === WithdrawalStatus.APPROVED || upper === WithdrawalStatus.PAID || upper === WithdrawalStatus.REJECTED) return upper;
  return undefined;
}

function toAdminWithdrawalRow(row: WithdrawalPayload): AdminWithdrawalRow {
  return {
    id: row.id,
    partnerName: row.provider.providerProfile?.displayName ?? row.provider.name,
    partnerEmail: row.provider.email,
    amount: formatIdr(row.amountIdr),
    status: row.status,
    bankName: row.bankName ?? "-",
    accountName: row.bankAccountName ?? "-",
    accountLast4: row.bankAccountLast4 ?? "-",
    createdAt: row.createdAt.toISOString(),
  };
}
