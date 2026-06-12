import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { MapPin } from "lucide-react";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { PublicServiceCategoryNav } from "@/components/shared/public-service-category-nav";
import { PublicServiceFilterForm } from "@/components/shared/public-service-filter-form";
import { ServiceOriginAvatar } from "@/components/shared/service-origin-avatar";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { getCurrentSession } from "@/lib/auth/current-session";
import { getPublicCategoriesSummary, getPublicCategoryDetail, getPublicLocations, type PublicCategoryFilters, type PublicOfferingRow } from "@/lib/services/public-data";

type ServiceDetailPageProps = {
  readonly params: Promise<{ readonly category: string; readonly locale: string }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { category, locale } = await params;
  const detail = await getPublicCategoryDetail(category);
  if (!detail) return { title: "Layanan" };
  const t = await getTranslations({ locale, namespace: "Services" });
  return { title: t("detailMeta", { category: t(`categories.${detail.key}.title`) }) };
}

export default async function ServiceDetailPage({ params, searchParams }: ServiceDetailPageProps): Promise<ReactElement> {
  const [{ category }, rawFilters] = await Promise.all([params, searchParams]);
  const filters = parsePublicFilters(rawFilters);
  const [t, session, categories, detail, locations] = await Promise.all([getTranslations("Services"), getCurrentSession(), getPublicCategoriesSummary(), getPublicCategoryDetail(category, filters), getPublicLocations()]);
  if (!detail) notFound();

  const canCheckout = session?.role === UserRole.JAMAAH;
  const resultSummary = t("resultSummary", { count: detail.offerings.length, total: detail.totalOfferings });

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-dvh flex-col bg-[var(--ivory)] pb-24 pt-24 text-[var(--charcoal)] lg:h-dvh lg:overflow-hidden lg:pb-0 lg:pt-[68px]">
        <section className="mx-auto flex h-full w-full max-w-[1400px] flex-col px-4 sm:px-6 lg:overflow-hidden lg:px-8 lg:pt-8">
          <h1 className="sr-only">{t(`categories.${detail.key}.title`)}</h1>

          {/* Content layout */}
          <div className="grid gap-4 lg:h-full lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-x-8 lg:gap-y-0 lg:overflow-hidden">
            {/* Title (Row 1, Col 1) */}
            <div className="lg:col-start-1 lg:row-start-1 lg:pb-3">
              <h2 className="hidden lg:block lg:text-xs lg:font-extrabold lg:uppercase lg:tracking-widest lg:text-[var(--gold)]">{t("categoryNavLabel")}</h2>
            </div>

            {/* Category Nav & Filter Form (Row 2, Col 1) */}
            <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-2 lg:h-full lg:overflow-y-auto lg:pb-8 lg:pr-2 lg:scrollbar-none lg:gap-6">
              <PublicServiceCategoryNav ariaLabel={t("categoryNavLabel")} activeSlug={detail.slug} asSidebar items={categories.map((item) => ({ key: item.key, slug: item.slug, label: t(`categories.${item.key}.title`), count: item.serviceCount }))} />
              <PublicServiceFilterForm locations={locations} detail={detail} filters={filters} resultSummary={resultSummary} text={{ search: t("filters.search"), searchPlaceholder: t("filters.searchPlaceholder"), all: t("filters.all"), source: t("filters.source"), personal: t("filters.personal"), provider: t("filters.provider", { count: detail.providerBackedCount }), vehicle: t("filters.vehicle"), location: t("filters.location"), anyLocation: t("filters.anyLocation"), submit: t("filters.apply") }} />
            </div>

            {/* Offering cards grid (Row 2, Col 2) */}
            <div className="lg:col-start-2 lg:row-start-2 lg:h-full lg:overflow-y-auto lg:pb-8 lg:pl-1">
              {/* Results count — mobile */}
              <p className="mb-3 text-xs font-bold text-[var(--text-muted)] lg:hidden">{resultSummary}</p>

              {detail.offerings.length > 0 ? (
                <>
                  {/* Mobile: stacked list */}
                  <div className="grid gap-3 md:hidden">
                    {detail.offerings.map((service) => (
                      <MobileOfferingCard key={service.id} service={service} canCheckout={canCheckout} registerLabel={t("registerToBook")} priceLabel={t("fields.price")} />
                    ))}
                  </div>

                  {/* Desktop: grid cards */}
                  <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-3">
                    {detail.offerings.map((service) => (
                      <DesktopOfferingCard key={service.id} service={service} canCheckout={canCheckout} registerLabel={t("registerToBook")} durationLabel={t("fields.duration")} priceLabel={t("fields.price")} fallbackDuration={t("durationFlexible")} />
                    ))}
                  </div>
                </>
              ) : (
                <EmptyOfferings message={t("emptyOfferings")} />
              )}
            </div>
          </div>
        </section>
      </main>
      <MobileBottomNav />
    </>
  );
}

function parsePublicFilters(params: Record<string, string | string[] | undefined>): PublicCategoryFilters {
  const q = readSingleParam(params.q)?.trim().slice(0, 80) || undefined;
  const source = readSingleParam(params.source);
  const vehicleType = readSingleParam(params.vehicleType)?.trim().slice(0, 80) || undefined;
  const locationId = readSingleParam(params.loc);
  return { q, source: source === "direct" || source === "providerStaff" || source === "providerFleet" ? source : undefined, vehicleType, locationId };
}

function readSingleParam(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/* ──────────────────── Mobile Offering Card ──────────────────── */
function MobileOfferingCard({ service, canCheckout, registerLabel, priceLabel }: { readonly service: PublicOfferingRow; readonly canCheckout: boolean; readonly registerLabel: string; readonly priceLabel: string }): ReactElement {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
      {/* Header: provider + route/vehicle badge */}
      <div className="flex items-center gap-3">
        <ServiceOriginAvatar src={service.ownerLogoUrl} alt={service.ownerName} className="size-8" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-[var(--text-muted)]">{service.ownerName}</p>
        </div>
        {service.routeLabel ? (
          <span className="flex items-center gap-1 rounded-md bg-[var(--ivory)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
            <MapPin className="size-3" aria-hidden="true" />
            {service.routeLabel}
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="mt-3">
        <h2 className="text-[0.9375rem] font-extrabold leading-snug text-[var(--charcoal)]">{service.title}</h2>
        <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-relaxed text-[var(--text-muted)]">{service.description}</p>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{priceLabel}</p>
          <p className="text-sm font-extrabold text-[var(--emerald)]">{service.basePrice}</p>
        </div>
        <div className="flex-1 ml-4">
          <AddToCartButton service={service} canCheckout={canCheckout} registerLabel={registerLabel} />
        </div>
      </div>
    </article>
  );
}

/* ──────────────────── Desktop Offering Card ──────────────────── */
function DesktopOfferingCard({ service, canCheckout, registerLabel, durationLabel, priceLabel, fallbackDuration }: { readonly service: PublicOfferingRow; readonly canCheckout: boolean; readonly registerLabel: string; readonly durationLabel: string; readonly priceLabel: string; readonly fallbackDuration: string }): ReactElement {
  return (
    <article className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white shadow-sm transition-all hover:border-[var(--emerald)]/40 hover:shadow-md">
      {/* Header */}
      <div className="border-b border-[var(--border)] px-5 py-3">
        <div className="flex items-center gap-3">
          <ServiceOriginAvatar src={service.ownerLogoUrl} alt={service.ownerName} className="size-8" />
          <p className="truncate text-xs font-bold text-[var(--text-muted)]">{service.ownerName}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 py-4">
        <h2 className="text-base font-extrabold leading-snug text-[var(--charcoal)]">{service.title}</h2>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]">{service.description}</p>
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--border)] px-5 py-4">
        <div className="mb-3 grid grid-cols-2 gap-4">
          <MetaValue label={priceLabel} value={service.basePrice} accent />
          <MetaValue label={durationLabel} value={service.vehicleType ?? service.routeLabel ?? fallbackDuration} />
        </div>
        <AddToCartButton service={service} canCheckout={canCheckout} registerLabel={registerLabel} />
      </div>
    </article>
  );
}

function MetaValue({ label, value, accent = false }: { readonly label: string; readonly value: string; readonly accent?: boolean }): ReactElement {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
      <p className={accent ? "mt-0.5 truncate text-sm font-extrabold text-[var(--emerald)]" : "mt-0.5 truncate text-sm font-extrabold text-[var(--charcoal)]"}>{value}</p>
    </div>
  );
}

function EmptyOfferings({ message }: { readonly message: string }): ReactElement {
  return <div className="col-span-full rounded-xl border border-dashed border-[var(--border)] bg-white p-8 text-center text-sm font-semibold leading-6 text-[var(--text-muted)]">{message}</div>;
}
