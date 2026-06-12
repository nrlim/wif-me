import type { ReactElement } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { UserRole } from "@prisma/client";
import { Link } from "@/i18n/routing";
import { DataListPagination } from "@/components/shared/data-list-pagination";
import { DataListToolbar } from "@/components/shared/data-list-toolbar";
import { getAdminWithdrawals, type AdminWithdrawalRow } from "@/lib/admin/withdrawals";
import { requireRoleSession } from "@/lib/auth/current-session";
import { withdrawalStatusToKey } from "@/lib/admin/mappers";

export const metadata: Metadata = { title: "Manage Penarikan" };

type PageProps = { readonly searchParams: Promise<{ readonly q?: string; readonly status?: string; readonly sort?: string }> };

export default async function AdminWithdrawalsPage({ searchParams }: PageProps): Promise<ReactElement> {
  await requireRoleSession([UserRole.ADMIN]);
  const query = await searchParams;
  const t = await getTranslations("Admin.finance");
  const list = await getTranslations("Admin.list");
  const rows = await getAdminWithdrawals(query);
  return <div className="flex flex-col gap-6"><section className="hidden max-w-3xl md:block"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("withdrawals.eyebrow")}</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)]">{t("withdrawals.title")}</h1><p className="mt-3 text-sm font-medium leading-7 text-[var(--text-muted)]">{t("withdrawals.description")}</p></section><DataListToolbar searchLabel={list("search")} searchPlaceholder={list("searchPlaceholder")} filterLabel={list("filter")} sortLabel={list("sort")} actionLabel={list("apply")} filterName="status" filterOptions={[{ value: "", label: list("all") }, { value: "review", label: t("withdrawalStatuses.review") }, { value: "approved", label: t("withdrawalStatuses.approved") }, { value: "paid", label: t("withdrawalStatuses.paid") }, { value: "rejected", label: t("withdrawalStatuses.rejected") }]} sortOptions={[{ value: "latest", label: list("latest") }, { value: "amount", label: list("highest") }]} /><section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white"><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[var(--ivory)] text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]"><tr><th className="px-5 py-4">{t("table.id")}</th><th className="px-5 py-4">{t("table.partner")}</th><th className="px-5 py-4">{t("withdrawals.bank")}</th><th className="px-5 py-4">{t("table.amount")}</th><th className="px-5 py-4">{t("table.status")}</th><th className="px-5 py-4">{t("table.action")}</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{rows.map((row) => <WithdrawalRow key={row.id} row={row} t={t} />)}</tbody></table></div><div className="grid gap-3 p-3 md:hidden">{rows.map((row) => <WithdrawalCard key={row.id} row={row} t={t} />)}</div><DataListPagination label={list("page")} previousLabel={list("previous")} nextLabel={list("next")} /></section></div>;
}

function WithdrawalRow({ row, t }: { readonly row: AdminWithdrawalRow; readonly t: (key: string) => string }): ReactElement {
  const status = withdrawalStatusToKey(row.status);
  return <tr><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{row.id.slice(0, 8)}</td><td className="px-5 py-4"><p className="font-extrabold text-[var(--charcoal)]">{row.partnerName}</p><p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{row.partnerEmail}</p></td><td className="px-5 py-4 font-bold text-[var(--text-muted)]">{row.bankName} · {row.accountLast4}</td><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{row.amount}</td><td className="px-5 py-4"><Status label={t(`withdrawalStatuses.${status}`)} status={status} /></td><td className="px-5 py-4"><Link href={`/admin/escrow/withdrawals/${row.id}/review`} className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 font-extrabold text-[var(--charcoal)]">{t("actions.review")}</Link></td></tr>;
}

function WithdrawalCard({ row, t }: { readonly row: AdminWithdrawalRow; readonly t: (key: string) => string }): ReactElement {
  const status = withdrawalStatusToKey(row.status);
  return <article className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"><div className="flex justify-between gap-3"><p className="text-xs font-extrabold text-[var(--gold)]">{row.id.slice(0, 8)}</p><Status label={t(`withdrawalStatuses.${status}`)} status={status} /></div><h2 className="mt-3 font-extrabold text-[var(--charcoal)]">{row.partnerName}</h2><p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{row.bankName} · {row.accountLast4}</p><p className="mt-3 text-lg font-extrabold text-[var(--charcoal)]">{row.amount}</p><Link href={`/admin/escrow/withdrawals/${row.id}/review`} className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 text-xs font-extrabold text-[var(--charcoal)]">{t("actions.review")}</Link></article>;
}

function Status({ label, status }: { readonly label: string; readonly status: string }): ReactElement { let colors = "bg-[var(--emerald)]/10 text-[var(--emerald)]"; if (status === "review" || status === "approved") colors = "bg-[var(--gold)]/10 text-[var(--gold)]"; if (status === "rejected") colors = "bg-[var(--error)]/10 text-[var(--error)]"; return <span className={`rounded-md px-3 py-1 text-xs font-extrabold ${colors}`}>{label}</span>; }
