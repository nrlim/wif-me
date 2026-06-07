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
          <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {SERVICE_CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category.key];
              return (
                <Link key={category.key} href={`/services/${category.slug}`} className="group rounded-xl border border-[var(--border)] bg-white p-5 shadow-[0_10px_28px_rgba(22,33,28,0.04)] transition-colors hover:border-[var(--emerald)]">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex size-11 items-center justify-center rounded-lg bg-[var(--emerald-pale)] text-[var(--emerald)]"><Icon className="size-5" aria-hidden="true" /></span>
                    <ArrowUpRight className="size-5 text-[var(--text-muted)] transition-colors group-hover:text-[var(--emerald)]" aria-hidden="true" />
                  </div>
                  <h2 className="mt-5 text-lg font-extrabold">{t(`categories.${category.key}.title`)}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{t(`categories.${category.key}.desc`)}</p>
                  <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--gold)]">{t("serviceCount", { count: category.serviceCount })}</p>
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
