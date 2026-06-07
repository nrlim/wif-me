import type { Metadata } from "next";
import type { ReactElement } from "react";
import { getTranslations } from "next-intl/server";
import { ServiceItemForm } from "@/components/forms/service-item-form";
import { getServiceCategoryRows } from "@/lib/admin/data";
import { saveServiceItem } from "../../actions";

export const metadata: Metadata = { title: "Tambah Layanan" };

type NewItemPageProps = { readonly params: Promise<{ readonly locale: string }> };

export default async function NewItemPage({ params }: NewItemPageProps): Promise<ReactElement> {
  const { locale } = await params;
  const t = await getTranslations("Admin.services");
  const categories = await getServiceCategoryRows();

  return (
    <div className="flex flex-col gap-5">
      <section className="hidden max-w-3xl md:block"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("form.itemCreateEyebrow")}</p><h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)] md:text-3xl">{t("form.itemCreateTitle")}</h1><p className="mt-3 text-sm font-medium leading-7 text-[var(--text-muted)]">{t("form.itemCreateDescription")}</p></section>
      <ServiceItemForm locale={locale} action={saveServiceItem} text={{ category: t("fields.category"), code: t("fields.code"), title: t("form.title"), description: t("form.description"), basePrice: t("fields.basePrice"), duration: t("fields.duration"), status: t("form.status"), submit: t("form.save"), cancel: t("form.cancel"), statuses: { active: t("statuses.active"), draft: t("statuses.draft") }, categories: categories.map((category) => ({ key: category.key, label: category.title })) }} />
    </div>
  );
}
