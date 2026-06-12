"use server";

import { UserRole, VerificationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "@/i18n/routing";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getPrismaClient } from "@/lib/db/prisma";
import { deletePartnerSchema, partnerMutationSchema, partnerVerificationActionSchema } from "@/lib/validators/partners";

function readLocale(formData: FormData): string {
  const value = formData.get("locale");
  return typeof value === "string" && value.length > 0 ? value : "id";
}

function listPath(type: "personal" | "provider", notice: "saved" | "deleted"): "/admin/partners/muthawif?notice=saved" | "/admin/partners/providers?notice=saved" | "/admin/partners/muthawif?notice=deleted" | "/admin/partners/providers?notice=deleted" {
  if (type === "personal") return notice === "saved" ? "/admin/partners/muthawif?notice=saved" : "/admin/partners/muthawif?notice=deleted";
  return notice === "saved" ? "/admin/partners/providers?notice=saved" : "/admin/partners/providers?notice=deleted";
}

export async function savePartner(formData: FormData): Promise<never> {
  const locale = readLocale(formData);
  const parsed = partnerMutationSchema.parse({
    key: formData.get("key"),
    type: formData.get("type"),
    name: formData.get("name"),
    serviceKey: formData.get("serviceKey"),
    baseLocationId: formData.get("baseLocationId"),
    bookings: formData.get("bookings"),
    status: formData.get("status"),
  });

  return redirect({ href: listPath(parsed.type, "saved"), locale });
}

export async function deletePartner(formData: FormData): Promise<never> {
  const locale = readLocale(formData);
  const parsed = deletePartnerSchema.parse({ id: formData.get("id"), type: formData.get("type") });

  return redirect({ href: listPath(parsed.type, "deleted"), locale });
}

export async function approvePartnerVerification(formData: FormData): Promise<never> {
  await assertTrustedOrigin();
  await requireRoleSession([UserRole.ADMIN]);
  const locale = readLocale(formData);
  const parsed = partnerVerificationActionSchema.safeParse({
    partnerId: formData.get("partnerId"),
    partnerType: formData.get("partnerType"),
  });

  if (!parsed.success) {
    return redirect({ href: "/admin/partners?notice=invalid", locale });
  }

  await updatePartnerVerificationProfile(parsed.data.partnerId, parsed.data.partnerType, {
    verificationStatus: VerificationStatus.APPROVED,
    verifiedAt: new Date(),
    rejectionReason: null,
  });

  revalidatePartnerPaths(parsed.data.partnerType);
  return redirect({ href: listPath(parsed.data.partnerType, "saved"), locale });
}

export async function rejectPartnerVerification(formData: FormData): Promise<never> {
  await assertTrustedOrigin();
  await requireRoleSession([UserRole.ADMIN]);
  const locale = readLocale(formData);
  const parsed = partnerVerificationActionSchema.safeParse({
    partnerId: formData.get("partnerId"),
    partnerType: formData.get("partnerType"),
    rejectionReason: formData.get("rejectionReason"),
  });

  if (!parsed.success || !parsed.data.rejectionReason) {
    return redirect({ href: "/admin/partners?notice=invalid", locale });
  }

  await updatePartnerVerificationProfile(parsed.data.partnerId, parsed.data.partnerType, {
    verificationStatus: VerificationStatus.REJECTED,
    rejectionReason: parsed.data.rejectionReason,
  });

  revalidatePartnerPaths(parsed.data.partnerType);
  return redirect({ href: listPath(parsed.data.partnerType, "saved"), locale });
}

async function updatePartnerVerificationProfile(userId: string, type: "personal" | "provider", data: { readonly verificationStatus: VerificationStatus; readonly verifiedAt?: Date; readonly rejectionReason: string | null }): Promise<void> {
  const prisma = getPrismaClient();
  const expectedRole = type === "personal" ? UserRole.MUTHAWIF : UserRole.PROVIDER;
  const user = await prisma.user.findFirst({ where: { id: userId, role: expectedRole }, select: { id: true, name: true } });

  if (!user) return;

  await prisma.providerProfile.upsert({
    where: { userId: user.id },
    update: data,
    create: {
      userId: user.id,
      displayName: user.name,
      companyName: type === "provider" ? user.name : "Perorangan",
      companyType: type === "provider" ? "other" : "muthawif_personal",
      ...data,
    },
  });
}

function revalidatePartnerPaths(type: "personal" | "provider"): void {
  revalidatePath("/admin/partners");
  revalidatePath(type === "personal" ? "/admin/partners/muthawif" : "/admin/partners/providers");
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
