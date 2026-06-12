import type { Metadata } from "next";
import type { ReactElement } from "react";
import { CarFront, Plus } from "lucide-react";
import { UserRole, type ProviderFleetStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { redirect } from "next/navigation";
import { DataListPagination } from "@/components/shared/data-list-pagination";
import { DataListToolbar } from "@/components/shared/data-list-toolbar";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getPartnerDashboard } from "@/lib/partner/data";
import { getProviderFleetRows, type ProviderFleetRow } from "@/lib/provider-management/data";

export const metadata: Metadata = { title: "Armada Provider" };

export default async function ProviderFleetPage(): Promise<ReactElement> {
  const session = await requireRoleSession([UserRole.PROVIDER]);
  const [t, common, rows, dashboard] = await Promise.all([
    getTranslations("Partner.provider.fleet"),
    getTranslations("Partner.common"),
    getProviderFleetRows(session.userId),
    getPartnerDashboard(session.userId),
  ]);

  if (dashboard.verificationStatus !== "APPROVED") {
    redirect("/provider");
  }

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <DashboardPageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
        <Link href="/provider/fleet/new" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--emerald)] px-4 text-sm font-extrabold text-white md:w-fit"><Plus className="size-4" aria-hidden="true" />{t("add")}</Link>
      </section>
      <DataListToolbar searchLabel={common("search")} searchPlaceholder={t("searchPlaceholder")} filterLabel={common("status")} sortLabel={common("sort")} actionLabel={common("apply")} filterName="status" filterOptions={[{ value: "", label: common("all") }, { value: "AVAILABLE", label: t("statuses.AVAILABLE") }, { value: "ASSIGNED", label: t("statuses.ASSIGNED") }, { value: "MAINTENANCE", label: t("statuses.MAINTENANCE") }]} sortOptions={[{ value: "latest", label: common("latest") }, { value: "name", label: t("columns.vehicle") }]} />
      <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        {rows.length > 0 ? <><div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-[var(--ivory)] text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]"><tr><th scope="col" className="px-5 py-4">{t("columns.vehicle")}</th><th scope="col" className="px-5 py-4">{t("columns.type")}</th><th scope="col" className="px-5 py-4">{t("columns.capacity")}</th><th scope="col" className="px-5 py-4">{t("columns.city")}</th><th scope="col" className="px-5 py-4">{t("columns.price")}</th><th scope="col" className="px-5 py-4">{t("columns.status")}</th><th scope="col" className="px-5 py-4 text-right">{t("columns.action")}</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{rows.map((row) => <FleetTableRow key={row.id} row={row} statusLabel={(status) => t(`statuses.${status}`)} editLabel={t("edit")} deleteLabel={t("delete")} />)}</tbody></table></div><div className="grid gap-3 p-3 md:hidden">{rows.map((row) => <FleetMobileCard key={row.id} row={row} statusLabel={(status) => t(`statuses.${status}`)} editLabel={t("edit")} deleteLabel={t("delete")} />)}</div></> : <EmptyState title={t("empty.title")} description={t("empty.description")} />}
        <DataListPagination label={common("pageSummary", { total: rows.length })} previousLabel={common("previous")} nextLabel={common("next")} />
      </section>
    </div>
  );
}

function FleetTableRow({ row, statusLabel, editLabel, deleteLabel }: { readonly row: ProviderFleetRow; readonly statusLabel: (status: ProviderFleetStatus) => string; readonly editLabel: string; readonly deleteLabel: string }): ReactElement {
  return <tr><td className="px-5 py-4"><p className="font-extrabold text-[var(--charcoal)]">{row.vehicleName}</p><p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{row.plateNumber}</p></td><td className="px-5 py-4 font-bold text-[var(--text-muted)]">{row.vehicleType}</td><td className="px-5 py-4 font-bold text-[var(--text-muted)]">{row.capacity}</td><td className="px-5 py-4 font-bold text-[var(--text-muted)]">{row.baseCity}</td><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{row.basePrice}</td><td className="px-5 py-4"><StatusBadge label={statusLabel(row.status)} variant={row.status === "MAINTENANCE" ? "warning" : "success"} /></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Link href={`/provider/fleet/${row.id}/edit`} className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 font-extrabold text-[var(--charcoal)]">{editLabel}</Link><Link href={`/provider/fleet/${row.id}/delete`} className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 font-extrabold text-[var(--error)]">{deleteLabel}</Link></div></td></tr>;
}

function FleetMobileCard({ row, statusLabel, editLabel, deleteLabel }: { readonly row: ProviderFleetRow; readonly statusLabel: (status: ProviderFleetStatus) => string; readonly editLabel: string; readonly deleteLabel: string }): ReactElement {
  return <article className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold text-[var(--text-muted)]">{row.vehicleType} · {row.capacity}</p><h2 className="mt-1 font-extrabold text-[var(--charcoal)]">{row.vehicleName}</h2></div><StatusBadge label={statusLabel(row.status)} variant={row.status === "MAINTENANCE" ? "warning" : "success"} /></div><p className="mt-2 text-sm font-semibold text-[var(--text-muted)]">{row.plateNumber} · {row.baseCity}</p><p className="mt-3 text-base font-extrabold text-[var(--charcoal)]">{row.basePrice}</p><div className="mt-4 flex gap-2"><Link href={`/provider/fleet/${row.id}/edit`} className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-extrabold text-[var(--charcoal)]">{editLabel}</Link><Link href={`/provider/fleet/${row.id}/delete`} className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-extrabold text-[var(--error)]">{deleteLabel}</Link></div></article>;
}

function EmptyState({ title, description }: { readonly title: string; readonly description: string }): ReactElement {
  return <div className="grid min-h-56 place-items-center p-5 text-center"><div className="max-w-sm"><CarFront className="mx-auto size-9 text-[var(--text-muted)]" aria-hidden="true" /><h2 className="mt-3 font-extrabold text-[var(--charcoal)]">{title}</h2><p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-muted)]">{description}</p></div></div>;
}
