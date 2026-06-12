import type { Metadata } from "next";
import type { ComponentType, ReactElement } from "react";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, CarFront, FileCheck2, Handshake, Plus, UserCheck, type LucideProps } from "lucide-react";
import { CategoryLink } from "@/app/[locale]/(public)/services/category-link";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { getPublicCategoriesSummary } from "@/lib/services/public-data";
import { requireRoleSession } from "@/lib/auth/current-session";
import { UserRole } from "@prisma/client";

export const metadata: Metadata = { title: "Cari Layanan" };

const CATEGORY_ICONS: Record<string, ComponentType<LucideProps>> = {
  muthawifPersonal: UserCheck,
  providerMuthawif: Handshake,
  transportation: CarFront,
  visaProcessing: FileCheck2,
  additionalServices: Plus,
};

export default async function JamaahSearchPage(): Promise<ReactElement> {
  await requireRoleSession([UserRole.JAMAAH]);
  const t = await getTranslations("Services");
  const dbCategories = await getPublicCategoriesSummary();

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <DashboardPageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <div className="mt-0 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {dbCategories.map((category) => {
          const Icon = CATEGORY_ICONS[category.key] ?? Plus;
          return (
            <CategoryLink
              key={category.key}
              slug={category.slug}
              basePath="/jamaah/search"
              className="group flex items-start gap-4 rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm transition-all hover:border-[var(--emerald)]/40 hover:shadow-md md:p-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--emerald)]/8 text-[var(--emerald)] transition-colors group-hover:bg-[var(--emerald)]/12">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[0.9375rem] font-extrabold text-[var(--charcoal)]">{t(`categories.${category.key}.title`)}</h2>
                  <ArrowUpRight className="size-4 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--emerald)]" aria-hidden="true" />
                </div>
                <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-relaxed text-[var(--text-muted)]">{t(`categories.${category.key}.desc`)}</p>
                <div className="mt-3 flex items-center gap-3 text-xs font-bold text-[var(--text-muted)]">
                  <span className="rounded-md bg-[var(--emerald)]/8 px-2 py-0.5 text-[11px] font-extrabold text-[var(--emerald)]">
                    {t("serviceCount", { count: category.serviceCount })}
                  </span>
                  {category.providerCount > 0 ? (
                    <span>{t("providerCountLabel", { count: category.providerCount })}</span>
                  ) : null}
                </div>
              </div>
            </CategoryLink>
          );
        })}
      </div>
    </div>
  );
}
