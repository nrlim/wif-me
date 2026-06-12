"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "@/i18n/routing";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getPrismaClient } from "@/lib/db/prisma";
import { deleteLocationSchema, locationMutationSchema } from "@/lib/validators/locations";

function readLocale(formData: FormData): string {
  const value = formData.get("locale");
  return typeof value === "string" && value.length > 0 ? value : "id";
}

export async function saveAdminLocation(formData: FormData): Promise<never> {
  await assertTrustedOrigin();
  await requireRoleSession([UserRole.ADMIN]);
  const locale = readLocale(formData);
  const parsed = locationMutationSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    type: formData.get("type"),
    countryCode: formData.get("countryCode"),
    isMaster: formData.get("isMaster") ?? "false",
  });

  if (!parsed.success) {
    return redirect({ href: "/admin/lookup/locations?notice=invalid", locale });
  }

  const prisma = getPrismaClient();
  const data = {
    name: parsed.data.name,
    type: parsed.data.type,
    countryCode: parsed.data.countryCode,
    isMaster: parsed.data.isMaster === "on" || parsed.data.isMaster === "true",
  };

  if (parsed.data.id) {
    await prisma.location.update({ where: { id: parsed.data.id }, data });
  } else {
    await prisma.location.create({ data });
  }

  revalidatePath("/admin/lookup/locations");
  return redirect({ href: "/admin/lookup/locations?notice=saved", locale });
}

export async function deleteAdminLocation(formData: FormData): Promise<never> {
  await assertTrustedOrigin();
  await requireRoleSession([UserRole.ADMIN]);
  const locale = readLocale(formData);
  const parsed = deleteLocationSchema.safeParse({ id: formData.get("id") });

  if (!parsed.success) {
    return redirect({ href: "/admin/lookup/locations?notice=invalid", locale });
  }

  const prisma = getPrismaClient();
  await prisma.location.delete({ where: { id: parsed.data.id } });

  revalidatePath("/admin/lookup/locations");
  return redirect({ href: "/admin/lookup/locations?notice=deleted", locale });
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
