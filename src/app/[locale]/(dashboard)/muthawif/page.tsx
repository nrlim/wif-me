import type { Metadata } from "next";
import type { ReactElement } from "react";
import { UserRole } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { AvailabilityToggle } from "@/components/shared/availability-toggle";
import { PartnerMetrics, PartnerUpcomingBookings } from "@/components/shared/partner-dashboard-widgets";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getPartnerDashboard } from "@/lib/partner/data";

export const metadata: Metadata = { title: "Dashboard Muthawif" };

export default async function MuthawifDashboardPage(): Promise<ReactElement> {
  const session = await requireRoleSession([UserRole.MUTHAWIF]);
  const [t, common, statusT, dashboard] = await Promise.all([
    getTranslations("Partner.muthawif.dashboard"),
    getTranslations("Partner.common"),
    getTranslations("Jamaah.status"),
    getPartnerDashboard(session.userId),
  ]);

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <DashboardPageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <AvailabilityToggle 
            initialIsAvailable={dashboard.isAvailable} 
            labels={{
              available: t("availability.available"),
              notAvailable: t("availability.notAvailable"),
              toggleLabel: t("availability.toggleLabel"),
              activeBookingsWarning: t("availability.activeBookingsWarning")
            }} 
          />
          <Link href="/muthawif/schedule" className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--emerald)] px-4 text-sm font-extrabold text-white sm:w-fit">
            {t("scheduleCta")}
          </Link>
        </div>
      </div>
      <PartnerMetrics text={{ verification: common("metrics.verification"), services: common("metrics.services"), activeBookings: common("metrics.activeBookings"), escrow: common("metrics.escrow") }} verificationLabel={common(`verification.${dashboard.verificationStatus}`)} serviceCount={dashboard.serviceCount} activeBookings={dashboard.activeBookings} escrowAmount={dashboard.escrowAmount} />
      <PartnerUpcomingBookings rows={dashboard.upcoming} detailHref="/muthawif/schedule" text={{ title: t("upcoming.title"), empty: t("upcoming.empty"), customer: common("customer"), detail: common("detail"), bookingStatus: (status) => statusT(`booking.${status}`), paymentStatus: (status) => statusT(`payment.${status}`) }} />
      <section className="grid gap-3 sm:grid-cols-2">
        <QuickLink href="/muthawif/schedule" title={t("quick.schedule.title")} description={t("quick.schedule.description")} />
        <QuickLink href="/muthawif/earnings" title={t("quick.earnings.title")} description={t("quick.earnings.description")} />
      </section>
    </div>
  );
}

function QuickLink({ href, title, description }: { readonly href: string; readonly title: string; readonly description: string }): ReactElement {
  return <Link href={href} className="rounded-xl border border-[var(--border)] bg-white p-4 transition-colors hover:border-[var(--emerald)]"><p className="font-extrabold text-[var(--charcoal)]">{title}</p><p className="mt-1 text-sm font-semibold leading-6 text-[var(--text-muted)]">{description}</p></Link>;
}
