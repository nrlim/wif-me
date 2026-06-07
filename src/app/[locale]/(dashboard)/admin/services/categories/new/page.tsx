import type { Metadata } from "next";
import type { ReactElement } from "react";
import { getTranslations } from "next-intl/server";
import { ServiceCategoryForm } from "@/components/forms/service-category-form";
import { saveServiceCategory } from "../../actions";

export const metadata: Metadata = { title: "Tambah Kategori Layanan" };

type NewCategoryPageProps = { readonly params: Promise<{ readonly locale: string }> };

export default async function NewCategoryPage({ params }: NewCategoryPageProps): Promise<ReactElement> {
  const { locale } = await params;
  const t = await getTranslations("Admin.services");

  return (
    <div className="flex flex-col gap-5">
      <section className="hidden max-w-3xl md:block"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("form.categoryCreateEyebrow")}</p><h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)] md:text-3xl">{t("form.categoryCreateTitle")}</h1><p className="mt-3 text-sm font-medium leading-7 text-[var(--text-muted)]">{t("form.categoryCreateDescription")}</p></section>
      <ServiceCategoryForm locale={locale} action={saveServiceCategory} text={{ title: t("form.title"), description: t("form.description"), priceModel: t("fields.priceModel"), order: t("fields.order"), status: t("form.status"), submit: t("form.save"), cancel: t("form.cancel"), priceModels: { currency: t("priceModels.currency"), b2b: t("priceModels.b2b"), route: t("priceModels.route"), document: t("priceModels.document"), custom: t("priceModels.custom") }, statuses: { active: t("statuses.active"), draft: t("statuses.draft") } }} />
    </div>
  );
}
