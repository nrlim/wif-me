import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { getTransactionByReference } from "@/lib/admin/data";
import { paymentStatusToTransactionKey, serviceTypeToKey } from "@/lib/admin/mappers";

export const metadata: Metadata = { title: "Detail Transaksi" };

type TransactionDetailProps = { readonly params: Promise<{ readonly transaction: string }> };

export default async function TransactionDetailPage({ params }: TransactionDetailProps): Promise<ReactElement> {
  const { transaction } = await params;
  const row = await getTransactionByReference(decodeURIComponent(transaction));
  if (!row) notFound();
  const t = await getTranslations("Admin.finance");
  return <div className="flex flex-col gap-5"><DashboardPageHeader eyebrow={t("transactions.eyebrow")} title={t("detail.title", { id: row.id })} description={t("detail.description")} /><section className="max-w-3xl rounded-xl border border-[var(--border)] bg-white p-5"><dl className="grid gap-4 sm:grid-cols-2"><Item label={t("table.service")} value={t(`services.${serviceTypeToKey(row.serviceKey)}`)} /><Item label={t("table.customer")} value={row.customerName} /><Item label={t("table.amount")} value={row.amount} /><Item label={t("table.status")} value={t(`transactionStatuses.${paymentStatusToTransactionKey(row.status)}`)} /></dl><Link href="/admin/transactions" className="mt-5 inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 font-extrabold text-[var(--charcoal)]">{t("actions.back")}</Link></section></div>;
}
function Item({ label, value }: { readonly label: string; readonly value: string }): ReactElement { return <div className="rounded-lg bg-[var(--ivory)] p-4"><dt className="text-xs font-bold text-[var(--text-muted)]">{label}</dt><dd className="mt-1 font-extrabold text-[var(--charcoal)]">{value}</dd></div>; }
