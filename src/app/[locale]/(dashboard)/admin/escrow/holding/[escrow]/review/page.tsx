import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PaymentStatus } from "@prisma/client";
import { BanknoteArrowUp, CalendarDays, CheckCircle2, PackageCheck, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/routing";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { getAdminTransactionDetail, type AdminTransactionItem } from "@/lib/admin/transactions";
import { paymentStatusToEscrowKey, serviceTypeToKey } from "@/lib/admin/mappers";
import { releaseEscrowFundsAction } from "./actions";

export const metadata: Metadata = { title: "Review Escrow" };

type EscrowReviewProps = {
  readonly params: Promise<{ readonly locale: string; readonly escrow: string }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type EscrowT = Awaited<ReturnType<typeof getTranslations>>;

export default async function EscrowReviewPage({ params, searchParams }: EscrowReviewProps): Promise<ReactElement> {
  const [{ locale, escrow }, query] = await Promise.all([params, searchParams]);
  const row = await getAdminTransactionDetail(decodeURIComponent(escrow));
  if (!row) notFound();

  const t = await getTranslations("Admin.escrow");
  const statusKey = paymentStatusToEscrowKey(row.status);
  const canRelease = row.status === PaymentStatus.HELD_IN_ESCROW;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <DashboardPageHeader eyebrow={t("table.review")} title={t("review.title", { id: row.id })} description={t("review.description")} />
      {query.notice === "released" ? <Notice>{t("review.releasedNotice")}</Notice> : null}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <div className="grid gap-4">
          <section className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-[var(--emerald-pale)] text-[var(--emerald)]"><PackageCheck className="size-5" aria-hidden="true" /></span>
              <div>
                <h2 className="font-extrabold text-[var(--charcoal)]">{t("review.itemsTitle")}</h2>
                <p className="text-xs font-bold leading-5 text-[var(--text-muted)]">{t("review.itemsDescription")}</p>
              </div>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">{row.items.map((item) => <EscrowItemCard key={item.bookingId} item={item} t={t} />)}</div>
          </section>
        </div>

        <aside className="grid gap-4">
          <section className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-[var(--emerald-pale)] text-[var(--emerald)]"><ShieldCheck className="size-5" aria-hidden="true" /></span>
              <div>
                <h2 className="font-extrabold text-[var(--charcoal)]">{t("review.summaryTitle")}</h2>
                <p className="text-xs font-bold leading-5 text-[var(--text-muted)]">{t("review.summaryDescription")}</p>
              </div>
            </div>
            <dl className="grid gap-3 text-sm">
              <Item label={t("table.customer")} value={row.customerName} />
              <Item label={t("review.customerEmail")} value={row.customerEmail} />
              <Item label={t("table.amount")} value={row.amount} />
              <Item label={t("table.status")} value={t(`statuses.${statusKey}`)} />
            </dl>
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-[var(--gold)]/10 text-[var(--gold)]"><BanknoteArrowUp className="size-5" aria-hidden="true" /></span>
              <div>
                <h2 className="font-extrabold text-[var(--charcoal)]">{t("review.releaseTitle")}</h2>
                <p className="text-xs font-bold leading-5 text-[var(--text-muted)]">{canRelease ? t("review.releaseDescription") : t("review.releaseUnavailable")}</p>
              </div>
            </div>
            {canRelease ? (
              <form action={releaseEscrowFundsAction} className="grid gap-3">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="paymentId" value={row.paymentId} />
                <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--emerald)] px-4 text-sm font-extrabold text-white transition-opacity hover:opacity-90">
                  <CheckCircle2 className="size-4" aria-hidden="true" />{t("review.release")}
                </button>
                <p className="text-xs font-semibold leading-5 text-[var(--text-muted)]">{t("review.releaseHelper")}</p>
              </form>
            ) : null}
          </section>

          <Link href="/admin/escrow/holding" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-extrabold text-[var(--charcoal)]">{t("review.back")}</Link>
        </aside>
      </section>
    </div>
  );
}

function EscrowItemCard({ item, t }: { readonly item: AdminTransactionItem; readonly t: EscrowT }): ReactElement {
  const serviceLabel = t(`services.${serviceTypeToKey(item.serviceType)}`);
  return <article className="rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--gold)]">{serviceLabel}</p><h3 className="mt-1 font-extrabold text-[var(--charcoal)]">{item.serviceTitle}</h3><p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{item.providerName}</p></div><p className="font-extrabold text-[var(--charcoal)]">{item.totalPrice}</p></div><dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2"><MiniItem icon={<CalendarDays className="size-3.5" aria-hidden="true" />} label={t("review.schedule")} value={formatDate(item.scheduledStart)} /><MiniItem label={t("review.bookingStatus")} value={t(`review.bookingStatuses.${item.bookingStatus}`)} /><MiniItem label={t("review.location")} value={item.routeLabel ?? item.locationLabel ?? "-"} />{item.vehicleType ? <MiniItem label={t("review.vehicleType")} value={item.vehicleType} /> : null}<MiniItem label={t("review.notes")} value={item.notes ?? t("review.noNotes")} wide /></dl></article>;
}

function MiniItem({ label, value, icon, wide = false }: { readonly label: string; readonly value: string; readonly icon?: ReactElement; readonly wide?: boolean }): ReactElement {
  return <div className={wide ? "sm:col-span-2" : undefined}><dt className="flex items-center gap-1.5 font-bold text-[var(--text-muted)]">{icon}{label}</dt><dd className="mt-1 font-extrabold leading-5 text-[var(--charcoal)]">{value}</dd></div>;
}

function Item({ label, value }: { readonly label: string; readonly value: string }): ReactElement { return <div className="rounded-lg bg-[var(--ivory)] p-4"><dt className="text-xs font-bold text-[var(--text-muted)]">{label}</dt><dd className="mt-1 break-words font-extrabold text-[var(--charcoal)]">{value}</dd></div>; }
function Notice({ children }: { readonly children: string }): ReactElement { return <p className="rounded-lg border border-[var(--emerald)]/15 bg-[var(--emerald)]/10 p-3 text-sm font-bold text-[var(--emerald)]">{children}</p>; }
function formatDate(value: string): string { return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)); }
