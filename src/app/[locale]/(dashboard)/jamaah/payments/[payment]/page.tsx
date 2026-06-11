import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { CreditCard, InfoIcon, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PaymentStatus, UserRole } from "@prisma/client";
import { StatusBadge } from "@/components/shared/status-badge";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getJamaahPaymentDetail } from "@/lib/jamaah/data";
import { paymentStatusVariant } from "@/lib/jamaah/status";
import { confirmJamaahPaymentAction } from "@/app/[locale]/(dashboard)/jamaah/actions";

export const metadata: Metadata = { title: "Detail Pembayaran" };

type PaymentDetailPageProps = {
  readonly params: Promise<{ readonly payment: string }>;
};

export default async function JamaahPaymentDetailPage({ params }: PaymentDetailPageProps): Promise<ReactElement> {
  const session = await requireRoleSession([UserRole.JAMAAH]);
  const { payment: paymentId } = await params;
  const payment = await getJamaahPaymentDetail(session.userId, paymentId);
  if (!payment) notFound();

  const t = await getTranslations("Jamaah.paymentDetail");
  const statusT = await getTranslations("Jamaah.status");
  const canPay = payment.status === PaymentStatus.PENDING;

  let pageTitle = t("title");
  let pageDesc = t("description");
  if (payment.status === PaymentStatus.HELD_IN_ESCROW) {
    pageTitle = t("titlePaid");
    pageDesc = t("descriptionPaid");
  } else if (payment.status === PaymentStatus.RELEASED || payment.status === PaymentStatus.REFUNDED) {
    pageTitle = t("titleCompleted");
    pageDesc = t("descriptionCompleted");
  }

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <DashboardPageHeader eyebrow={t("eyebrow")} title={pageTitle} description={pageDesc} />
      <div className="w-full">
        <section className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5 lg:p-7">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-start sm:justify-between sm:pb-5">
            <div><p className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)]">{payment.reference}</p><h2 className="mt-1 text-xl font-extrabold text-[var(--charcoal)] md:text-2xl">{payment.serviceTitle}</h2></div>
            <StatusBadge label={statusT(`payment.${payment.status}`)} variant={paymentStatusVariant(payment.status)} />
          </div>
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 md:gap-4 md:mt-6">
            <Info label={t("fields.amount")} value={payment.amount} />
            <Info label={t("fields.bookingId")} value={payment.bookingId.slice(0, 8).toUpperCase()} />
            <Info label={t("fields.method")} value={t("bankTransfer")} />
            <Info label={t("fields.account")} value="WIF-ME ESCROW 8800 1020 3300" />
          </div>
          <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-4 md:mt-6 md:p-5">
            <div className="flex items-start justify-between gap-4 sm:items-center">
              <h3 className="font-extrabold text-[var(--charcoal)] md:text-lg">{t("instructions.title")}</h3>
              
              <div className="group relative flex items-center">
                <button type="button" className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--text-muted)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-colors hover:border-[var(--emerald)] hover:bg-[var(--emerald)] hover:text-white" aria-label="Informasi Escrow">
                  <InfoIcon className="size-4" aria-hidden="true" />
                </button>
                <div className="pointer-events-none invisible absolute bottom-full right-0 z-10 mb-2 w-[280px] origin-bottom-right scale-95 opacity-0 transition-all group-hover:pointer-events-auto group-hover:visible group-hover:scale-100 group-hover:opacity-100 sm:w-[320px]">
                  <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-xl">
                    <h4 className="flex items-center gap-2 text-sm font-extrabold text-[var(--charcoal)]">
                      <CreditCard className="size-4 text-[var(--emerald)]" aria-hidden="true" />
                      {t("escrow.title")}
                    </h4>
                    <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{t("escrow.description")}</p>
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-[var(--emerald)]/10 p-2.5">
                      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--emerald)]" aria-hidden="true" />
                      <p className="text-[10px] font-bold leading-4 text-[var(--emerald)]">{t("escrow.note")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ol className="mt-4 grid gap-2 pl-5 text-sm font-semibold leading-6 text-[var(--text-muted)] md:gap-3">
              <li className="list-decimal">{t("instructions.items.0")}</li>
              <li className="list-decimal">{t("instructions.items.1")}</li>
              <li className="list-decimal">{t("instructions.items.2")}</li>
            </ol>
          </div>
          {canPay ? (
            <form action={confirmJamaahPaymentAction} className="mt-6 border-t border-[var(--border)] pt-6">
              <input type="hidden" name="paymentId" value={payment.id} />
              <button type="submit" className="min-h-12 w-full rounded-lg bg-[var(--emerald)] px-5 text-sm font-extrabold text-white transition-opacity hover:opacity-90 sm:w-fit">
                {t("confirm")}
              </button>
            </form>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function Info({ label, value }: { readonly label: string; readonly value: string }): ReactElement {
  return <div className="rounded-xl border border-[var(--border)] p-3"><p className="text-xs font-bold text-[var(--text-muted)]">{label}</p><p className="mt-1 break-words font-extrabold text-[var(--charcoal)]">{value}</p></div>;
}
