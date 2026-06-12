import type { Metadata } from "next";
import type { ReactElement } from "react";
import { CreditCard } from "lucide-react";
import { UserRole } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { DataListPagination } from "@/components/shared/data-list-pagination";
import { DataListToolbar } from "@/components/shared/data-list-toolbar";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { PartnerEarningsList } from "@/components/shared/partner-dashboard-widgets";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRoleSession } from "@/lib/auth/current-session";
import { paymentStatusVariant } from "@/lib/jamaah/status";
import { getPartnerDashboard, getPartnerEarnings, type PartnerEarningRow } from "@/lib/partner/data";

export const metadata: Metadata = { title: "Pendapatan Muthawif" };

export default async function MuthawifEarningsPage(): Promise<ReactElement> {
  const session = await requireRoleSession([UserRole.MUTHAWIF]);
  const [t, common, statusT, dashboard, rows] = await Promise.all([
    getTranslations("Partner.muthawif.earnings"),
    getTranslations("Partner.common"),
    getTranslations("Jamaah.status"),
    getPartnerDashboard(session.userId),
    getPartnerEarnings(session.userId),
  ]);

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <DashboardPageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <section className="hidden rounded-xl border border-[var(--border)] bg-white md:grid md:grid-cols-2 md:divide-x md:divide-[var(--border)]"><Metric label={t("summary.escrow")} value={dashboard.escrowAmount} /><Metric label={t("summary.released")} value={dashboard.releasedAmount} /></section>
      <DataListToolbar searchLabel={common("search")} searchPlaceholder={t("searchPlaceholder")} filterLabel={common("status")} sortLabel={common("sort")} actionLabel={common("apply")} filterName="status" filterOptions={[{ value: "", label: common("all") }, { value: "HELD_IN_ESCROW", label: statusT("payment.HELD_IN_ESCROW") }, { value: "RELEASED", label: statusT("payment.RELEASED") }]} sortOptions={[{ value: "latest", label: common("latest") }, { value: "amount", label: common("amount") }]} />
      <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        {rows.length > 0 ? <><div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-[var(--ivory)] text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]"><tr><th scope="col" className="px-5 py-4">{common("reference")}</th><th scope="col" className="px-5 py-4">{common("service")}</th><th scope="col" className="px-5 py-4">{common("customer")}</th><th scope="col" className="px-5 py-4">{common("amount")}</th><th scope="col" className="px-5 py-4">{common("status")}</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{rows.map((row) => <EarningTableRow key={row.id} row={row} statusLabel={(status) => statusT(`payment.${status}`)} />)}</tbody></table></div><PartnerEarningsList rows={rows} emptyLabel={t("empty.description")} detailLabel={t("detailLabel")} statusLabel={(status) => statusT(`payment.${status}`)} /></> : <EmptyState title={t("empty.title")} description={t("empty.description")} />}
        <DataListPagination label={common("pageSummary", { total: rows.length })} previousLabel={common("previous")} nextLabel={common("next")} />
      </section>
    </div>
  );
}

function EarningTableRow({ row, statusLabel }: { readonly row: PartnerEarningRow; readonly statusLabel: (status: string) => string }): ReactElement {
  return <tr><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{row.reference}</td><td className="px-5 py-4 font-bold text-[var(--text-muted)]">{row.serviceTitle}</td><td className="px-5 py-4 font-bold text-[var(--text-muted)]">{row.customerName}</td><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{row.amount}</td><td className="px-5 py-4"><StatusBadge label={statusLabel(row.status)} variant={paymentStatusVariant(row.status)} /></td></tr>;
}

function Metric({ label, value }: { readonly label: string; readonly value: string }): ReactElement {
  return <div className="flex items-center gap-4 p-5"><CreditCard className="size-6 text-[var(--emerald)]" aria-hidden="true" /><div><p className="text-sm font-bold text-[var(--text-muted)]">{label}</p><p className="text-2xl font-black text-[var(--charcoal)]">{value}</p></div></div>;
}

function EmptyState({ title, description }: { readonly title: string; readonly description: string }): ReactElement {
  return <div className="grid min-h-56 place-items-center p-5 text-center"><div className="max-w-sm"><CreditCard className="mx-auto size-9 text-[var(--text-muted)]" aria-hidden="true" /><h2 className="mt-3 font-extrabold text-[var(--charcoal)]">{title}</h2><p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-muted)]">{description}</p></div></div>;
}
