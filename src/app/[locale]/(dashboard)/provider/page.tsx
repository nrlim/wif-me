import type { Metadata } from "next";
import type { ReactElement } from "react";
import { UserRole } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { PartnerMetrics, PartnerUpcomingBookings } from "@/components/shared/partner-dashboard-widgets";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getPartnerDashboard } from "@/lib/partner/data";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Dashboard Provider" };

export default async function ProviderDashboardPage(): Promise<ReactElement> {
  const session = await requireRoleSession([UserRole.PROVIDER]);
  const [t, common, statusT, dashboard] = await Promise.all([
    getTranslations("Partner.provider.dashboard"),
    getTranslations("Partner.common"),
    getTranslations("Jamaah.status"),
    getPartnerDashboard(session.userId),
  ]);

  if (dashboard.verificationStatus === "DRAFT") {
    redirect("/provider/onboarding");
  }

  if (dashboard.verificationStatus === "PENDING" || dashboard.verificationStatus === "REJECTED") {
    return (
      <div className="flex flex-col gap-5 md:gap-6">
        <DashboardPageHeader eyebrow="Status Verifikasi" title="Persetujuan Akun" description="Akun Anda sedang dalam tahap peninjauan oleh tim Wif-Me." />
        <div className="rounded-xl border border-[var(--border)] bg-white p-6 md:p-8">
          {dashboard.verificationStatus === "PENDING" ? (
            <div>
              <h2 className="text-xl font-bold text-[var(--charcoal)]">Menunggu Persetujuan Admin</h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Profil perusahaan Anda sedang kami review. Proses ini biasanya memakan waktu 1-2 hari kerja. Kami akan mengirimkan notifikasi setelah akun Anda disetujui.</p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-[var(--error)]">Pengajuan Ditolak</h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Mohon maaf, pengajuan profil perusahaan Anda belum dapat disetujui saat ini. Silakan periksa kembali kelengkapan dokumen atau hubungi dukungan admin.</p>
              <Link href="/provider/onboarding" className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[var(--emerald)] px-4 text-sm font-bold text-white transition-colors hover:bg-[var(--emerald-light)]">Perbaiki Profil</Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <DashboardPageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
        <Link href="/provider/staff" className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--emerald)] px-4 text-sm font-extrabold text-white md:w-fit">
          {t("staffCta")}
        </Link>
      </div>
      <PartnerMetrics text={{ verification: common("metrics.verification"), services: common("metrics.services"), activeBookings: common("metrics.activeBookings"), escrow: common("metrics.escrow") }} verificationLabel={common(`verification.${dashboard.verificationStatus}`)} serviceCount={dashboard.serviceCount} activeBookings={dashboard.activeBookings} escrowAmount={dashboard.escrowAmount} />
      <PartnerUpcomingBookings rows={dashboard.upcoming} detailHref="/provider/earnings" text={{ title: t("upcoming.title"), empty: t("upcoming.empty"), customer: common("customer"), detail: common("detail"), bookingStatus: (status) => statusT(`booking.${status}`), paymentStatus: (status) => statusT(`payment.${status}`) }} />
      <section className="grid gap-3 sm:grid-cols-3">
        <QuickLink href="/provider/staff" title={t("quick.staff.title")} description={t("quick.staff.description")} />
        <QuickLink href="/provider/fleet" title={t("quick.fleet.title")} description={t("quick.fleet.description")} />
        <QuickLink href="/provider/earnings" title={t("quick.earnings.title")} description={t("quick.earnings.description")} />
      </section>
    </div>
  );
}

function QuickLink({ href, title, description }: { readonly href: string; readonly title: string; readonly description: string }): ReactElement {
  return <Link href={href} className="rounded-xl border border-[var(--border)] bg-white p-4 transition-colors hover:border-[var(--emerald)]"><p className="font-extrabold text-[var(--charcoal)]">{title}</p><p className="mt-1 text-sm font-semibold leading-6 text-[var(--text-muted)]">{description}</p></Link>;
}
