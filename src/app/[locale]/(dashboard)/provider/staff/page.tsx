import type { Metadata } from "next";
import type { ReactElement } from "react";
import { Plus, Users } from "lucide-react";
import { UserRole, type ProviderStaffStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { redirect } from "next/navigation";
import { DataListPagination } from "@/components/shared/data-list-pagination";
import { DataListToolbar } from "@/components/shared/data-list-toolbar";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { InviteActions } from "@/components/shared/invite-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getPartnerDashboard } from "@/lib/partner/data";
import { getProviderStaffRows, type ProviderStaffRow } from "@/lib/provider-management/data";

export const metadata: Metadata = { title: "Manajemen Staf Provider" };

export default async function ProviderStaffPage(): Promise<ReactElement> {
  const session = await requireRoleSession([UserRole.PROVIDER]);
  const [t, common, rows, dashboard] = await Promise.all([
    getTranslations("Partner.provider.staff"),
    getTranslations("Partner.common"),
    getProviderStaffRows(session.userId),
    getPartnerDashboard(session.userId),
  ]);

  if (dashboard.verificationStatus !== "APPROVED") {
    redirect("/provider");
  }

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <DashboardPageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
        <Link href="/provider/staff/new" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--emerald)] px-4 text-sm font-extrabold text-white md:w-fit"><Plus className="size-4" aria-hidden="true" />{t("add")}</Link>
      </section>
      <DataListToolbar searchLabel={common("search")} searchPlaceholder={t("searchPlaceholder")} filterLabel={common("status")} sortLabel={common("sort")} actionLabel={common("apply")} filterName="status" filterOptions={[{ value: "", label: common("all") }, { value: "ACTIVE", label: t("statuses.ACTIVE") }, { value: "ON_DUTY", label: t("statuses.ON_DUTY") }, { value: "INACTIVE", label: t("statuses.INACTIVE") }]} sortOptions={[{ value: "latest", label: common("latest") }, { value: "name", label: t("columns.name") }]} />
      <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        {rows.length > 0 ? <><div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-[var(--ivory)] text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]"><tr><th scope="col" className="px-5 py-4">{t("columns.name")}</th><th scope="col" className="px-5 py-4">{t("columns.role")}</th><th scope="col" className="px-5 py-4">{t("columns.languages")}</th><th scope="col" className="px-5 py-4">{t("columns.price")}</th><th scope="col" className="px-5 py-4">{t("columns.status")}</th><th scope="col" className="px-5 py-4 text-right">{t("columns.action")}</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{rows.map((row) => <StaffTableRow key={row.id} row={row} providerName={dashboard.displayName} statusLabel={(status) => t(`statuses.${status}`)} editLabel={t("edit")} deleteLabel={t("delete")} inviteLabels={{ share: t("invite.share"), copyLink: t("invite.copyLink"), copied: t("invite.copied"), pending: t("invite.pending") }} />)}</tbody></table></div><div className="grid gap-3 p-3 md:hidden">{rows.map((row) => <StaffMobileCard key={row.id} row={row} providerName={dashboard.displayName} statusLabel={(status) => t(`statuses.${status}`)} editLabel={t("edit")} deleteLabel={t("delete")} inviteLabels={{ share: t("invite.share"), copyLink: t("invite.copyLink"), copied: t("invite.copied"), pending: t("invite.pending") }} />)}</div></> : <EmptyState title={t("empty.title")} description={t("empty.description")} />}
        <DataListPagination label={common("pageSummary", { total: rows.length })} previousLabel={common("previous")} nextLabel={common("next")} />
      </section>
    </div>
  );
}

type StaffRowProps = {
  readonly row: ProviderStaffRow;
  readonly providerName: string;
  readonly statusLabel: (status: ProviderStaffStatus) => string;
  readonly editLabel: string;
  readonly deleteLabel: string;
  readonly inviteLabels: { readonly share: string; readonly copyLink: string; readonly copied: string; readonly pending: string };
};

function StaffTableRow({ row, providerName, statusLabel, editLabel, deleteLabel, inviteLabels }: StaffRowProps): ReactElement {
  return <tr><td className="px-5 py-4"><p className="font-extrabold text-[var(--charcoal)]">{row.name}</p><p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{row.phone}</p>{row.email ? <p className="mt-0.5 text-xs font-semibold text-[var(--text-muted)]">{row.email}</p> : null}</td><td className="px-5 py-4 font-bold text-[var(--text-muted)]">{row.roleTitle}</td><td className="px-5 py-4 font-bold text-[var(--text-muted)]">{row.languages.join(", ") || "-"}</td><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{row.basePrice}</td><td className="px-5 py-4"><div className="flex flex-col gap-1.5"><StatusBadge label={statusLabel(row.status)} variant={row.status === "INACTIVE" ? "warning" : "success"} />{row.inviteStatus === "PENDING" ? <StatusBadge label={inviteLabels.pending} variant="warning" /> : null}{row.inviteStatus === "ACCEPTED" ? <StatusBadge label="Terhubung" variant="success" /> : null}</div></td><td className="px-5 py-4"><div className="flex flex-wrap items-center justify-end gap-2">{row.inviteToken && row.inviteStatus === "PENDING" ? <InviteActions inviteToken={row.inviteToken} staffName={row.name} providerName={providerName} labels={inviteLabels} /> : null}<Link href={`/provider/staff/${row.id}/edit`} className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[var(--border)] px-3 text-xs font-extrabold text-[var(--charcoal)] transition-colors hover:border-[var(--emerald)] hover:text-[var(--emerald)]">{editLabel}</Link><Link href={`/provider/staff/${row.id}/delete`} className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[var(--border)] px-3 text-xs font-extrabold text-[var(--error)] transition-colors hover:border-red-300 hover:bg-red-50">{deleteLabel}</Link></div></td></tr>;
}

function StaffMobileCard({ row, providerName, statusLabel, editLabel, deleteLabel, inviteLabels }: StaffRowProps): ReactElement {
  return <article className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold text-[var(--text-muted)]">{row.roleTitle}</p><h2 className="mt-1 font-extrabold text-[var(--charcoal)]">{row.name}</h2>{row.email ? <p className="mt-0.5 text-xs font-semibold text-[var(--text-muted)]">{row.email}</p> : null}</div><div className="flex flex-col items-end gap-1"><StatusBadge label={statusLabel(row.status)} variant={row.status === "INACTIVE" ? "warning" : "success"} />{row.inviteStatus === "PENDING" ? <StatusBadge label={inviteLabels.pending} variant="warning" /> : null}{row.inviteStatus === "ACCEPTED" ? <StatusBadge label="Terhubung" variant="success" /> : null}</div></div><p className="mt-2 text-sm font-semibold text-[var(--text-muted)]">{row.languages.join(", ") || "-"}</p><p className="mt-3 text-base font-extrabold text-[var(--charcoal)]">{row.basePrice}</p><div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">{row.inviteToken && row.inviteStatus === "PENDING" ? <InviteActions inviteToken={row.inviteToken} staffName={row.name} providerName={providerName} labels={inviteLabels} /> : null}<Link href={`/provider/staff/${row.id}/edit`} className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-extrabold text-[var(--charcoal)] transition-colors hover:border-[var(--emerald)] hover:text-[var(--emerald)]">{editLabel}</Link><Link href={`/provider/staff/${row.id}/delete`} className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-extrabold text-[var(--error)] transition-colors hover:border-red-300 hover:bg-red-50">{deleteLabel}</Link></div></article>;
}

function EmptyState({ title, description }: { readonly title: string; readonly description: string }): ReactElement {
  return <div className="grid min-h-56 place-items-center p-5 text-center"><div className="max-w-sm"><Users className="mx-auto size-9 text-[var(--text-muted)]" aria-hidden="true" /><h2 className="mt-3 font-extrabold text-[var(--charcoal)]">{title}</h2><p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-muted)]">{description}</p></div></div>;
}
