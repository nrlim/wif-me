import { LocationType } from "@prisma/client";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactElement } from "react";
import { MapPin, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ConfirmActionForm } from "@/components/shared/confirm-action-form";
import { getAdminLocationList, type AdminLocationRow } from "@/lib/admin/locations";
import { locationListQuerySchema, type LocationListQuery } from "@/lib/validators/locations";
import { deleteAdminLocation } from "./actions";

export const metadata: Metadata = { title: "Lookup Lokasi" };

const LOCATION_TYPES: readonly LocationType[] = ["CITY", "AIRPORT", "TRAIN_STATION", "HOLY_SITE"];

type LocationsPageProps = {
  readonly params: Promise<{ readonly locale: string }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type LocationText = {
  readonly types: Record<LocationType, string>;
  readonly master: string;
  readonly custom: string;
  readonly edit: string;
  readonly delete: string;
  readonly deleteTitle: string;
  readonly deleteDescription: string;
  readonly cancel: string;
  readonly services: string;
  readonly providers: string;
  readonly country: string;
  readonly sortName: string;
  readonly sortType: string;
  readonly sortCountry: string;
  readonly sortLatest: string;
  readonly asc: string;
  readonly desc: string;
  readonly perPage: string;
};

export default async function AdminLocationsPage({ params, searchParams }: LocationsPageProps): Promise<ReactElement> {
  const [{ locale }, rawSearchParams] = await Promise.all([params, searchParams]);
  const query = locationListQuerySchema.parse(rawSearchParams);
  const [t, list, locations] = await Promise.all([
    getTranslations("Admin.locations"),
    getTranslations("Admin.list"),
    getAdminLocationList(query),
  ]);
  const text = getLocationText(t);

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="hidden max-w-3xl md:block">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("eyebrow")}</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)] md:text-3xl">{t("title")}</h1>
          <p className="mt-3 text-sm font-medium leading-7 text-[var(--text-muted)]">{t("description")}</p>
        </div>
        <Link href="/admin/lookup/locations/new" className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-[var(--emerald)] px-4 text-sm font-extrabold !text-white">
          <Plus className="size-4 text-white" aria-hidden="true" />
          {t("form.createTitle")}
        </Link>
      </section>

      <LocationFilterForm query={query} searchLabel={list("search")} searchPlaceholder={t("filters.searchPlaceholder")} filterLabel={list("filter")} sortLabel={list("sort")} actionLabel={list("apply")} allLabel={list("all")} text={text} />

      <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[0_10px_28px_rgba(22,33,28,0.05)]">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
                <thead className="bg-[var(--ivory)] text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  <tr><th scope="col" className="px-5 py-4">{t("fields.location")}</th><th scope="col" className="px-5 py-4">{t("fields.type")}</th><th scope="col" className="px-5 py-4">{t("fields.country")}</th><th scope="col" className="px-5 py-4">{t("fields.usage")}</th><th scope="col" className="px-5 py-4">{list("status")}</th><th scope="col" className="px-5 py-4">{t("fields.action")}</th></tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">{locations.rows.map((location) => <LocationTableRow key={location.id} locale={locale} location={location} text={text} />)}</tbody>
              </table>
            </div>
            <div className="grid gap-3 p-3 md:hidden">{locations.rows.map((location) => <LocationCard key={location.id} locale={locale} location={location} text={text} />)}</div>
          {locations.rows.length === 0 ? <p className="p-5 text-sm font-bold text-[var(--text-muted)]">{t("empty")}</p> : null}
          <LocationPagination query={query} page={locations.page} pageCount={locations.pageCount} total={locations.total} previousLabel={list("previous")} nextLabel={list("next")} label={t("pagination", { count: locations.rows.length, total: locations.total })} />
        </section>
    </div>
  );
}

function LocationFilterForm({ query, searchLabel, searchPlaceholder, filterLabel, sortLabel, actionLabel, allLabel, text }: { readonly query: LocationListQuery; readonly searchLabel: string; readonly searchPlaceholder: string; readonly filterLabel: string; readonly sortLabel: string; readonly actionLabel: string; readonly allLabel: string; readonly text: LocationText }): ReactElement {
  return (
    <form className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-white p-3" method="get">
      <label className="grid w-full gap-1.5 text-xs font-extrabold text-[var(--charcoal)] md:w-auto md:min-w-[200px] md:flex-1" htmlFor="q">
        <span className="sr-only md:not-sr-only">{searchLabel}</span>
        <span className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
          <input id="q" name="q" type="search" className="auth-input auth-input-icon w-full" defaultValue={query.q} placeholder={searchPlaceholder} />
        </span>
      </label>
      <label className="grid w-[calc(50%-6px)] gap-1.5 text-xs font-extrabold text-[var(--charcoal)] md:w-auto" htmlFor="type">
        <span className="sr-only md:not-sr-only">{filterLabel}</span>
        <select id="type" name="type" defaultValue={query.type} className="auth-select w-full md:w-[130px]">
          <option value="">{allLabel}</option>
          {LOCATION_TYPES.map((type) => <option key={type} value={type}>{text.types[type]}</option>)}
        </select>
      </label>
      <label className="grid w-[calc(50%-6px)] gap-1.5 text-xs font-extrabold text-[var(--charcoal)] md:w-auto" htmlFor="countryCode">
        <span className="sr-only md:not-sr-only">{text.country}</span>
        <input id="countryCode" name="countryCode" defaultValue={query.countryCode} className="auth-input w-full uppercase md:w-[80px]" placeholder="SA" maxLength={2} />
      </label>
      <label className="grid w-[calc(50%-6px)] gap-1.5 text-xs font-extrabold text-[var(--charcoal)] md:w-auto" htmlFor="isMaster">
        <span className="sr-only md:not-sr-only">{filterLabel}</span>
        <select id="isMaster" name="isMaster" defaultValue={query.isMaster} className="auth-select w-full md:w-[120px]">
          <option value="">{allLabel}</option>
          <option value="master">{text.master}</option>
          <option value="custom">{text.custom}</option>
        </select>
      </label>
      <label className="grid w-[calc(50%-6px)] gap-1.5 text-xs font-extrabold text-[var(--charcoal)] md:w-auto" htmlFor="sort">
        <span className="sr-only md:not-sr-only">{sortLabel}</span>
        <select id="sort" name="sort" defaultValue={query.sort} className="auth-select w-full md:w-[130px]">
          <option value="name">{text.sortName}</option>
          <option value="type">{text.sortType}</option>
          <option value="countryCode">{text.sortCountry}</option>
          <option value="latest">{text.sortLatest}</option>
        </select>
      </label>
      <label className="grid w-[calc(50%-6px)] gap-1.5 text-xs font-extrabold text-[var(--charcoal)] md:w-auto" htmlFor="order">
        <span className="sr-only md:not-sr-only">{sortLabel}</span>
        <select id="order" name="order" defaultValue={query.order} className="auth-select w-full md:w-[90px]">
          <option value="asc">{text.asc}</option>
          <option value="desc">{text.desc}</option>
        </select>
      </label>
      <label className="grid w-[calc(50%-6px)] gap-1.5 text-xs font-extrabold text-[var(--charcoal)] md:w-auto" htmlFor="perPage">
        <span className="sr-only md:not-sr-only">{text.perPage}</span>
        <select id="perPage" name="perPage" defaultValue={query.perPage} className="auth-select w-full md:w-[80px]">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </label>
      <button type="submit" className="min-h-11 w-full rounded-lg bg-[var(--emerald)] px-5 text-sm font-extrabold text-white md:w-auto">
        {actionLabel}
      </button>
    </form>
  );
}

function LocationTableRow({ locale, location, text }: { readonly locale: string; readonly location: AdminLocationRow; readonly text: LocationText }): ReactElement {
  return <tr><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-[var(--emerald-pale)] text-[var(--emerald)]"><MapPin className="size-5" aria-hidden="true" /></span><p className="font-extrabold text-[var(--charcoal)]">{location.name}</p></div></td><td className="px-5 py-4 font-bold text-[var(--text-muted)]">{text.types[location.type]}</td><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{location.countryCode}</td><td className="px-5 py-4 text-xs font-bold text-[var(--text-muted)]">{text.services}: {location.serviceCount}<br />{text.providers}: {location.providerCount}</td><td className="px-5 py-4"><StatusPill label={location.isMaster ? text.master : text.custom} isMaster={location.isMaster} /></td><td className="px-5 py-4"><LocationActions locale={locale} location={location} text={text} /></td></tr>;
}

function LocationCard({ locale, location, text }: { readonly locale: string; readonly location: AdminLocationRow; readonly text: LocationText }): ReactElement {
  return <article className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--emerald-pale)] text-[var(--emerald)]"><MapPin className="size-5" aria-hidden="true" /></span><div><h2 className="font-extrabold text-[var(--charcoal)]">{location.name}</h2><p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{text.types[location.type]} · {location.countryCode}</p></div></div><StatusPill label={location.isMaster ? text.master : text.custom} isMaster={location.isMaster} /></div><div className="mt-4 flex items-end justify-between gap-4"><p className="text-xs font-bold leading-5 text-[var(--text-muted)]">{text.services}: {location.serviceCount}<br />{text.providers}: {location.providerCount}</p><LocationActions locale={locale} location={location} text={text} compact /></div></article>;
}

function LocationActions({ locale, location, text, compact = false }: { readonly locale: string; readonly location: AdminLocationRow; readonly text: LocationText; readonly compact?: boolean }): ReactElement {
  return <div className="flex gap-2"><Link href={`/admin/lookup/locations/${location.id}/edit`} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 text-xs font-extrabold text-[var(--charcoal)]"><Pencil className="size-3.5" aria-hidden="true" />{compact ? null : text.edit}</Link><ConfirmActionForm action={deleteAdminLocation} fields={[{ name: "locale", value: locale }, { name: "id", value: location.id }]} triggerLabel={text.delete} title={text.deleteTitle} description={text.deleteDescription} confirmLabel={text.delete} cancelLabel={text.cancel} triggerIcon={<Trash2 className="size-3.5" aria-hidden="true" />} /></div>;
}

function StatusPill({ label, isMaster }: { readonly label: string; readonly isMaster: boolean }): ReactElement {
  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-extrabold ${isMaster ? "bg-[var(--emerald)]/10 text-[var(--emerald)]" : "bg-[var(--gold)]/10 text-[var(--gold)]"}`}>{label}</span>;
}

function LocationPagination({ query, page, pageCount, total, previousLabel, nextLabel, label }: { readonly query: LocationListQuery; readonly page: number; readonly pageCount: number; readonly total: number; readonly previousLabel: string; readonly nextLabel: string; readonly label: string }): ReactElement {
  return <div className="flex flex-col gap-3 border-t border-[var(--border)] p-3 text-sm md:flex-row md:items-center md:justify-between"><p className="font-bold text-[var(--text-muted)]">{label}</p><div className="flex gap-2"><Link aria-disabled={page <= 1 || total === 0} href={buildLocationHref(query, Math.max(1, page - 1))} className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 font-extrabold text-[var(--charcoal)] aria-disabled:pointer-events-none aria-disabled:opacity-50">{previousLabel}</Link><Link aria-disabled={page >= pageCount || total === 0} href={buildLocationHref(query, Math.min(pageCount, page + 1))} className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 font-extrabold text-[var(--charcoal)] aria-disabled:pointer-events-none aria-disabled:opacity-50">{nextLabel}</Link></div></div>;
}

function buildLocationHref(query: LocationListQuery, page: number): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.type) params.set("type", query.type);
  if (query.countryCode) params.set("countryCode", query.countryCode);
  if (query.isMaster) params.set("isMaster", query.isMaster);
  params.set("sort", query.sort);
  params.set("order", query.order);
  params.set("perPage", String(query.perPage));
  params.set("page", String(page));
  return `/admin/lookup/locations?${params.toString()}`;
}

function getLocationText(t: Awaited<ReturnType<typeof getTranslations>>): LocationText {
  return { types: getTypeLabels(t), master: t("statuses.master"), custom: t("statuses.custom"), edit: t("actions.edit"), delete: t("actions.delete"), deleteTitle: t("delete.title"), deleteDescription: t("delete.description"), cancel: t("form.cancel"), services: t("fields.services"), providers: t("fields.providers"), country: t("fields.country"), sortName: t("sort.name"), sortType: t("sort.type"), sortCountry: t("sort.country"), sortLatest: t("sort.latest"), asc: t("sort.asc"), desc: t("sort.desc"), perPage: t("filters.perPage") };
}

function getTypeLabels(t: Awaited<ReturnType<typeof getTranslations>>): Record<LocationType, string> {
  return { CITY: t("types.city"), AIRPORT: t("types.airport"), TRAIN_STATION: t("types.trainStation"), HOLY_SITE: t("types.holySite") };
}
