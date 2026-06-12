import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { CreditCard, FileCheck2, InfoIcon, ShieldCheck, Upload } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PaymentStatus, UserRole } from "@prisma/client";
import { StatusBadge } from "@/components/shared/status-badge";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { ESCROW_BANK_ACCOUNT } from "@/lib/constants/payment";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getJamaahPaymentDetail } from "@/lib/jamaah/data";
import { paymentStatusVariant } from "@/lib/jamaah/status";
import { getSignedStorageUrl } from "@/lib/storage/supabase";
import { PaymentProofPreview } from "@/components/shared/payment-proof-preview";
import { submitJamaahPaymentProofAction } from "@/app/[locale]/(dashboard)/jamaah/actions";

export const metadata: Metadata = { title: "Detail Pembayaran" };

type PaymentDetailPageProps = {
  readonly params: Promise<{ readonly payment: string }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function JamaahPaymentDetailPage({ params, searchParams }: PaymentDetailPageProps): Promise<ReactElement> {
  const session = await requireRoleSession([UserRole.JAMAAH]);
  const [{ payment: paymentId }, query] = await Promise.all([params, searchParams]);
  const payment = await getJamaahPaymentDetail(session.userId, paymentId);
  if (!payment) notFound();

  const t = await getTranslations("Jamaah.paymentDetail");
  const statusT = await getTranslations("Jamaah.status");
  const hasProof = Boolean(payment.proofUploadedAt);
  const proofRejected = Boolean(payment.proofRejectedAt);
  const canUploadProof = payment.status === PaymentStatus.PENDING && (!hasProof || proofRejected);
  const proofUrl = await getSignedStorageUrl(payment.proofUrl);

  let pageTitle = t("title");
  let pageDesc = t("description");
  if (payment.status === PaymentStatus.HELD_IN_ESCROW) {
    pageTitle = t("titlePaid");
    pageDesc = t("descriptionPaid");
  } else if (payment.status === PaymentStatus.RELEASED || payment.status === PaymentStatus.REFUNDED) {
    pageTitle = t("titleCompleted");
    pageDesc = t("descriptionCompleted");
  } else if (hasProof) {
    pageTitle = t("titleReview");
    pageDesc = t("descriptionReview");
  }

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <DashboardPageHeader eyebrow={t("eyebrow")} title={pageTitle} description={pageDesc} />
      {query.notice === "proof-uploaded" ? <Notice>{t("proof.uploadedNotice")}</Notice> : null}
      {query.notice === "invalid-proof" ? <Notice tone="error">{t("proof.invalidNotice")}</Notice> : null}
      <section className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5 lg:p-7">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-start sm:justify-between sm:pb-5">
          <div><p className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)]">{payment.reference}</p><h2 className="mt-1 text-xl font-extrabold text-[var(--charcoal)] md:text-2xl">{payment.orderTitle}</h2></div>
          <StatusBadge label={getPaymentDisplayStatus(payment.status, hasProof, payment.proofRejectedAt, statusT, t)} variant={paymentStatusVariant(payment.status)} />
        </div>

        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 md:mt-6 md:gap-4">
          <Info label={t("fields.amount")} value={payment.amount} />
          <Info label={t("fields.orderId")} value={payment.orderId.slice(0, 8).toUpperCase()} />
          <Info label={t("fields.method")} value={t("bankTransfer")} />
          <Info label={t("fields.account")} value={`${ESCROW_BANK_ACCOUNT.accountName} ${ESCROW_BANK_ACCOUNT.accountNumber}`} />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-4 md:p-5">
            <div className="flex items-start justify-between gap-4 sm:items-center">
              <h3 className="font-extrabold text-[var(--charcoal)] md:text-lg">{t("instructions.title")}</h3>
              <EscrowInfo title={t("escrow.title")} description={t("escrow.description")} note={t("escrow.note")} />
            </div>
            <div className="mt-4 grid gap-3 rounded-xl border border-[var(--border)] bg-white p-4 text-sm">
              <BankInfo label={t("bank.bankName")} value={ESCROW_BANK_ACCOUNT.bankName} />
              <BankInfo label={t("bank.accountName")} value={ESCROW_BANK_ACCOUNT.accountName} />
              <BankInfo label={t("bank.accountNumber")} value={ESCROW_BANK_ACCOUNT.accountNumber} strong />
              <BankInfo label={t("bank.branch")} value={ESCROW_BANK_ACCOUNT.branch} />
            </div>
            <ol className="mt-4 grid gap-2 pl-5 text-sm font-semibold leading-6 text-[var(--text-muted)] md:gap-3">
              <li className="list-decimal">{t("instructions.items.0")}</li>
              <li className="list-decimal">{t("instructions.items.1")}</li>
              <li className="list-decimal">{t("instructions.items.2")}</li>
            </ol>
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-[var(--emerald-pale)] text-[var(--emerald)]"><FileCheck2 className="size-5" aria-hidden="true" /></span>
              <div><h3 className="font-extrabold text-[var(--charcoal)]">{t("proof.title")}</h3><p className="text-xs font-bold leading-5 text-[var(--text-muted)]">{hasProof && !proofRejected ? t("proof.waitingReview") : t("proof.description")}</p></div>
            </div>
            {payment.proofRejectedAt && payment.proofReviewNote ? <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-bold leading-5 text-[var(--error)]">{payment.proofReviewNote}</div> : null}
            <PaymentProofPreview proofUrl={proofUrl} fileName={payment.proofFileName} mimeType={payment.proofMimeType} viewLabel={t("proof.view")} />
            {canUploadProof ? <ProofUploadForm paymentId={payment.id} label={proofRejected ? t("proof.replace") : t("proof.upload")} submitLabel={t("proof.submit")} helper={t("proof.helper")} /> : null}
          </section>
        </div>
      </section>
    </div>
  );
}

function ProofUploadForm({ paymentId, label, submitLabel, helper }: { readonly paymentId: string; readonly label: string; readonly submitLabel: string; readonly helper: string }): ReactElement {
  return <form action={submitJamaahPaymentProofAction} className="grid gap-3"><input type="hidden" name="paymentId" value={paymentId} /><label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="proof">{label}<input id="proof" name="proof" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="block w-full cursor-pointer rounded-lg border border-[#dfe4df] bg-[#fbfaf6] p-1.5 text-sm font-semibold text-[var(--charcoal)] transition-colors focus:border-[var(--emerald)] focus:outline-none file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--emerald-pale)] file:px-4 file:py-2 file:text-xs file:font-extrabold file:text-[var(--emerald)] file:transition-colors hover:file:bg-[var(--emerald)]/20" required /></label><p className="text-xs font-semibold leading-5 text-[var(--text-muted)]">{helper}</p><button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--emerald)] px-4 text-sm font-extrabold text-white"><Upload className="size-4" aria-hidden="true" />{submitLabel}</button></form>;
}

function EscrowInfo({ title, description, note }: { readonly title: string; readonly description: string; readonly note: string }): ReactElement {
  return <div className="group relative flex items-center"><button type="button" className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--text-muted)] transition-colors hover:border-[var(--emerald)] hover:bg-[var(--emerald)] hover:text-white" aria-label={title}><InfoIcon className="size-4" aria-hidden="true" /></button><div className="pointer-events-none invisible absolute bottom-full right-0 z-10 mb-2 w-[280px] origin-bottom-right scale-95 opacity-0 transition-all group-hover:pointer-events-auto group-hover:visible group-hover:scale-100 group-hover:opacity-100 sm:w-[320px]"><div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-xl"><h4 className="flex items-center gap-2 text-sm font-extrabold text-[var(--charcoal)]"><CreditCard className="size-4 text-[var(--emerald)]" aria-hidden="true" />{title}</h4><p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{description}</p><div className="mt-3 flex items-start gap-2 rounded-lg bg-[var(--emerald)]/10 p-2.5"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--emerald)]" aria-hidden="true" /><p className="text-[10px] font-bold leading-4 text-[var(--emerald)]">{note}</p></div></div></div></div>;
}

function BankInfo({ label, value, strong = false }: { readonly label: string; readonly value: string; readonly strong?: boolean }): ReactElement {
  return <div className="flex items-start justify-between gap-4"><span className="font-bold text-[var(--text-muted)]">{label}</span><span className={strong ? "text-right text-base font-black text-[var(--charcoal)]" : "text-right font-extrabold text-[var(--charcoal)]"}>{value}</span></div>;
}

function Info({ label, value }: { readonly label: string; readonly value: string }): ReactElement {
  return <div className="rounded-xl border border-[var(--border)] p-3"><p className="text-xs font-bold text-[var(--text-muted)]">{label}</p><p className="mt-1 break-words font-extrabold text-[var(--charcoal)]">{value}</p></div>;
}

function Notice({ children, tone = "success" }: { readonly children: string; readonly tone?: "success" | "error" }): ReactElement {
  const classes = tone === "error" ? "border-red-100 bg-red-50 text-[var(--error)]" : "border-[var(--emerald)]/15 bg-[var(--emerald)]/10 text-[var(--emerald)]";
  return <div className={`rounded-lg border p-3 text-sm font-bold ${classes}`}>{children}</div>;
}

function getPaymentDisplayStatus(status: PaymentStatus, hasProof: boolean, rejectedAt: string | null, statusT: (key: string) => string, t: Awaited<ReturnType<typeof getTranslations>>): string {
  if (status === PaymentStatus.PENDING && rejectedAt) return t("proof.rejectedStatus");
  if (status === PaymentStatus.PENDING && hasProof) return t("proof.reviewStatus");
  return statusT(`payment.${status}`);
}
