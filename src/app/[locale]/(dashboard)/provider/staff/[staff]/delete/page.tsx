import type { Metadata } from "next";
import type { ReactElement } from "react";
import { UserRole } from "@prisma/client";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getProviderStaffById } from "@/lib/provider-management/data";
import { deleteProviderStaffAction } from "../../../actions";

export const metadata: Metadata = { title: "Hapus Staf Provider" };

type DeleteProviderStaffPageProps = { readonly params: Promise<{ readonly staff: string }> };

export default async function DeleteProviderStaffPage({ params }: DeleteProviderStaffPageProps): Promise<ReactElement> {
  const [{ staff: staffId }, session] = await Promise.all([params, requireRoleSession([UserRole.PROVIDER])]);
  const [t, staff] = await Promise.all([getTranslations("Partner.provider.staff"), getProviderStaffById(session.userId, staffId)]);
  if (!staff) notFound();

  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-[var(--border)] bg-white p-5">
      <h1 className="text-xl font-extrabold tracking-[-0.03em] text-[var(--charcoal)]">{t("form.deleteTitle", { name: staff.name })}</h1>
      <p className="mt-3 text-sm font-semibold leading-6 text-[var(--text-muted)]">{t("form.deleteDescription")}</p>
      <form action={deleteProviderStaffAction} className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <input type="hidden" name="id" value={staff.id} />
        <Link href="/provider/staff" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-extrabold text-[var(--charcoal)]">{t("form.cancel")}</Link>
        <button type="submit" className="min-h-11 rounded-lg bg-[var(--error)] px-5 text-sm font-extrabold text-white">{t("form.confirmDelete")}</button>
      </form>
    </div>
  );
}
