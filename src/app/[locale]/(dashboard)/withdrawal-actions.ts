"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "@/i18n/routing";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getPrismaClient } from "@/lib/db/prisma";
import { getPartnerWithdrawalData } from "@/lib/partner/withdrawals";
import { encryptSensitiveValue } from "@/lib/security/encryption";
import { withdrawalRequestSchema } from "@/lib/validators/withdrawals";

function readLocale(formData: FormData): string {
  const value = formData.get("locale");
  return typeof value === "string" && value.length > 0 ? value : "id";
}

export async function createWithdrawalRequestAction(formData: FormData): Promise<never> {
  await assertTrustedOrigin();
  const session = await requireRoleSession([UserRole.MUTHAWIF, UserRole.PROVIDER]);
  const locale = readLocale(formData);
  const basePath = session.role === UserRole.MUTHAWIF ? "/muthawif/withdrawals" : "/provider/withdrawals";
  const parsed = withdrawalRequestSchema.safeParse({
    amountIdr: formData.get("amountIdr"),
    bankName: formData.get("bankName"),
    bankAccountName: formData.get("bankAccountName"),
    bankAccountNumber: formData.get("bankAccountNumber"),
    requestedNote: formData.get("requestedNote"),
  });

  if (!parsed.success) return redirect({ href: `${basePath}?notice=invalid`, locale });

  const { summary } = await getPartnerWithdrawalData(session.userId);
  if (parsed.data.amountIdr > summary.availableIdr) return redirect({ href: `${basePath}?notice=insufficient`, locale });

  const encrypted = encryptSensitiveValue(parsed.data.bankAccountNumber);
  const prisma = getPrismaClient();
  await prisma.withdrawalRequest.create({
    data: {
      providerId: session.userId,
      amountIdr: parsed.data.amountIdr,
      bankName: parsed.data.bankName,
      bankAccountName: parsed.data.bankAccountName,
      bankAccountLast4: parsed.data.bankAccountNumber.slice(-4),
      bankAccountEncrypted: encrypted.encrypted,
      bankAccountIv: encrypted.iv,
      bankAccountTag: encrypted.tag,
      requestedNote: parsed.data.requestedNote || null,
    },
  });

  revalidatePath(basePath);
  revalidatePath("/admin/escrow/withdrawals");
  return redirect({ href: `${basePath}?notice=requested`, locale });
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
