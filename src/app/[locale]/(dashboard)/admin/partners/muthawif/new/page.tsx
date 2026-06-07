import type { Metadata } from "next";
import type { ReactElement } from "react";
import { getTranslations } from "next-intl/server";
import { PartnerForm } from "@/components/forms/partner-form";
import { savePartner } from "../../actions";

export const metadata: Metadata = { title: "Tambah Muthawif" };

type NewMuthawifPageProps = { readonly params: Promise<{ readonly locale: string }> };

export default async function NewMuthawifPage({ params }: NewMuthawifPageProps): Promise<ReactElement> {
  const { locale } = await params;
  const t = await getTranslations("Admin.partners");
  return (
    <div className="flex flex-col gap-5">
      <section className="hidden max-w-3xl md:block"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("form.muthawifCreateEyebrow")}</p><h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)] md:text-3xl">{t("form.muthawifCreateTitle")}</h1><p className="mt-3 text-sm font-medium leading-7 text-[var(--text-muted)]">{t("form.muthawifCreateDescription")}</p></section>
      <PartnerForm locale={locale} type="personal" action={savePartner} text={{ name: t("form.name"), service: t("table.service"), city: t("table.city"), bookings: t("table.bookings"), status: t("table.status"), submit: t("actions.save"), cancel: t("actions.cancel"), services: { muthawifPersonal: t("services.muthawifPersonal"), providerMuthawif: t("services.providerMuthawif"), transportation: t("services.transportation") }, cities: { makkah: t("cities.makkah"), jeddah: t("cities.jeddah"), madinah: t("cities.madinah") }, statuses: { verified: t("statuses.verified"), review: t("statuses.review"), paused: t("statuses.paused") } }} />
    </div>
  );
}
