import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ConfirmActionForm } from "@/components/shared/confirm-action-form";
import { getServiceCategoryByKey } from "@/lib/admin/data";
import { deleteServiceCategory } from "../../../actions";

export const metadata: Metadata = { title: "Hapus Kategori Layanan" };

type DeleteCategoryPageProps = { readonly params: Promise<{ readonly locale: string; readonly category: string }> };

export default async function DeleteCategoryPage({ params }: DeleteCategoryPageProps): Promise<ReactElement> {
  const { locale, category: categoryKey } = await params;
  const category = await getServiceCategoryByKey(categoryKey);
  if (!category) notFound();
  const t = await getTranslations("Admin.services");

  return (
    <div className="max-w-2xl">
      <section className="rounded-xl border border-[var(--border)] bg-white p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("delete.categoryEyebrow")}</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)]">{t("delete.categoryTitle", { category: category.title })}</h1>
        <p className="mt-3 text-sm font-medium leading-7 text-[var(--text-muted)]">{t("delete.categoryDescription")}</p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link href="/admin/services/categories" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-extrabold text-[var(--charcoal)]">{t("form.cancel")}</Link>
          <ConfirmActionForm action={deleteServiceCategory} fields={[{ name: "locale", value: locale }, { name: "id", value: category.key }]} triggerLabel={t("delete.confirm")} title={t("delete.categoryTitle", { category: category.title })} description={t("delete.categoryDescription")} confirmLabel={t("delete.confirm")} cancelLabel={t("form.cancel")} />
        </div>
      </section>
    </div>
  );
}
