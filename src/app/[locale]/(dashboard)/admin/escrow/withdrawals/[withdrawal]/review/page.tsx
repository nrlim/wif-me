import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { UserRole, WithdrawalStatus } from "@prisma/client";
import { Link } from "@/i18n/routing";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { getAdminWithdrawalDetail } from "@/lib/admin/withdrawals";
import { requireRoleSession } from "@/lib/auth/current-session";
import { withdrawalStatusToKey } from "@/lib/admin/mappers";
import { approveWithdrawalAction, markWithdrawalPaidAction, rejectWithdrawalAction } from "./actions";

export const metadata: Metadata = { title: "Review Penarikan" };

type WithdrawalReviewProps = { readonly params: Promise<{ readonly locale: string; readonly withdrawal: string }>; readonly searchParams: Promise<{ readonly notice?: string }> };

export default async function WithdrawalReviewPage({ params, searchParams }: WithdrawalReviewProps): Promise<ReactElement> {
  await requireRoleSession([UserRole.ADMIN]);
  const [{ locale, withdrawal }, query] = await Promise.all([params, searchParams]);
  const row = await getAdminWithdrawalDetail(decodeURIComponent(withdrawal));
  if (!row) notFound();
  const t = await getTranslations("Admin.finance");
  const status = withdrawalStatusToKey(row.status);
  return <div className="flex flex-col gap-5"><DashboardPageHeader eyebrow={t("withdrawals.eyebrow")} title={t("withdrawals.reviewTitle", { id: row.id.slice(0, 8) })} description={t("withdrawals.reviewDescription")} /><Notice notice={query.notice} t={t} /><section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start"><div className="rounded-xl border border-[var(--border)] bg-white p-5"><dl className="grid gap-4 sm:grid-cols-2"><Item label={t("table.partner")} value={row.partnerName} /><Item label={t("withdrawals.partnerEmail")} value={row.partnerEmail} /><Item label={t("table.amount")} value={row.amount} /><Item label={t("table.status")} value={t(`withdrawalStatuses.${status}`)} /><Item label={t("withdrawals.bank")} value={row.bankName} /><Item label={t("withdrawals.accountName")} value={row.accountName} /><Item label={t("withdrawals.accountNumber")} value={row.accountNumber ?? `****${row.accountLast4}`} /><Item label={t("withdrawals.requestedNote")} value={row.requestedNote ?? "-"} /></dl><Link href="/admin/escrow/withdrawals" className="mt-5 inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 font-extrabold text-[var(--charcoal)]">{t("actions.back")}</Link></div><aside className="rounded-xl border border-[var(--border)] bg-white p-5"><h2 className="font-extrabold text-[var(--charcoal)]">{t("withdrawals.actionTitle")}</h2><p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-muted)]">{t("withdrawals.actionDescription")}</p><WithdrawalActions locale={locale} id={row.id} status={row.status} t={t} /></aside></section></div>;
}

function WithdrawalActions({ locale, id, status, t }: { readonly locale: string; readonly id: string; readonly status: WithdrawalStatus; readonly t: (key: string) => string }): ReactElement {
  return <div className="mt-5 grid gap-3">{status === WithdrawalStatus.REVIEW ? <form action={approveWithdrawalAction}><Hidden locale={locale} id={id} /><button className="min-h-11 w-full rounded-lg bg-[var(--emerald)] px-4 text-sm font-extrabold text-white">{t("actions.approve")}</button></form> : null}{status === WithdrawalStatus.APPROVED ? <form action={markWithdrawalPaidAction}><Hidden locale={locale} id={id} /><button className="min-h-11 w-full rounded-lg bg-[var(--emerald)] px-4 text-sm font-extrabold text-white">{t("withdrawals.markPaid")}</button></form> : null}{status === WithdrawalStatus.REVIEW || status === WithdrawalStatus.APPROVED ? <form action={rejectWithdrawalAction} className="grid gap-3 border-t border-[var(--border)] pt-4"><Hidden locale={locale} id={id} /><label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="reviewNote">{t("withdrawals.reviewNote")}<textarea id="reviewNote" name="reviewNote" className="min-h-24 rounded-lg border border-[#dfe4df] bg-[#fbfaf6] px-3 py-3 text-sm font-semibold text-[var(--charcoal)] outline-none focus:border-[var(--emerald)] focus:bg-white" required /></label><button className="min-h-11 w-full rounded-lg border border-red-100 bg-red-50 px-4 text-sm font-extrabold text-[var(--error)]">{t("withdrawals.reject")}</button></form> : <p className="rounded-lg bg-[var(--ivory)] p-3 text-sm font-bold text-[var(--text-muted)]">{t("withdrawals.finalState")}</p>}</div>;
}

function Hidden({ locale, id }: { readonly locale: string; readonly id: string }): ReactElement { return <><input type="hidden" name="locale" value={locale} /><input type="hidden" name="withdrawalId" value={id} /></>; }
function Item({ label, value }: { readonly label: string; readonly value: string }): ReactElement { return <div className="rounded-lg bg-[var(--ivory)] p-4"><dt className="text-xs font-bold text-[var(--text-muted)]">{label}</dt><dd className="mt-1 break-words font-extrabold text-[var(--charcoal)]">{value}</dd></div>; }
function Notice({ notice, t }: { readonly notice?: string; readonly t: (key: string) => string }): ReactElement | null { if (!notice) return null; return <p className="rounded-lg border border-[var(--emerald)]/20 bg-[var(--emerald)]/10 p-3 text-sm font-bold text-[var(--emerald)]">{t(`withdrawals.notices.${notice}`)}</p>; }
