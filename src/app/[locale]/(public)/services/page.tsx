import type { Metadata } from "next";
import type { ReactElement } from "react";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, CarFront, FileCheck2, Handshake, Plus, UserCheck } from "lucide-react";
import { Link } from "@/i18n/routing";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { SERVICE_CATEGORIES } from "@/lib/constants/services";

export const metadata: Metadata = { title: "Layanan Wif-Me" };

const CATEGORY_ICONS = {
  muthawifPersonal: UserCheck,
  providerMuthawif: Handshake,
  transportation: CarFront,
  visaProcessing: FileCheck2,
  additionalServices: Plus,
} as const;

export default async function ServicesPage(): Promise<ReactElement> {
  const t = await getTranslations("Services");

  return (
    <>
      <SiteHeader />
      <main className="min-h-dvh bg-[var(--ivory)] pb-24 pt-28 text-[var(--charcoal)] min-[900px]:pb-12">
        <section className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("eyebrow")}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] md:text-5xl">{t("title")}</h1>
            <p className="mt-4 text-sm font-medium leading-7 text-[var(--text-muted)] md:text-base">{t("description")}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            {SERVICE_CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category.key];
              return (
                <Link key={category.key} href={`/services/${category.slug}`} className="group flex items-center gap-4 rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm transition-all hover:border-[var(--emerald)] hover:shadow-md md:p-5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--emerald)]/10 text-[var(--emerald)]">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <h2 className="text-base font-extrabold text-[var(--charcoal)] md:text-lg">{t(`categories.${category.key}.title`)}</h2>
                    <p className="mt-1 line-clamp-1 text-sm text-[var(--text-muted)] md:line-clamp-2">{t(`categories.${category.key}.desc`)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden rounded-full bg-[var(--emerald)]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[var(--emerald)] sm:block">{t("serviceCount", { count: category.serviceCount })}</span>
                    <ArrowUpRight className="size-5 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--emerald)]" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <MobileBottomNav />
    </>
  );
}
