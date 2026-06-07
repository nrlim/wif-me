import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ConfirmActionForm } from "@/components/shared/confirm-action-form";
import { getServiceItemById } from "@/lib/admin/data";
import { deleteServiceItem } from "../../../actions";

export const metadata: Metadata = { title: "Hapus Layanan" };

type DeleteItemPageProps = { readonly params: Promise<{ readonly locale: string; readonly service: string }> };

export default async function DeleteItemPage({ params }: DeleteItemPageProps): Promise<ReactElement> {
  const { locale, service: serviceId } = await params;
  const service = await getServiceItemById(serviceId);
  if (!service) notFound();
  const t = await getTranslations("Admin.services");
  return <div className="max-w-2xl"><section className="rounded-xl border border-[var(--border)] bg-white p-5"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("delete.itemEyebrow")}</p><h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)]">{t("delete.itemTitle", { service: service.title })}</h1><p className="mt-3 text-sm font-medium leading-7 text-[var(--text-muted)]">{t("delete.itemDescription")}</p><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Link href="/admin/services/items" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-extrabold text-[var(--charcoal)]">{t("form.cancel")}</Link><ConfirmActionForm action={deleteServiceItem} fields={[{ name: "locale", value: locale }, { name: "id", value: service.id }]} triggerLabel={t("delete.confirm")} title={t("delete.itemTitle", { service: service.title })} description={t("delete.itemDescription")} confirmLabel={t("delete.confirm")} cancelLabel={t("form.cancel")} /></div></section></div>;
}
