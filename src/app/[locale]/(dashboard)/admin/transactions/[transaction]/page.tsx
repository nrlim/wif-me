import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PaymentStatus } from "@prisma/client";
import { FileCheck2, PackageCheck, ShieldCheck, XCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { PaymentProofPreview } from "@/components/shared/payment-proof-preview";
import { getAdminTransactionDetail, type AdminTransactionItem } from "@/lib/admin/transactions";
import { getSignedStorageUrl } from "@/lib/storage/supabase";
import { paymentStatusToTransactionKey, serviceTypeToKey } from "@/lib/admin/mappers";
import { rejectManualTransferAction, verifyManualTransferAction } from "../actions";

export const metadata: Metadata = { title: "Detail Transaksi" };

type TransactionDetailProps = { readonly params: Promise<{ readonly locale: string; readonly transaction: string }> };

type FinanceT = Awaited<ReturnType<typeof getTranslations>>;

export default async function TransactionDetailPage({ params }: TransactionDetailProps): Promise<ReactElement> {
  const { locale, transaction } = await params;
  const row = await getAdminTransactionDetail(decodeURIComponent(transaction));
  if (!row) notFound();

  const t = await getTranslations("Admin.finance");
  const proofUrl = await getSignedStorageUrl(row.proofUrl);
  const needsReview = row.status === PaymentStatus.PENDING && Boolean(row.proofUploadedAt) && !row.proofRejectedAt;

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader eyebrow={t("transactions.eyebrow")} title={t("detail.title", { id: row.id })} description={t("detail.description")} />
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="grid gap-4">
          <section className="rounded-xl border border-[var(--border)] bg-white p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-[var(--emerald-pale)] text-[var(--emerald)]"><PackageCheck className="size-5" aria-hidden="true" /></span>
              <div><h2 className="font-extrabold text-[var(--charcoal)]">{t("detail.itemsTitle")}</h2><p className="text-xs font-bold leading-5 text-[var(--text-muted)]">{t("detail.itemsDescription")}</p></div>
            </div>
            <div className="grid gap-3">{row.items.map((item) => <OrderedItemCard key={item.bookingId} item={item} t={t} />)}</div>
          </section>
        </div>

        <aside className="grid gap-4">
          <section className="rounded-xl border border-[var(--border)] bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-[var(--emerald-pale)] text-[var(--emerald)]"><FileCheck2 className="size-5" aria-hidden="true" /></span>
                <div><h2 className="font-extrabold text-[var(--charcoal)]">{t("manualPayment.proofTitle")}</h2><p className="text-xs font-bold leading-5 text-[var(--text-muted)]">{row.proofUploadedAt ? t("manualPayment.proofUploaded") : t("manualPayment.noProof")}</p></div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{t("table.amount")}</p>
                <p className="text-sm font-extrabold text-[var(--emerald)]">{row.amount}</p>
              </div>
            </div>
            <PaymentProofPreview proofUrl={proofUrl} fileName={row.proofFileName} mimeType={row.proofMimeType} viewLabel={t("manualPayment.viewProof")} />
            {row.proofRejectedAt && row.proofReviewNote ? <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-bold leading-5 text-[var(--error)]">{row.proofReviewNote}</div> : null}
          </section>
          <section className="rounded-xl border border-[var(--border)] bg-white p-5">
            <dl className="grid gap-4">
              <Item label={t("table.customer")} value={row.customerName} />
              <Item label={t("detail.customerEmail")} value={row.customerEmail} />
              <Item label={t("table.status")} value={getTransactionStatusLabel(row, t)} />
            </dl>
          </section>

          {needsReview ? <section className="rounded-xl border border-[var(--border)] bg-white p-5"><ReviewForms locale={locale} paymentId={row.paymentId} t={t} /></section> : null}
          <section className="rounded-xl border border-[var(--border)] bg-white p-4"><Link href="/admin/transactions" className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--ivory)] px-4 text-sm font-extrabold text-[var(--charcoal)] transition-colors hover:bg-gray-50">{t("actions.back")}</Link></section>
        </aside>
      </section>
    </div>
  );
}

function OrderedItemCard({ item, t }: { readonly item: AdminTransactionItem; readonly t: FinanceT }): ReactElement {
  const serviceLabel = t(`services.${serviceTypeToKey(item.serviceType)}`);
  return <article className="rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--gold)]">{serviceLabel}</p><h3 className="mt-1 font-extrabold text-[var(--charcoal)]">{item.serviceTitle}</h3><p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{item.categoryTitle ?? serviceLabel}</p></div><p className="font-extrabold text-[var(--charcoal)]">{item.totalPrice}</p></div><dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2"><MiniItem label={t("detail.provider")} value={item.providerName} /><MiniItem label={t("detail.schedule")} value={formatDate(item.scheduledStart)} /><MiniItem label={t("detail.bookingStatus")} value={t(`bookingStatuses.${item.bookingStatus}`)} /><MiniItem label={t("detail.location")} value={item.routeLabel ?? item.locationLabel ?? "-"} />{item.vehicleType ? <MiniItem label={t("detail.vehicleType")} value={item.vehicleType} /> : null}<MiniItem label={t("detail.notes")} value={item.notes ?? t("detail.noNotes")} wide /></dl></article>;
}

function MiniItem({ label, value, wide = false }: { readonly label: string; readonly value: string; readonly wide?: boolean }): ReactElement {
  return <div className={wide ? "sm:col-span-2" : undefined}><dt className="font-bold text-[var(--text-muted)]">{label}</dt><dd className="mt-1 font-extrabold leading-5 text-[var(--charcoal)]">{value}</dd></div>;
}

function ReviewForms({ locale, paymentId, t }: { readonly locale: string; readonly paymentId: string; readonly t: FinanceT }): ReactElement {
  return <div className="grid gap-5"><form action={verifyManualTransferAction}><input type="hidden" name="locale" value={locale} /><input type="hidden" name="paymentId" value={paymentId} /><button type="submit" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--emerald)] px-4 text-sm font-extrabold text-white transition-opacity hover:opacity-90"><ShieldCheck className="size-4" aria-hidden="true" />{t("manualPayment.verify")}</button></form><hr className="border-[var(--border)]" /><form action={rejectManualTransferAction} className="grid gap-3"><input type="hidden" name="locale" value={locale} /><input type="hidden" name="paymentId" value={paymentId} /><label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="reviewNote">{t("manualPayment.rejectNote")}<textarea id="reviewNote" name="reviewNote" className="min-h-24 w-full rounded-lg border border-[#dfe4df] bg-[#fbfaf6] px-3 py-3 text-sm font-semibold text-[#111827] outline-none transition-colors focus:border-[var(--emerald)] focus:bg-white" required /></label><button type="submit" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 text-sm font-extrabold text-[var(--error)] transition-colors hover:bg-red-100"><XCircle className="size-4" aria-hidden="true" />{t("manualPayment.reject")}</button></form></div>;
}

function getTransactionStatusLabel(row: { readonly status: PaymentStatus; readonly proofUploadedAt: string | null; readonly proofRejectedAt: string | null }, t: FinanceT): string {
  if (row.status === PaymentStatus.PENDING && row.proofUploadedAt && !row.proofRejectedAt) return t("transactionStatuses.paymentReview");
  if (row.status === PaymentStatus.PENDING) return t("transactionStatuses.pending");
  return t(`transactionStatuses.${paymentStatusToTransactionKey(row.status)}`);
}

function Item({ label, value }: { readonly label: string; readonly value: string }): ReactElement { return <div className="rounded-lg bg-[var(--ivory)] p-4"><dt className="text-xs font-bold text-[var(--text-muted)]">{label}</dt><dd className="mt-1 break-words font-extrabold text-[var(--charcoal)]">{value}</dd></div>; }
function formatDate(value: string): string { return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)); }
