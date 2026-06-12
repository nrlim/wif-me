"use server";

import { BookingStatus, OrderStatus, PaymentStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "@/i18n/routing";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getPrismaClient } from "@/lib/db/prisma";
import { adminPaymentReviewSchema } from "@/lib/validators/admin-payments";

function readLocale(formData: FormData): string {
  const value = formData.get("locale");
  return typeof value === "string" && value.length > 0 ? value : "id";
}

export async function verifyManualTransferAction(formData: FormData): Promise<never> {
  await assertTrustedOrigin();
  await requireRoleSession([UserRole.ADMIN]);
  const locale = readLocale(formData);
  const parsed = adminPaymentReviewSchema.safeParse({ paymentId: formData.get("paymentId") });

  if (!parsed.success) {
    return redirect({ href: "/admin/transactions?notice=invalid", locale });
  }

  const prisma = getPrismaClient();
  const payment = await prisma.payment.findFirst({
    where: { id: parsed.data.paymentId, status: PaymentStatus.PENDING, proofUploadedAt: { not: null } },
    select: { id: true, orderId: true, gatewayReference: true },
  });

  if (!payment) {
    return redirect({ href: "/admin/transactions?notice=not-found", locale });
  }

  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.HELD_IN_ESCROW, proofVerifiedAt: new Date(), proofRejectedAt: null, proofReviewNote: null } }),
    prisma.order.update({ where: { id: payment.orderId }, data: { status: OrderStatus.PAID } }),
    prisma.booking.updateMany({ where: { orderId: payment.orderId }, data: { status: BookingStatus.CONFIRMED } }),
  ]);

  revalidatePaymentPaths();
  return redirect({ href: `/admin/transactions/${payment.gatewayReference ?? payment.id}?notice=verified`, locale });
}

export async function rejectManualTransferAction(formData: FormData): Promise<never> {
  await assertTrustedOrigin();
  await requireRoleSession([UserRole.ADMIN]);
  const locale = readLocale(formData);
  const parsed = adminPaymentReviewSchema.safeParse({ paymentId: formData.get("paymentId"), reviewNote: formData.get("reviewNote") });

  if (!parsed.success || !parsed.data.reviewNote) {
    return redirect({ href: "/admin/transactions?notice=invalid", locale });
  }

  const prisma = getPrismaClient();
  const payment = await prisma.payment.findFirst({
    where: { id: parsed.data.paymentId, status: PaymentStatus.PENDING, proofUploadedAt: { not: null } },
    select: { id: true, gatewayReference: true },
  });

  if (!payment) {
    return redirect({ href: "/admin/transactions?notice=not-found", locale });
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { proofRejectedAt: new Date(), proofReviewNote: parsed.data.reviewNote },
  });

  revalidatePaymentPaths();
  return redirect({ href: `/admin/transactions/${payment.gatewayReference ?? payment.id}?notice=rejected`, locale });
}

function revalidatePaymentPaths(): void {
  revalidatePath("/admin/transactions");
  revalidatePath("/jamaah/payments");
  revalidatePath("/jamaah/bookings");
}

async function assertTrustedOrigin(): Promise<void> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  const host = headerList.get("host");

  if (!origin || !host) return;

  try {
    if (new URL(origin).host !== host) throw new Error("Untrusted request origin.");
  } catch {
    throw new Error("Untrusted request origin.");
  }
}
