"use server";

import { UserRole, WithdrawalStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "@/i18n/routing";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getPrismaClient } from "@/lib/db/prisma";
import { withdrawalReviewSchema } from "@/lib/validators/withdrawals";

function readLocale(formData: FormData): string {
  const value = formData.get("locale");
  return typeof value === "string" && value.length > 0 ? value : "id";
}

export async function approveWithdrawalAction(formData: FormData): Promise<never> {
  return updateWithdrawalStatus(formData, WithdrawalStatus.APPROVED, "approved");
}

export async function markWithdrawalPaidAction(formData: FormData): Promise<never> {
  return updateWithdrawalStatus(formData, WithdrawalStatus.PAID, "paid");
}

export async function rejectWithdrawalAction(formData: FormData): Promise<never> {
  return updateWithdrawalStatus(formData, WithdrawalStatus.REJECTED, "rejected");
}

async function updateWithdrawalStatus(formData: FormData, status: WithdrawalStatus, notice: string): Promise<never> {
  await assertTrustedOrigin();
  await requireRoleSession([UserRole.ADMIN]);
  const locale = readLocale(formData);
  const parsed = withdrawalReviewSchema.safeParse({ withdrawalId: formData.get("withdrawalId"), reviewNote: formData.get("reviewNote") });

  if (!parsed.success) return redirect({ href: "/admin/escrow/withdrawals?notice=invalid", locale });
  if (status === WithdrawalStatus.REJECTED && !parsed.data.reviewNote) return redirect({ href: `/admin/escrow/withdrawals/${parsed.data.withdrawalId}/review?notice=note-required`, locale });

  const prisma = getPrismaClient();
  const current = await prisma.withdrawalRequest.findUnique({ where: { id: parsed.data.withdrawalId }, select: { status: true } });
  if (!current || !canMoveToStatus(current.status, status)) {
    return redirect({ href: `/admin/escrow/withdrawals/${parsed.data.withdrawalId}/review?notice=invalid`, locale });
  }

  await prisma.withdrawalRequest.update({
    where: { id: parsed.data.withdrawalId },
    data: {
      status,
      reviewNote: parsed.data.reviewNote || undefined,
      reviewedAt: status === WithdrawalStatus.APPROVED || status === WithdrawalStatus.REJECTED ? new Date() : undefined,
      paidAt: status === WithdrawalStatus.PAID ? new Date() : undefined,
    },
  });

  revalidatePath("/admin/escrow/withdrawals");
  revalidatePath(`/admin/escrow/withdrawals/${parsed.data.withdrawalId}/review`);
  revalidatePath("/provider/withdrawals");
  revalidatePath("/muthawif/withdrawals");
  return redirect({ href: `/admin/escrow/withdrawals/${parsed.data.withdrawalId}/review?notice=${notice}`, locale });
}

function canMoveToStatus(current: WithdrawalStatus, next: WithdrawalStatus): boolean {
  if (next === WithdrawalStatus.APPROVED) return current === WithdrawalStatus.REVIEW;
  if (next === WithdrawalStatus.PAID) return current === WithdrawalStatus.APPROVED;
  if (next === WithdrawalStatus.REJECTED) return current === WithdrawalStatus.REVIEW || current === WithdrawalStatus.APPROVED;
  return false;
}

async function assertTrustedOrigin(): Promise<void> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!origin || !host) return;
  try {
    const allowedHosts = new Set([host]);
    if (process.env.NEXT_PUBLIC_APP_URL) allowedHosts.add(new URL(process.env.NEXT_PUBLIC_APP_URL).host);
    if (!allowedHosts.has(new URL(origin).host)) throw new Error("Untrusted request origin.");
  } catch {
    throw new Error("Untrusted request origin.");
  }
}
