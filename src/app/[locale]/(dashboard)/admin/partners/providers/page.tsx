import type { ReactElement } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/routing";
import { DataListPagination } from "@/components/shared/data-list-pagination";
import { DataListToolbar } from "@/components/shared/data-list-toolbar";
import { PartnerList } from "@/components/shared/partner-list";
import { getPartners } from "@/lib/admin/data";
import { serviceTypeToKey, verificationStatusToPartnerKey } from "@/lib/admin/mappers";

export const metadata: Metadata = { title: "Manage Provider" };

export default async function AdminProvidersPage(): Promise<ReactElement> {
  const t = await getTranslations("Admin.partners");
  const list = await getTranslations("Admin.list");
  const partners = (await getPartners("provider")).map((partner) => { const statusKey = verificationStatusToPartnerKey(partner.status); return { id: partner.id, name: partner.name, type: partner.type, typeLabel: t(`types.${partner.type}`), serviceLabel: t(`services.${serviceTypeToKey(partner.serviceKey)}`), city: partner.city, bookings: partner.bookings, statusLabel: t(`statuses.${statusKey}`), statusKey }; });

  return <div className="flex flex-col gap-6"><section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div className="hidden max-w-3xl md:block"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("providerPage.eyebrow")}</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)]">{t("providerPage.title")}</h1><p className="mt-3 text-sm font-medium leading-7 text-[var(--text-muted)]">{t("providerPage.description")}</p></div><Link href="/admin/partners/providers/new" className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-[var(--emerald)] px-4 text-sm font-extrabold !text-white"><Plus className="size-4 text-white" aria-hidden="true" />{t("actions.add")}</Link></section><DataListToolbar searchLabel={list("search")} searchPlaceholder={list("searchPlaceholder")} filterLabel={list("filter")} sortLabel={list("sort")} actionLabel={list("apply")} filterName="status" filterOptions={[{ value: "", label: list("all") }, { value: "verified", label: t("statuses.verified") }, { value: "review", label: t("statuses.review") }, { value: "paused", label: t("statuses.paused") }]} sortOptions={[{ value: "latest", label: list("latest") }, { value: "oldest", label: list("oldest") }, { value: "bookings", label: t("table.bookings") }]} /><PartnerList partners={partners} text={{ tableTitle: t("providerPage.tableTitle"), partner: t("table.partner"), service: t("table.service"), city: t("table.city"), bookings: t("table.bookings"), status: t("table.status"), action: t("table.action"), review: t("actions.edit"), delete: t("actions.delete") }} actionBasePath="/admin/partners/providers" /><DataListPagination label={list("pageProviders")} previousLabel={list("previous")} nextLabel={list("next")} /></div>;
}
