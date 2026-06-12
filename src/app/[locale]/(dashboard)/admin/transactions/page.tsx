import type { ReactElement } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PaymentStatus } from "@prisma/client";
import { Link } from "@/i18n/routing";
import { DataListPagination } from "@/components/shared/data-list-pagination";
import { DataListToolbar } from "@/components/shared/data-list-toolbar";
import { getTransactions, type TransactionListRow } from "@/lib/admin/data";
import { paymentStatusToTransactionKey, serviceTypeToKey } from "@/lib/admin/mappers";

export const metadata: Metadata = { title: "Manage Transaksi" };

export default async function AdminTransactionsPage(): Promise<ReactElement> {
  const t = await getTranslations("Admin.finance");
  const list = await getTranslations("Admin.list");
  const transactions = await getTransactions();
  return <div className="flex flex-col gap-6"><section className="hidden max-w-3xl md:block"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("transactions.eyebrow")}</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)]">{t("transactions.title")}</h1><p className="mt-3 text-sm font-medium leading-7 text-[var(--text-muted)]">{t("transactions.description")}</p></section><DataListToolbar searchLabel={list("search")} searchPlaceholder={list("searchPlaceholder")} filterLabel={list("filter")} sortLabel={list("sort")} actionLabel={list("apply")} filterName="status" filterOptions={[{ value: "", label: list("all") }, { value: "pending", label: t("transactionStatuses.pending") }, { value: "review", label: t("transactionStatuses.paymentReview") }, { value: "paid", label: t("transactionStatuses.paid") }, { value: "escrow", label: t("transactionStatuses.escrow") }, { value: "completed", label: t("transactionStatuses.completed") }, { value: "refunded", label: t("transactionStatuses.refunded") }]} sortOptions={[{ value: "latest", label: list("latest") }, { value: "oldest", label: list("oldest") }, { value: "amount", label: list("highest") }]} /><section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[0_10px_28px_rgba(22,33,28,0.05)]"><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[var(--ivory)] text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]"><tr><th className="px-5 py-4">{t("table.id")}</th><th className="px-5 py-4">{t("table.service")}</th><th className="px-5 py-4">{t("table.customer")}</th><th className="px-5 py-4">{t("table.amount")}</th><th className="px-5 py-4">{t("table.status")}</th><th className="px-5 py-4">{t("table.action")}</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{transactions.map((row) => <TransactionRow key={row.id} row={row} t={t} />)}</tbody></table></div><div className="grid gap-3 p-3 md:hidden">{transactions.map((row) => <TransactionCard key={row.id} row={row} t={t} />)}</div><DataListPagination label={list("page")} previousLabel={list("previous")} nextLabel={list("next")} /></section></div>;
}

function TransactionRow({ row, t }: { readonly row: TransactionListRow; readonly t: (key: string) => string }): ReactElement {
  const status = getTransactionStatus(row);
  return <tr><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{row.id}</td><td className="px-5 py-4 font-bold text-[var(--text-muted)]">{t(`services.${serviceTypeToKey(row.serviceKey)}`)}</td><td className="px-5 py-4 font-bold text-[var(--text-muted)]">{row.customerName}</td><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{row.amount}</td><td className="px-5 py-4"><Status label={t(`transactionStatuses.${status}`)} status={status} /></td><td className="px-5 py-4"><Link href={`/admin/transactions/${row.id}`} className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 font-extrabold text-[var(--charcoal)]">{status === "paymentReview" ? t("actions.review") : t("actions.detail")}</Link></td></tr>;
}

function TransactionCard({ row, t }: { readonly row: TransactionListRow; readonly t: (key: string) => string }): ReactElement {
  const status = getTransactionStatus(row);
  return <article className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"><div className="flex justify-between gap-3"><p className="text-xs font-extrabold text-[var(--gold)]">{row.id}</p><Status label={t(`transactionStatuses.${status}`)} status={status} /></div><h2 className="mt-3 font-extrabold text-[var(--charcoal)]">{t(`services.${serviceTypeToKey(row.serviceKey)}`)}</h2><p className="text-sm font-bold text-[var(--text-muted)]">{row.customerName}</p><div className="mt-4 flex items-end justify-between gap-3"><p className="text-lg font-extrabold text-[var(--charcoal)]">{row.amount}</p><Link href={`/admin/transactions/${row.id}`} className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-extrabold text-[var(--charcoal)]">{status === "paymentReview" ? t("actions.review") : t("actions.detail")}</Link></div></article>;
}

function getTransactionStatus(row: TransactionListRow): "pending" | "paymentReview" | "paid" | "escrow" | "completed" | "refunded" {
  if (row.status === PaymentStatus.PENDING && row.proofUploadedAt && !row.proofRejectedAt) return "paymentReview";
  if (row.status === PaymentStatus.PENDING) return "pending";
  return paymentStatusToTransactionKey(row.status);
}

function Status({ label, status }: { readonly label: string; readonly status: string }): ReactElement { 
  let colors = "bg-[var(--emerald)]/10 text-[var(--emerald)]";
  if (status === "pending") colors = "bg-[var(--ivory-dark)] text-[var(--text-muted)]";
  if (status === "paymentReview" || status === "escrow") colors = "bg-[var(--gold)]/10 text-[var(--gold)]";
  if (status === "refunded") colors = "bg-[var(--error)]/10 text-[var(--error)]";
  return <span className={`rounded-md px-3 py-1 text-xs font-extrabold ${colors}`}>{label}</span>; 
}
