"use server";

import { BookingStatus, PaymentStatus, UserRole } from "@prisma/client";
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

export async function releaseEscrowFundsAction(formData: FormData): Promise<never> {
  await assertTrustedOrigin();
  await requireRoleSession([UserRole.ADMIN]);
  const locale = readLocale(formData);
  const parsed = adminPaymentReviewSchema.safeParse({ paymentId: formData.get("paymentId") });

  if (!parsed.success) {
    return redirect({ href: "/admin/escrow/holding?notice=invalid", locale });
  }

  const prisma = getPrismaClient();
  const payment = await prisma.payment.findFirst({
    where: { id: parsed.data.paymentId, status: PaymentStatus.HELD_IN_ESCROW },
    select: { id: true, orderId: true, gatewayReference: true },
  });

  if (!payment) {
    return redirect({ href: "/admin/escrow/holding?notice=not-eligible", locale });
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.RELEASED, escrowReleasedAt: new Date() },
    }),
    prisma.booking.updateMany({
      where: { orderId: payment.orderId, status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] } },
      data: { status: BookingStatus.COMPLETED },
    }),
  ]);

  revalidatePath("/admin/escrow/holding");
  revalidatePath("/admin/transactions");
  revalidatePath("/jamaah/bookings");
  revalidatePath("/jamaah/payments");
  return redirect({ href: `/admin/escrow/holding/${payment.gatewayReference ?? payment.id}/review?notice=released`, locale });
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
