import type { Metadata } from "next";
import type { ReactElement } from "react";
import { CalendarDays, CreditCard, Search, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { UserRole } from "@prisma/client";
import { Link } from "@/i18n/routing";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { getJamaahOverview } from "@/lib/jamaah/data";
import { bookingStatusVariant } from "@/lib/jamaah/status";
import { requireRoleSession } from "@/lib/auth/current-session";

export const metadata: Metadata = { title: "Dashboard Jamaah" };

export default async function JamaahDashboardPage(): Promise<ReactElement> {
  const session = await requireRoleSession([UserRole.JAMAAH]);
  const t = await getTranslations("Jamaah.dashboard");
  const statusT = await getTranslations("Jamaah.status");
  const data = await getJamaahOverview(session.userId);

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <DashboardPageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
        <Link href="/jamaah/search" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--emerald)] px-4 text-sm font-extrabold text-white md:w-fit">
          <Search className="size-4" aria-hidden="true" />
          {t("searchCta")}
        </Link>
      </div>

      <section className="hidden rounded-xl border border-[var(--border)] bg-white md:grid md:grid-cols-3 md:divide-x md:divide-[var(--border)]">
        <Metric icon={<CalendarDays className="size-5" aria-hidden="true" />} label={t("metrics.activeBookings")} value={String(data.activeBookings)} />
        <Metric icon={<CreditCard className="size-5" aria-hidden="true" />} label={t("metrics.pendingPayments")} value={String(data.pendingPayments)} />
        <Metric icon={<ShieldCheck className="size-5" aria-hidden="true" />} label={t("metrics.escrow")} value={String(data.escrowPayments)} />
      </section>

      <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        <div className="border-b border-[var(--border)] px-4 py-4 md:px-5">
          <h2 className="text-base font-extrabold text-[var(--charcoal)]">{t("upcoming.title")}</h2>
        </div>
        <div className="p-3 md:p-5">
          {data.upcoming ? (
            <article className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm md:flex md:items-center md:justify-between md:gap-4">
              <div className="flex items-start gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--emerald-pale)] text-[var(--emerald)]">
                  <CalendarDays className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[var(--text-muted)]">{formatDate(data.upcoming.scheduledStart)}</p>
                  <h3 className="mt-1 font-extrabold text-[var(--charcoal)]">{data.upcoming.serviceTitle}</h3>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-muted)]">{data.upcoming.providerName}</p>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between gap-3 md:mt-0 md:flex-col md:items-end">
                <StatusBadge label={statusT(`booking.${data.upcoming.status}`)} variant={bookingStatusVariant(data.upcoming.status)} />
                {data.upcoming.paymentId && data.upcoming.paymentStatus ? (
                  <Link href={`/jamaah/payments/${data.upcoming.paymentId}`} className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 text-xs font-extrabold text-[var(--charcoal)]">
                    {statusT(`payment.${data.upcoming.paymentStatus}`)}
                  </Link>
                ) : null}
              </div>
            </article>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--ivory)] p-5 text-sm font-bold leading-6 text-[var(--text-muted)]">
              {t("upcoming.empty")}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <QuickLink href="/jamaah/bookings" title={t("quick.bookings.title")} description={t("quick.bookings.description")} />
        <QuickLink href="/jamaah/payments" title={t("quick.payments.title")} description={t("quick.payments.description")} />
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { readonly icon: ReactElement; readonly label: string; readonly value: string }): ReactElement {
  return <div className="flex items-center gap-4 p-5"><span className="flex size-11 items-center justify-center rounded-xl bg-[var(--emerald-pale)] text-[var(--emerald)]">{icon}</span><div><p className="text-sm font-bold text-[var(--text-muted)]">{label}</p><p className="text-2xl font-black text-[var(--charcoal)]">{value}</p></div></div>;
}

function QuickLink({ href, title, description }: { readonly href: string; readonly title: string; readonly description: string }): ReactElement {
  return <Link href={href} className="rounded-xl border border-[var(--border)] bg-white p-4 transition-colors hover:border-[var(--emerald)]"><p className="font-extrabold text-[var(--charcoal)]">{title}</p><p className="mt-1 text-sm font-semibold leading-6 text-[var(--text-muted)]">{description}</p></Link>;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
