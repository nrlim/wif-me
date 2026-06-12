import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ServiceItemForm } from "@/components/forms/service-item-form";
import { getServiceCategoryRows, getServiceItemById } from "@/lib/admin/data";
import { getPublicLocations } from "@/lib/services/public-data";
import { serviceTypeToKey } from "@/lib/admin/mappers";
import { saveServiceItem } from "../../../actions";

export const metadata: Metadata = { title: "Edit Layanan" };

type EditItemPageProps = { readonly params: Promise<{ readonly locale: string; readonly service: string }> };

export default async function EditItemPage({ params }: EditItemPageProps): Promise<ReactElement> {
  const { locale, service: serviceId } = await params;
  const service = await getServiceItemById(serviceId);
  if (!service) notFound();
  const [t, categories, locations] = await Promise.all([
    getTranslations("Admin.services"),
    getServiceCategoryRows(),
    getPublicLocations()
  ]);
  const categoryKey = serviceTypeToKey(service.type);
  return <div className="flex flex-col gap-5"><section className="hidden max-w-3xl md:block"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("form.itemEditEyebrow")}</p><h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)] md:text-3xl">{t("form.itemEditTitle", { service: service.title })}</h1><p className="mt-3 text-sm font-medium leading-7 text-[var(--text-muted)]">{t("form.itemEditDescription")}</p></section><ServiceItemForm locale={locale} action={saveServiceItem} service={service} initialTitle={service.title} initialDescription={service.description} locations={locations} text={{ category: t("fields.category"), code: t("fields.code"), title: t("form.title"), description: t("form.description"), basePrice: t("fields.basePrice"), baseLocation: "Base Location", duration: t("fields.duration"), status: t("form.status"), submit: t("form.save"), cancel: t("form.cancel"), statuses: { active: t("statuses.active"), draft: t("statuses.draft") }, categories: categories.map((category) => ({ key: category.key, label: category.title })) }} /> <p className="sr-only">{categoryKey}</p></div>;
}
