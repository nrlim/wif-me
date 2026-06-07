import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { getWithdrawalById } from "@/lib/admin/data";
import { withdrawalStatusToKey } from "@/lib/admin/mappers";

export const metadata: Metadata = { title: "Review Penarikan" };

type WithdrawalReviewProps = { readonly params: Promise<{ readonly withdrawal: string }> };

export default async function WithdrawalReviewPage({ params }: WithdrawalReviewProps): Promise<ReactElement> {
  const { withdrawal } = await params;
  const row = await getWithdrawalById(decodeURIComponent(withdrawal));
  if (!row) notFound();
  const t = await getTranslations("Admin.finance");
  return <div className="flex flex-col gap-5"><DashboardPageHeader eyebrow={t("withdrawals.eyebrow")} title={t("withdrawals.reviewTitle", { id: row.id.slice(0, 8) })} description={t("withdrawals.reviewDescription")} /><section className="max-w-3xl rounded-xl border border-[var(--border)] bg-white p-5"><dl className="grid gap-4 sm:grid-cols-2"><Item label={t("table.partner")} value={row.partnerName} /><Item label={t("table.amount")} value={row.amount} /><Item label={t("table.status")} value={t(`withdrawalStatuses.${withdrawalStatusToKey(row.status)}`)} /></dl><div className="mt-5 flex gap-2"><Link href="/admin/escrow/withdrawals" className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 font-extrabold text-[var(--charcoal)]">{t("actions.back")}</Link><button className="min-h-11 rounded-lg bg-[var(--emerald)] px-5 font-extrabold text-white">{t("actions.approve")}</button></div></section></div>;
}
function Item({ label, value }: { readonly label: string; readonly value: string }): ReactElement { return <div className="rounded-lg bg-[var(--ivory)] p-4"><dt className="text-xs font-bold text-[var(--text-muted)]">{label}</dt><dd className="mt-1 font-extrabold text-[var(--charcoal)]">{value}</dd></div>; }
