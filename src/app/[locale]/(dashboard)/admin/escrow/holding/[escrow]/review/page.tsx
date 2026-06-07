import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { getTransactionByReference } from "@/lib/admin/data";
import { paymentStatusToEscrowKey, serviceTypeToKey } from "@/lib/admin/mappers";

export const metadata: Metadata = { title: "Review Escrow" };

type EscrowReviewProps = { readonly params: Promise<{ readonly escrow: string }> };

export default async function EscrowReviewPage({ params }: EscrowReviewProps): Promise<ReactElement> {
  const { escrow } = await params;
  const row = await getTransactionByReference(decodeURIComponent(escrow));
  if (!row) notFound();
  const t = await getTranslations("Admin.escrow");
  return <div className="flex flex-col gap-5"><DashboardPageHeader eyebrow={t("table.review")} title={t("review.title", { id: row.id })} description={t("review.description")} /><section className="max-w-3xl rounded-xl border border-[var(--border)] bg-white p-5"><dl className="grid gap-4 sm:grid-cols-2"><Item label={t("table.service")} value={t(`services.${serviceTypeToKey(row.serviceKey)}`)} /><Item label={t("table.customer")} value={row.customerName} /><Item label={t("table.amount")} value={row.amount} /><Item label={t("table.status")} value={t(`statuses.${paymentStatusToEscrowKey(row.status)}`)} /></dl><div className="mt-5 flex gap-2"><Link href="/admin/escrow/holding" className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 font-extrabold text-[var(--charcoal)]">{t("review.back")}</Link><button className="min-h-11 rounded-lg bg-[var(--emerald)] px-5 font-extrabold text-white">{t("review.release")}</button></div></section></div>;
}
function Item({ label, value }: { readonly label: string; readonly value: string }): ReactElement { return <div className="rounded-lg bg-[var(--ivory)] p-4"><dt className="text-xs font-bold text-[var(--text-muted)]">{label}</dt><dd className="mt-1 font-extrabold text-[var(--charcoal)]">{value}</dd></div>; }
