import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { UserRole } from "@prisma/client";
import { Link } from "@/i18n/routing";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { getCategoryBySlug } from "@/lib/constants/services";
import { getCurrentSession } from "@/lib/auth/current-session";
import { getPublicCategoryDetail } from "@/lib/services/public-data";

type ServiceDetailPageProps = {
  readonly params: Promise<{ readonly category: string; readonly locale: string }>;
};

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { category, locale } = await params;
  const config = getCategoryBySlug(category);
  if (!config) return { title: "Layanan" };
  const t = await getTranslations({ locale, namespace: "Services" });
  return { title: t("detailMeta", { category: t(`categories.${config.key}.title`) }) };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps): Promise<ReactElement> {
  const { category } = await params;
  const config = getCategoryBySlug(category);
  if (!config) notFound();

  const [t, session, detail] = await Promise.all([
    getTranslations("Services"),
    getCurrentSession(),
    getPublicCategoryDetail(config.slug),
  ]);
  const offerings = detail?.offerings ?? [];
  const canCheckout = session?.role === UserRole.JAMAAH;

  return (
    <>
      <SiteHeader />
      <main className="min-h-dvh bg-[var(--ivory)] pb-24 pt-28 text-[var(--charcoal)] min-[900px]:pb-12">
        <section className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-10">
          <Link href="/services" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-extrabold text-[var(--charcoal)]">
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t("back")}
          </Link>
          <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-12">
            <div className="py-2">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("detailEyebrow")}</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] md:text-4xl">{t(`categories.${config.key}.title`)}</h1>
              <p className="mt-4 text-sm font-medium leading-7 text-[var(--text-muted)] md:text-base">{t(`categories.${config.key}.detail`)}</p>
              
              <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
                <div className="flex flex-col">
                  <p className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wide">{t("fields.available")}</p>
                  <p className="mt-1 text-2xl font-extrabold text-[var(--charcoal)]">{offerings.length}</p>
                </div>
                <div className="h-10 w-px bg-[var(--border)]" aria-hidden="true"></div>
                <div className="flex flex-col">
                  <p className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wide">{t("fields.providers")}</p>
                  <p className="mt-1 text-2xl font-extrabold text-[var(--charcoal)]">{detail?.providerCount ?? config.providerCount}</p>
                </div>
              </div>
            </div>
            
            <div className="grid gap-3">
              {offerings.length > 0 ? offerings.map((service) => {
                const href = canCheckout ? `/jamaah/checkout?serviceId=${service.id}` : `/register?next=${encodeURIComponent(`/jamaah/checkout?serviceId=${service.id}`)}`;
                return (
                  <article key={service.id} className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm transition-colors hover:border-[var(--emerald)]/50 md:p-5">
                    <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
                      <p className="text-xs font-extrabold text-[var(--text-muted)]">{service.ownerName}</p>
                      <span className="rounded-md bg-[var(--emerald)]/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[var(--emerald)]">{t("featured")}</span>
                    </div>
                    
                    <div className="py-4">
                      <h2 className="text-base font-extrabold md:text-lg">{service.title}</h2>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--text-muted)] md:line-clamp-none">{service.description}</p>
                    </div>
                    
                    <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-6">
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-muted)]">{t("fields.price")}</p>
                          <p className="mt-0.5 text-sm font-extrabold text-[var(--emerald)]">{service.basePrice}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-muted)]">{t("fields.duration")}</p>
                          <p className="mt-0.5 text-sm font-extrabold text-[var(--charcoal)]">{service.routeLabel ?? t("durationFlexible")}</p>
                        </div>
                      </div>
                      <Link href={href} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[var(--emerald)] px-6 text-sm font-extrabold text-white transition-opacity hover:opacity-90">
                        {canCheckout ? t("book") : t("registerToBook")}
                      </Link>
                    </div>
                  </article>
                );
              }) : (
                <div className="rounded-xl border border-dashed border-[var(--border)] bg-white p-5 text-center text-sm font-semibold leading-6 text-[var(--text-muted)]">
                  {t("emptyOfferings")}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <MobileBottomNav />
    </>
  );
}
