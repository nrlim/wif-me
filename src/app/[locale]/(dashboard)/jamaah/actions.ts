"use server";

import { BookingStatus, PaymentStatus, UserRole, OrderStatus } from "@prisma/client";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrismaClient } from "@/lib/db/prisma";
import { requireRoleSession } from "@/lib/auth/current-session";
import { PAYMENT_PROOF_UPLOAD } from "@/lib/constants/payment";
import { findBookingAvailabilityConflict } from "@/lib/jamaah/availability";
import { resolveBookableService, type ResolvedBookableService } from "@/lib/jamaah/bookable-resolver";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { uploadPaymentProof } from "@/lib/storage/supabase";
import { createOrderSchema, jamaahPasswordSchema, jamaahProfileSchema, paymentProofSchema, type CreateOrderInput } from "@/lib/validators/jamaah";

export async function createJamaahOrderAction(payload: CreateOrderInput): Promise<{ success: boolean; url?: string; message?: string }> {
  await assertTrustedOrigin();
  const session = await requireRoleSession([UserRole.JAMAAH]);
  const parsed = createOrderSchema.safeParse(payload);

  if (!parsed.success) {
    return { success: false, message: "Data keranjang tidak valid" };
  }

  const prisma = getPrismaClient();
  const cartItems = parsed.data.items;

  // 1. Resolve all services
  const resolvedServices = [] as { readonly item: (typeof cartItems)[number]; readonly service: ResolvedBookableService }[];
  for (const item of cartItems) {
    const service = await resolveBookableService(item.serviceId);
    if (!service) {
      return { success: false, message: "Layanan di keranjang tidak tersedia. Hapus item tersebut lalu pilih layanan lagi." };
    }
    resolvedServices.push({ item, service });
  }

  const availabilityConflict = await findBookingAvailabilityConflict(prisma, resolvedServices.map(({ item, service }) => ({
    serviceOfferingId: service.serviceOfferingId,
    resourceRef: service.resourceRef,
    ownerId: service.ownerId,
    type: service.type,
    title: service.title,
    scheduledStart: item.scheduledStart,
  })));

  if (availabilityConflict) {
    return { success: false, message: `${availabilityConflict.title} sudah dibooking pada tanggal ${availabilityConflict.scheduledDate}. Pilih tanggal lain.` };
  }

  // 2. Calculate Subtotal
  let subtotalIdr = 0;
  for (const { item, service } of resolvedServices) {
    subtotalIdr += service.basePriceIdr * item.quantity;
  }

  // 3. Discount Bundling / Voucher Logic (Placeholder for now)
  let discountIdr = 0;
  // If voucherCode is 'WIFME10', apply 10% discount
  if (parsed.data.voucherCode === "WIFME10") {
    discountIdr = Math.floor(subtotalIdr * 0.1);
  } else if (resolvedServices.length > 1) {
    // Basic Bundling Discount: 5% off if buying multiple services
    discountIdr = Math.floor(subtotalIdr * 0.05);
  }
  const totalAmountIdr = subtotalIdr - discountIdr;

  // 4. Create Order + Bookings + Payment in Transaction
  let payment: { readonly id: string };
  try {
    payment = await prisma.$transaction(async (tx) => {
    const conflict = await findBookingAvailabilityConflict(tx, resolvedServices.map(({ item, service }) => ({
      serviceOfferingId: service.serviceOfferingId,
      resourceRef: service.resourceRef,
      ownerId: service.ownerId,
      type: service.type,
      title: service.title,
      scheduledStart: item.scheduledStart,
    })));

    if (conflict) {
      throw new Error(`BOOKING_CONFLICT:${conflict.title}:${conflict.scheduledDate}`);
    }

    // Create the Order
    const order = await tx.order.create({
      data: {
        customerId: session.userId,
        status: OrderStatus.PENDING_PAYMENT,
        subtotalIdr,
        discountIdr,
        totalIdr: totalAmountIdr,
        voucherCode: payload.voucherCode,
      },
    });

    // Create Bookings for each item
    for (const { item, service } of resolvedServices) {
      const serviceOfferingId = service.serviceOfferingId ?? (await tx.serviceOffering.create({
        data: {
          ownerId: service.ownerId,
          categoryId: service.categoryId,
          type: service.type,
          title: service.title,
          description: service.description,
          basePriceIdr: service.basePriceIdr,
          baseCurrency: service.baseCurrency,
          originalPrice: service.originalPrice,
          baseLocationId: service.baseLocationId,
          routeOriginId: service.routeOriginId,
          routeDestinationId: service.routeDestinationId,
          vehicleType: service.vehicleType,
          bookableResourceRef: service.resourceRef,
          isActive: false,
        },
        select: { id: true },
      })).id;

      await tx.booking.create({
        data: {
          orderId: order.id,
          customerId: session.userId,
          serviceOfferingId,
          status: BookingStatus.PENDING_PAYMENT,
          scheduledStart: new Date(`${item.scheduledStart}T08:00:00.000Z`),
          notes: item.notes || null,
          totalPriceIdr: service.basePriceIdr * item.quantity,
        },
      });
    }

    // Create Payment
    return tx.payment.create({
      data: {
        orderId: order.id,
        status: PaymentStatus.PENDING,
        amountIdr: totalAmountIdr,
        gatewayReference: createPaymentReference(),
      },
      select: { id: true },
    });
  });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("BOOKING_CONFLICT:")) {
      const [, title, scheduledDate] = error.message.split(":");
      return { success: false, message: `${title} sudah dibooking pada tanggal ${scheduledDate}. Pilih tanggal lain.` };
    }
    throw error;
  }

  revalidatePath("/jamaah");
  revalidatePath("/jamaah/bookings");
  revalidatePath("/jamaah/payments");
  return { success: true, url: `/jamaah/payments/${payment.id}` };
}

export async function confirmJamaahPaymentAction(formData: FormData): Promise<void> {
  await submitJamaahPaymentProofAction(formData);
}

export async function submitJamaahPaymentProofAction(formData: FormData): Promise<void> {
  await assertTrustedOrigin();
  const session = await requireRoleSession([UserRole.JAMAAH]);
  const parsed = paymentProofSchema.safeParse({ paymentId: formData.get("paymentId") });
  const proof = formData.get("proof");

  if (!parsed.success || !(proof instanceof File) || proof.size === 0) {
    redirect("/jamaah/payments?notice=invalid-proof");
  }

  if (!PAYMENT_PROOF_UPLOAD.allowedMimeTypes.includes(proof.type as (typeof PAYMENT_PROOF_UPLOAD.allowedMimeTypes)[number]) || proof.size > PAYMENT_PROOF_UPLOAD.maxSizeBytes) {
    redirect(`/jamaah/payments/${parsed.data.paymentId}?notice=invalid-proof`);
  }

  const prisma = getPrismaClient();
  const payment = await prisma.payment.findFirst({
    where: { id: parsed.data.paymentId, order: { customerId: session.userId }, status: PaymentStatus.PENDING },
    select: { id: true },
  });

  if (!payment) {
    redirect("/jamaah/payments");
  }

  const proofUrl = await uploadPaymentProof(payment.id, proof);
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      proofUrl,
      proofFileName: proof.name.slice(0, 180),
      proofMimeType: proof.type,
      proofUploadedAt: new Date(),
      proofRejectedAt: null,
      proofReviewNote: null,
    },
  });

  revalidatePath("/jamaah");
  revalidatePath("/jamaah/payments");
  revalidatePath("/admin/transactions");
  redirect(`/jamaah/payments/${payment.id}?notice=proof-uploaded`);
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
