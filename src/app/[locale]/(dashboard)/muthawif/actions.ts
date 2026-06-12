"use server";

import { BookingStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getPrismaClient } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { muthawifPasswordSchema, muthawifProfileSchema } from "@/lib/validators/muthawif";

export async function updateMuthawifProfileAction(formData: FormData): Promise<void> {
  await assertTrustedOrigin();
  const session = await requireRoleSession([UserRole.MUTHAWIF]);
  const parsed = muthawifProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    displayName: formData.get("displayName"),
    baseCity: formData.get("baseCity"),
    languages: formData.get("languages"),
    bio: formData.get("bio"),
  });

  if (!parsed.success) {
    redirect("/muthawif/profile?notice=invalid");
  }

  const languages = toLanguageList(parsed.data.languages ?? "");
  const prisma = getPrismaClient();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.userId },
      data: { name: parsed.data.name, phone: parsed.data.phone || null },
    }),
    prisma.providerProfile.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        displayName: parsed.data.displayName,
        baseLocationId: undefined,
        languages,
        bio: parsed.data.bio || null,
        companyName: parsed.data.displayName,
        companyType: "muthawif_personal",
      },
      update: {
        displayName: parsed.data.displayName,
        baseLocationId: undefined,
        languages,
        bio: parsed.data.bio || null,
      },
    }),
  ]);

  revalidatePath("/muthawif/profile");
  redirect("/muthawif/profile?notice=saved");
}

export async function updateMuthawifPasswordAction(formData: FormData): Promise<void> {
  await assertTrustedOrigin();
  const session = await requireRoleSession([UserRole.MUTHAWIF]);
  const parsed = muthawifPasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirect("/muthawif/profile/security?notice=invalid");
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { passwordHash: true } });

  if (!user || !verifyPassword(parsed.data.currentPassword, user.passwordHash)) {
    redirect("/muthawif/profile/security?notice=current-invalid");
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash: hashPassword(parsed.data.newPassword) },
  });

  redirect("/muthawif/profile/security?notice=password-saved");
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

function toLanguageList(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 8);
}

export async function toggleMuthawifAvailabilityAction(formData: FormData): Promise<{ warning?: string }> {
  await assertTrustedOrigin();
  const session = await requireRoleSession([UserRole.MUTHAWIF]);
  
  const isAvailable = formData.get("isAvailable") === "true";
  
  const prisma = getPrismaClient();
  
  await prisma.user.update({
    where: { id: session.userId },
    data: { isAvailable },
  });

  revalidatePath("/muthawif");
  revalidatePath("/jamaah/search");

  // If turning off availability, check for active bookings
  if (!isAvailable) {
    const activeBookings = await prisma.booking.count({
      where: {
        serviceOffering: { ownerId: session.userId },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
      },
    });

    if (activeBookings > 0) {
      return { warning: "active-bookings" };
    }
  }

  return {};
}
