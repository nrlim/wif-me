import type { Metadata } from "next";
import type { ReactElement } from "react";
import { UserRole } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { ProviderStaffForm } from "@/components/forms/provider-staff-form";
import { requireRoleSession } from "@/lib/auth/current-session";
import { createProviderStaffAction } from "../../actions";

export const metadata: Metadata = { title: "Tambah Staf Provider" };

export default async function NewProviderStaffPage(): Promise<ReactElement> {
  await requireRoleSession([UserRole.PROVIDER]);
  const t = await getTranslations("Partner.provider.staff");

  return (
    <div className="flex flex-col gap-5">
      <section className="hidden max-w-3xl md:block">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("eyebrow")}</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)] md:text-3xl">{t("form.addTitle")}</h1>
      </section>
      <ProviderStaffForm action={createProviderStaffAction} text={{ name: t("form.name"), roleTitle: t("form.roleTitle"), email: t("form.email"), phone: t("form.phone"), languages: t("form.languages"), basePrice: t("form.basePrice"), status: t("form.status"), notes: t("form.notes"), submit: t("form.submitCreate"), cancel: t("form.cancel"), statusLabels: { ACTIVE: t("statuses.ACTIVE"), ON_DUTY: t("statuses.ON_DUTY"), INACTIVE: t("statuses.INACTIVE") } }} />
    </div>
  );
}
