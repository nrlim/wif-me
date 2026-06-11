"use server";

import { BookingStatus, PaymentStatus, UserRole } from "@prisma/client";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrismaClient } from "@/lib/db/prisma";
import { requireRoleSession } from "@/lib/auth/current-session";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { createBookingSchema, jamaahPasswordSchema, jamaahProfileSchema, paymentIdSchema } from "@/lib/validators/jamaah";

export async function createJamaahBookingAction(formData: FormData): Promise<void> {
  await assertTrustedOrigin();
  const session = await requireRoleSession([UserRole.JAMAAH]);
  const parsed = createBookingSchema.safeParse({
    serviceId: formData.get("serviceId"),
    scheduledStart: formData.get("scheduledStart"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    redirect("/jamaah/search");
  }

  const scheduledStart = new Date(`${parsed.data.scheduledStart}T08:00:00.000Z`);
  const prisma = getPrismaClient();
  const service = await prisma.serviceOffering.findFirst({
    where: { id: parsed.data.serviceId, isActive: true },
    select: { id: true, basePriceIdr: true },
  });

  if (!service) {
    redirect("/jamaah/search");
  }

  const payment = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: {
        customerId: session.userId,
        serviceOfferingId: service.id,
        status: BookingStatus.PENDING_PAYMENT,
        scheduledStart,
        notes: parsed.data.notes || null,
        totalPriceIdr: service.basePriceIdr,
      },
      select: { id: true },
    });

    return tx.payment.create({
      data: {
        bookingId: booking.id,
        status: PaymentStatus.PENDING,
        amountIdr: service.basePriceIdr,
        gatewayReference: createPaymentReference(),
      },
      select: { id: true },
    });
  });

  revalidatePath("/jamaah");
  revalidatePath("/jamaah/bookings");
  revalidatePath("/jamaah/payments");
  redirect(`/jamaah/payments/${payment.id}`);
}

export async function confirmJamaahPaymentAction(formData: FormData): Promise<void> {
  await assertTrustedOrigin();
  const session = await requireRoleSession([UserRole.JAMAAH]);
  const parsed = paymentIdSchema.safeParse({ paymentId: formData.get("paymentId") });

  if (!parsed.success) {
    redirect("/jamaah/payments");
  }

  const prisma = getPrismaClient();
  const payment = await prisma.payment.findFirst({
    where: { id: parsed.data.paymentId, booking: { customerId: session.userId }, status: PaymentStatus.PENDING },
    select: { id: true, bookingId: true },
  });

  if (!payment) {
    redirect("/jamaah/payments");
  }

  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.HELD_IN_ESCROW } }),
    prisma.booking.update({ where: { id: payment.bookingId }, data: { status: BookingStatus.CONFIRMED } }),
  ]);

  revalidatePath("/jamaah");
  revalidatePath("/jamaah/bookings");
  revalidatePath("/jamaah/payments");
  redirect("/jamaah/payments?status=HELD_IN_ESCROW");
}

async function assertTrustedOrigin(): Promise<void> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  const host = headerList.get("host");

  if (!origin || !host) return;

  try {
    if (new URL(origin).host !== host) {
      throw new Error("Untrusted request origin.");
    }
  } catch {
    throw new Error("Untrusted request origin.");
  }
}

export async function updateJamaahProfileAction(formData: FormData): Promise<void> {
  await assertTrustedOrigin();
  const session = await requireRoleSession([UserRole.JAMAAH]);
  const parsed = jamaahProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    redirect("/jamaah/profile?notice=invalid");
  }

  const prisma = getPrismaClient();
  await prisma.user.update({
    where: { id: session.userId },
    data: { name: parsed.data.name, phone: parsed.data.phone || null },
  });

  revalidatePath("/jamaah/profile");
  redirect("/jamaah/profile?notice=saved");
}

export async function updateJamaahPasswordAction(formData: FormData): Promise<void> {
  await assertTrustedOrigin();
  const session = await requireRoleSession([UserRole.JAMAAH]);
  const parsed = jamaahPasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirect("/jamaah/profile/security?notice=invalid");
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { passwordHash: true } });

  if (!user || !verifyPassword(parsed.data.currentPassword, user.passwordHash)) {
    redirect("/jamaah/profile/security?notice=current-invalid");
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash: hashPassword(parsed.data.newPassword) },
  });

  redirect("/jamaah/profile/security?notice=password-saved");
}

function createPaymentReference(): string {
  return `WIF-${Date.now().toString(36).toUpperCase()}`;
}
