"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireRoleSession } from "@/lib/auth/current-session";
import { FALLBACK_RATES, type CurrencyCode } from "@/lib/currency/rates";
import { getPrismaClient } from "@/lib/db/prisma";
import { sendStaffInvitationEmail } from "@/lib/email/invitation";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { providerFleetSchema, providerResourceIdSchema, providerStaffSchema } from "@/lib/validators/provider-management";
import { providerPasswordSchema, providerProfileSchema } from "@/lib/validators/provider";

export async function updateProviderProfileAction(formData: FormData): Promise<void> {
  await assertTrustedOrigin();
  const session = await requireRoleSession([UserRole.PROVIDER]);
  const parsed = providerProfileSchema.safeParse(readProviderProfileForm(formData));
  if (!parsed.success) redirect("/provider/profile?notice=invalid");

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
        companyName: parsed.data.companyName,
        companyType: parsed.data.companyType,
        registrationNumber: parsed.data.registrationNumber || null,
        taxId: parsed.data.taxId || null,
        phone: parsed.data.phone || null,
        whatsapp: parsed.data.whatsapp || null,
        website: parsed.data.website || null,
        address: parsed.data.address || null,
        baseLocationId: parsed.data.baseLocationId || null,
        country: parsed.data.country,
        languages,
        bio: parsed.data.bio || null,
      },
      update: {
        displayName: parsed.data.displayName,
        companyName: parsed.data.companyName,
        companyType: parsed.data.companyType,
        registrationNumber: parsed.data.registrationNumber || null,
        taxId: parsed.data.taxId || null,
        phone: parsed.data.phone || null,
        whatsapp: parsed.data.whatsapp || null,
        website: parsed.data.website || null,
        address: parsed.data.address || null,
        baseLocationId: parsed.data.baseLocationId || null,
        country: parsed.data.country,
        languages,
        bio: parsed.data.bio || null,
      },
    }),
  ]);

  revalidatePath("/provider/profile");
  redirect("/provider/profile?notice=saved");
}

export async function updateProviderPasswordAction(formData: FormData): Promise<void> {
  await assertTrustedOrigin();
  const session = await requireRoleSession([UserRole.PROVIDER]);
  const parsed = providerPasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) redirect("/provider/profile/security?notice=invalid");

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { passwordHash: true } });

  if (!user || !verifyPassword(parsed.data.currentPassword, user.passwordHash)) {
    redirect("/provider/profile/security?notice=current-invalid");
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash: hashPassword(parsed.data.newPassword) },
  });

  redirect("/provider/profile/security?notice=password-saved");
}

export async function createProviderStaffAction(formData: FormData): Promise<void> {
  await assertTrustedOrigin();
  const session = await requireRoleSession([UserRole.PROVIDER]);
  const parsed = providerStaffSchema.safeParse(readStaffForm(formData));
  if (!parsed.success) redirect("/provider/staff/new?notice=invalid");

  const prisma = getPrismaClient();
  const basePriceIdr = await getBasePriceIdr(parsed.data.baseCurrency, parsed.data.originalPrice);
  const email = parsed.data.email || null;
  const inviteStatus = email ? "PENDING" : "NONE";
  const inviteToken = email ? crypto.randomUUID() : null;
  const inviteExpiresAt = email ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;

  await prisma.providerStaff.create({
    data: { 
      providerId: session.userId, 
      ...parsed.data, 
      email,
      inviteStatus,
      inviteToken,
      inviteExpiresAt,
      basePriceIdr, 
      phone: parsed.data.phone || null, 
      languages: toLanguageList(parsed.data.languages ?? ""), 
      notes: parsed.data.notes || null 
    },
  });

  if (email && inviteToken) {
    const provider = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true, providerProfile: { select: { displayName: true } } } });
    const providerName = provider?.providerProfile?.displayName ?? provider?.name ?? "Provider";
    await sendStaffInvitationEmail({ recipientEmail: email, recipientName: parsed.data.name, providerName, inviteToken }).catch(() => {});
  }

  revalidatePath("/provider/staff");
  redirect("/provider/staff?notice=created");
}

export async function updateProviderStaffAction(formData: FormData): Promise<void> {
  await assertTrustedOrigin();
  const session = await requireRoleSession([UserRole.PROVIDER]);
  const id = providerResourceIdSchema.safeParse({ id: formData.get("id") });
  const parsed = providerStaffSchema.safeParse(readStaffForm(formData));
  if (!id.success || !parsed.success) redirect("/provider/staff?notice=invalid");

  const prisma = getPrismaClient();
  const basePriceIdr = await getBasePriceIdr(parsed.data.baseCurrency, parsed.data.originalPrice);
  const email = parsed.data.email || null;
  
  const existingStaff = await prisma.providerStaff.findUnique({ where: { id: id.data.id } });
  
  // If email changes from null/empty to a value, we should create a new invite
  const shouldReinvite = email && (!existingStaff?.email || existingStaff.email !== email);
  const inviteStatus = shouldReinvite ? "PENDING" : (existingStaff?.inviteStatus ?? "NONE");
  const inviteToken = shouldReinvite ? crypto.randomUUID() : existingStaff?.inviteToken;
  const inviteExpiresAt = shouldReinvite ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : existingStaff?.inviteExpiresAt;

  const result = await prisma.providerStaff.updateMany({
    where: { id: id.data.id, providerId: session.userId },
    data: { 
      ...parsed.data, 
      email,
      inviteStatus,
      inviteToken,
      inviteExpiresAt,
      basePriceIdr, 
      phone: parsed.data.phone || null, 
      languages: toLanguageList(parsed.data.languages ?? ""), 
      notes: parsed.data.notes || null 
    },
  });

  if (result.count !== 1) redirect("/provider/staff?notice=not-found");

  if (shouldReinvite && inviteToken) {
    const provider = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true, providerProfile: { select: { displayName: true } } } });
    const providerName = provider?.providerProfile?.displayName ?? provider?.name ?? "Provider";
    await sendStaffInvitationEmail({ recipientEmail: email, recipientName: parsed.data.name, providerName, inviteToken }).catch(() => {});
  }

  revalidatePath("/provider/staff");
  redirect("/provider/staff?notice=updated");
}

export async function deleteProviderStaffAction(formData: FormData): Promise<void> {
  await assertTrustedOrigin();
  const session = await requireRoleSession([UserRole.PROVIDER]);
  const id = providerResourceIdSchema.safeParse({ id: formData.get("id") });
  if (!id.success) redirect("/provider/staff?notice=invalid");

  await getPrismaClient().providerStaff.deleteMany({ where: { id: id.data.id, providerId: session.userId } });
  revalidatePath("/provider/staff");
  redirect("/provider/staff?notice=deleted");
}

export async function createProviderFleetAction(formData: FormData): Promise<void> {
  await assertTrustedOrigin();
  const session = await requireRoleSession([UserRole.PROVIDER]);
  const parsed = providerFleetSchema.safeParse(readFleetForm(formData));
  if (!parsed.success) redirect("/provider/fleet/new?notice=invalid");

  const basePriceIdr = await getBasePriceIdr(parsed.data.baseCurrency, parsed.data.originalPrice);
  await getPrismaClient().providerFleet.create({
    data: { providerId: session.userId, ...parsed.data, basePriceIdr, plateNumber: parsed.data.plateNumber || null, baseLocationId: parsed.data.baseLocationId || null, notes: parsed.data.notes || null },
  });

  revalidatePath("/provider/fleet");
  redirect("/provider/fleet?notice=created");
}

export async function updateProviderFleetAction(formData: FormData): Promise<void> {
  await assertTrustedOrigin();
  const session = await requireRoleSession([UserRole.PROVIDER]);
  const id = providerResourceIdSchema.safeParse({ id: formData.get("id") });
  const parsed = providerFleetSchema.safeParse(readFleetForm(formData));
  if (!id.success || !parsed.success) redirect("/provider/fleet?notice=invalid");

  const basePriceIdr = await getBasePriceIdr(parsed.data.baseCurrency, parsed.data.originalPrice);
  const result = await getPrismaClient().providerFleet.updateMany({
    where: { id: id.data.id, providerId: session.userId },
    data: { ...parsed.data, basePriceIdr, plateNumber: parsed.data.plateNumber || null, baseLocationId: parsed.data.baseLocationId || null, notes: parsed.data.notes || null },
  });

  if (result.count !== 1) redirect("/provider/fleet?notice=not-found");
  revalidatePath("/provider/fleet");
  redirect("/provider/fleet?notice=updated");
}

export async function deleteProviderFleetAction(formData: FormData): Promise<void> {
  await assertTrustedOrigin();
  const session = await requireRoleSession([UserRole.PROVIDER]);
  const id = providerResourceIdSchema.safeParse({ id: formData.get("id") });
  if (!id.success) redirect("/provider/fleet?notice=invalid");

  await getPrismaClient().providerFleet.deleteMany({ where: { id: id.data.id, providerId: session.userId } });
  revalidatePath("/provider/fleet");
  redirect("/provider/fleet?notice=deleted");
}

function readStaffForm(formData: FormData): Record<string, FormDataEntryValue | null> {
  return { name: formData.get("name"), roleTitle: formData.get("roleTitle"), email: formData.get("email"), phone: formData.get("phone"), languages: formData.get("languages"), baseCurrency: formData.get("baseCurrency"), originalPrice: formData.get("originalPrice"), status: formData.get("status"), notes: formData.get("notes") };
}

function readFleetForm(formData: FormData): Record<string, FormDataEntryValue | null> {
  return { vehicleName: formData.get("vehicleName"), vehicleType: formData.get("vehicleType"), plateNumber: formData.get("plateNumber"), capacity: formData.get("capacity"), baseLocationId: formData.get("baseLocationId"), baseCurrency: formData.get("baseCurrency"), originalPrice: formData.get("originalPrice"), status: formData.get("status"), notes: formData.get("notes") };
}

function readProviderProfileForm(formData: FormData): Record<string, FormDataEntryValue | null> {
  return { name: formData.get("name"), displayName: formData.get("displayName"), companyName: formData.get("companyName"), companyType: formData.get("companyType"), registrationNumber: formData.get("registrationNumber"), taxId: formData.get("taxId"), phone: formData.get("phone"), whatsapp: formData.get("whatsapp"), website: formData.get("website"), address: formData.get("address"), baseLocationId: formData.get("baseLocationId"), country: formData.get("country"), languages: formData.get("languages"), bio: formData.get("bio") };
}

async function getBasePriceIdr(baseCurrency: CurrencyCode, originalPrice: number): Promise<number> {
  const rateRow = await getPrismaClient().exchangeRate.findFirst({
    where: { baseCurrency: "IDR", targetCurrency: baseCurrency },
    orderBy: { fetchedAt: "desc" },
  });
  const exchangeRate = rateRow ? Number(rateRow.rate) : FALLBACK_RATES[baseCurrency];
  return exchangeRate > 0 ? originalPrice / exchangeRate : originalPrice;
}

function toLanguageList(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 8);
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
