import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ConfirmActionForm } from "@/components/shared/confirm-action-form";
import { getPartnerByKey } from "@/lib/constants/partners";
import { deletePartner } from "../../../actions";

export const metadata: Metadata = { title: "Hapus Muthawif" };

type DeleteMuthawifPageProps = { readonly params: Promise<{ readonly locale: string; readonly partner: string }> };

export default async function DeleteMuthawifPage({ params }: DeleteMuthawifPageProps): Promise<ReactElement> {
  const { locale, partner: key } = await params;
  const partner = getPartnerByKey(key);
  if (!partner || partner.type !== "personal") notFound();
  const t = await getTranslations("Admin.partners");
  return <section className="max-w-2xl rounded-xl border border-[var(--border)] bg-white p-5"><h1 className="text-2xl font-extrabold text-[var(--charcoal)]">{t("delete.title", { name: t(`items.${partner.key}.name`) })}</h1><p className="mt-3 text-sm font-medium leading-7 text-[var(--text-muted)]">{t("delete.description")}</p><div className="mt-5 flex gap-2"><Link href="/admin/partners/muthawif" className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 font-extrabold">{t("actions.cancel")}</Link><ConfirmActionForm action={deletePartner} fields={[{ name: "locale", value: locale }, { name: "id", value: partner.key }, { name: "type", value: "personal" }]} triggerLabel={t("actions.delete")} title={t("delete.title", { name: t(`items.${partner.key}.name`) })} description={t("delete.description")} confirmLabel={t("actions.delete")} cancelLabel={t("actions.cancel")} /></div></section>;
}
