import type { Metadata } from "next";
import type { ReactElement } from "react";
import { UserRole } from "@prisma/client";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ProviderStaffForm } from "@/components/forms/provider-staff-form";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getProviderStaffById } from "@/lib/provider-management/data";
import { updateProviderStaffAction } from "../../../actions";

export const metadata: Metadata = { title: "Edit Staf Provider" };

type EditProviderStaffPageProps = { readonly params: Promise<{ readonly staff: string }> };

export default async function EditProviderStaffPage({ params }: EditProviderStaffPageProps): Promise<ReactElement> {
  const [{ staff: staffId }, session] = await Promise.all([params, requireRoleSession([UserRole.PROVIDER])]);
  const [t, staff] = await Promise.all([getTranslations("Partner.provider.staff"), getProviderStaffById(session.userId, staffId)]);
  if (!staff) notFound();

  return (
    <div className="flex flex-col gap-5">
      <section className="hidden max-w-3xl md:block">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("eyebrow")}</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)] md:text-3xl">{t("form.editTitle")}</h1>
      </section>
      <ProviderStaffForm action={updateProviderStaffAction} staff={staff} text={{ name: t("form.name"), roleTitle: t("form.roleTitle"), email: t("form.email"), phone: t("form.phone"), languages: t("form.languages"), basePrice: t("form.basePrice"), status: t("form.status"), notes: t("form.notes"), submit: t("form.submitUpdate"), cancel: t("form.cancel"), statusLabels: { ACTIVE: t("statuses.ACTIVE"), ON_DUTY: t("statuses.ON_DUTY"), INACTIVE: t("statuses.INACTIVE") } }} />
    </div>
  );
}
