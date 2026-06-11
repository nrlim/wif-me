import type { Metadata } from "next";
import type { ReactElement } from "react";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ServiceType, UserRole } from "@prisma/client";
import { Link } from "@/i18n/routing";
import { DataListPagination } from "@/components/shared/data-list-pagination";
import { DataListToolbar } from "@/components/shared/data-list-toolbar";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { requireRoleSession } from "@/lib/auth/current-session";
import { searchJamaahServices, type JamaahServiceRow } from "@/lib/jamaah/data";
import { serviceSearchQuerySchema } from "@/lib/validators/jamaah";

export const metadata: Metadata = { title: "Cari Layanan" };

type SearchPageProps = {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const SERVICE_TYPES = [
  ServiceType.MUTHAWIF_PERSONAL,
  ServiceType.PROVIDER_MUTHAWIF,
  ServiceType.TRANSPORTATION,
  ServiceType.VISA_PROCESSING,
  ServiceType.ADDITIONAL_SERVICE,
] as const;

export default async function JamaahSearchPage({ searchParams }: SearchPageProps): Promise<ReactElement> {
  await requireRoleSession([UserRole.JAMAAH]);
  const rawParams = await searchParams;
  const query = serviceSearchQuerySchema.parse(rawParams);
  const t = await getTranslations("Jamaah.search");
  const common = await getTranslations("Jamaah.common");
  const services = await searchJamaahServices(query);
  const previousHref = services.page > 1 ? paginationHref("/jamaah/search", rawParams, services.page - 1) : undefined;
  const nextHref = services.page < services.pageCount ? paginationHref("/jamaah/search", rawParams, services.page + 1) : undefined;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <DashboardPageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <DataListToolbar
        searchLabel={common("search")}
        searchPlaceholder={t("searchPlaceholder")}
        filterLabel={common("serviceType")}
        sortLabel={common("sort")}
        actionLabel={common("apply")}
        filterName="serviceType"
        filterOptions={[{ value: "", label: common("all") }, ...SERVICE_TYPES.map((type) => ({ value: type, label: common(`serviceTypes.${type}`) }))]}
        sortOptions={[{ value: "latest", label: common("latest") }, { value: "price", label: common("price") }, { value: "title", label: common("title") }]}
      />

      <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        {services.rows.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--ivory)] text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  <tr><th scope="col" className="px-5 py-4">{common("service")}</th><th scope="col" className="px-5 py-4">{common("provider")}</th><th scope="col" className="px-5 py-4">{common("price")}</th><th scope="col" className="px-5 py-4">{common("action")}</th></tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {services.rows.map((service) => <ServiceTableRow key={service.id} service={service} actionLabel={t("book")} />)}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 p-3 md:hidden">
              {services.rows.map((service) => <ServiceMobileCard key={service.id} service={service} actionLabel={t("book")} />)}
            </div>
          </>
        ) : (
          <div className="grid min-h-56 place-items-center p-5 text-center">
            <div className="max-w-sm"><Search className="mx-auto size-9 text-[var(--text-muted)]" aria-hidden="true" /><h2 className="mt-3 font-extrabold text-[var(--charcoal)]">{t("empty.title")}</h2><p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-muted)]">{t("empty.description")}</p></div>
          </div>
        )}
        <DataListPagination label={common("pageSummary", { page: services.page, pageCount: services.pageCount, total: services.total })} previousLabel={common("previous")} nextLabel={common("next")} previousHref={previousHref} nextHref={nextHref} />
      </section>
    </div>
  );
}

function paginationHref(pathname: string, params: Record<string, string | string[] | undefined>, page: number): string {
  const nextParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key !== "page" && typeof value === "string" && value) nextParams.set(key, value);
  }
  nextParams.set("page", String(page));
  return `${pathname}?${nextParams.toString()}`;
}

function ServiceTableRow({ service, actionLabel }: { readonly service: JamaahServiceRow; readonly actionLabel: string }): ReactElement {
  return <tr><td className="px-5 py-4"><p className="font-extrabold text-[var(--charcoal)]">{service.title}</p><p className="mt-1 max-w-xl text-xs font-semibold leading-5 text-[var(--text-muted)]">{service.description}</p>{service.routeLabel ? <p className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-[var(--gold)]"><MapPin className="size-3" aria-hidden="true" />{service.routeLabel}</p> : null}</td><td className="px-5 py-4 font-bold text-[var(--text-muted)]">{service.ownerName}</td><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{service.basePrice}</td><td className="px-5 py-4"><Link href={`/jamaah/checkout?serviceId=${service.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--emerald)] px-4 font-extrabold text-white">{actionLabel}<ArrowRight className="size-4" aria-hidden="true" /></Link></td></tr>;
}

function ServiceMobileCard({ service, actionLabel }: { readonly service: JamaahServiceRow; readonly actionLabel: string }): ReactElement {
  return <article className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold text-[var(--text-muted)]">{service.categoryTitle}</p><h2 className="mt-1 font-extrabold text-[var(--charcoal)]">{service.title}</h2></div><p className="text-right text-sm font-black text-[var(--charcoal)]">{service.basePrice}</p></div><p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-muted)]">{service.description}</p><div className="mt-4 flex items-end justify-between gap-3"><div><p className="text-xs font-bold text-[var(--text-muted)]">{service.ownerName}</p>{service.routeLabel ? <p className="mt-1 text-xs font-extrabold text-[var(--gold)]">{service.routeLabel}</p> : null}</div><Link href={`/jamaah/checkout?serviceId=${service.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[var(--emerald)] px-3 text-xs font-extrabold text-white">{actionLabel}<ArrowRight className="size-4" aria-hidden="true" /></Link></div></article>;
}
