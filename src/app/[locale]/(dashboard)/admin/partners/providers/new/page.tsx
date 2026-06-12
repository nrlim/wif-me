import type { Metadata } from "next";
import type { ReactElement } from "react";
import { getTranslations } from "next-intl/server";
import { PartnerForm } from "@/components/forms/partner-form";
import { getPublicLocations } from "@/lib/services/public-data";
import { savePartner } from "../../actions";

export const metadata: Metadata = { title: "Tambah Provider" };

type NewProviderPageProps = { readonly params: Promise<{ readonly locale: string }> };

export default async function NewProviderPage({ params }: NewProviderPageProps): Promise<ReactElement> {
  const { locale } = await params;
  const [t, locations] = await Promise.all([
    getTranslations("Admin.partners"),
    getPublicLocations()
  ]);
  return (
    <div className="flex flex-col gap-5">
      <section className="hidden max-w-3xl md:block"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("form.providerCreateEyebrow")}</p><h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)] md:text-3xl">{t("form.providerCreateTitle")}</h1><p className="mt-3 text-sm font-medium leading-7 text-[var(--text-muted)]">{t("form.providerCreateDescription")}</p></section>
      <PartnerForm locale={locale} type="provider" action={savePartner} locations={locations} text={{ name: t("form.name"), service: t("table.service"), city: "Lokasi Basis", bookings: t("table.bookings"), status: t("table.status"), submit: t("actions.save"), cancel: t("actions.cancel"), services: { muthawifPersonal: t("services.muthawifPersonal"), providerMuthawif: t("services.providerMuthawif"), transportation: t("services.transportation") }, statuses: { verified: t("statuses.verified"), review: t("statuses.review"), paused: t("statuses.paused") } }} />
    </div>
  );
}
