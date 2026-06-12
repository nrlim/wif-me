import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactElement } from "react";
import { LocationForm } from "@/components/forms/location-form";
import { saveAdminLocation } from "../actions";

export const metadata: Metadata = { title: "Tambah Lookup Lokasi" };

type NewLocationPageProps = {
  readonly params: Promise<{ readonly locale: string }>;
};

export default async function NewLocationPage({ params }: NewLocationPageProps): Promise<ReactElement> {
  const { locale } = await params;
  const t = await getTranslations("Admin.locations");

  return (
    <div className="flex w-full flex-col gap-5 md:gap-6">
      <section className="hidden md:block">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("eyebrow")}</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)] md:text-3xl">{t("form.createTitle")}</h1>
        <p className="mt-3 text-sm font-medium leading-7 text-[var(--text-muted)]">{t("form.createDescription")}</p>
      </section>
      <LocationForm locale={locale} action={saveAdminLocation} text={{ name: t("form.name"), type: t("fields.type"), countryCode: t("fields.country"), isMaster: t("fields.isMaster"), submit: t("form.save"), cancel: t("form.cancel"), types: { CITY: t("types.city"), AIRPORT: t("types.airport"), TRAIN_STATION: t("types.trainStation"), HOLY_SITE: t("types.holySite") }, placeholders: { name: t("form.namePlaceholder"), countryCode: t("form.countryPlaceholder") } }} />
    </div>
  );
}
