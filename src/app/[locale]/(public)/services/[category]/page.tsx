import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { getCategoryBySlug, getServicesByCategory } from "@/lib/constants/services";

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

  const t = await getTranslations("Services");
  const services = getServicesByCategory(config.key);

  return (
    <>
      <SiteHeader />
      <main className="min-h-dvh bg-[var(--ivory)] pb-24 pt-28 text-[var(--charcoal)] min-[900px]:pb-12">
        <section className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-10">
          <Link href="/services" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-extrabold text-[var(--charcoal)]">
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t("back")}
          </Link>
          <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="rounded-xl border border-[var(--border)] bg-white p-5 md:p-7">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("detailEyebrow")}</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] md:text-4xl">{t(`categories.${config.key}.title`)}</h1>
              <p className="mt-4 text-sm font-medium leading-7 text-[var(--text-muted)]">{t(`categories.${config.key}.detail`)}</p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-[var(--ivory)] p-4"><p className="font-bold text-[var(--text-muted)]">{t("fields.available")}</p><p className="mt-1 text-2xl font-extrabold">{services.length}</p></div>
                <div className="rounded-lg bg-[var(--ivory)] p-4"><p className="font-bold text-[var(--text-muted)]">{t("fields.providers")}</p><p className="mt-1 text-2xl font-extrabold">{config.providerCount}</p></div>
              </div>
            </div>
            <div className="grid gap-3">
              {services.map((service) => (
                <article key={service.key} className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm md:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-[var(--text-muted)]">{service.code}</p>
                      <h2 className="mt-1 text-lg font-extrabold">{t(`provided.${service.key}.title`)}</h2>
                    </div>
                    {service.isFeatured ? <span className="rounded-full bg-[var(--emerald)]/10 px-3 py-1 text-xs font-extrabold text-[var(--emerald)]">{t("featured")}</span> : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{t(`provided.${service.key}.desc`)}</p>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <div><p className="font-bold text-[var(--text-muted)]">{t("fields.price")}</p><p className="mt-1 font-extrabold">{t("currency.idr", { value: Number(service.basePriceIdr) })}</p></div>
                    <div><p className="font-bold text-[var(--text-muted)]">{t("fields.duration")}</p><p className="mt-1 font-extrabold">{t(`durations.${service.durationKey}`)}</p></div>
                    <Link href="/register" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--emerald)] px-4 text-sm font-extrabold text-white">
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                      {t("book")}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <MobileBottomNav />
    </>
  );
}
