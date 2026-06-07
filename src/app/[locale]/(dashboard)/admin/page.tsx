import type { ReactElement } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, BriefcaseBusiness, CreditCard, ShieldCheck, Users } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getAdminOverviewData, getAdminChartData, getAdminQueueData } from "@/lib/admin/data";
import { TransactionTrendChart } from "@/components/admin/charts/transaction-trend-chart";
import { ServiceDistributionChart } from "@/components/admin/charts/service-distribution-chart";

export const metadata: Metadata = {
  title: "Admin Overview",
};

type StatCard = {
  readonly key: "services" | "partners" | "escrow" | "verification";
  readonly value: string;
  readonly icon: typeof BriefcaseBusiness;
};

const QUEUE_KEYS = ["muthawif", "provider", "escrow"] as const;

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminOverviewPage(props: Props): Promise<ReactElement> {
  const searchParams = await props.searchParams;
  const chartPeriod = searchParams.period === "monthly" ? "monthly" : "weekly";
  
  const t = await getTranslations("Admin.overview");
  const [overview, chartData, queueData] = await Promise.all([
    getAdminOverviewData(),
    getAdminChartData(chartPeriod),
    getAdminQueueData()
  ]);
  const statCards: readonly StatCard[] = [
    { key: "services", value: String(overview.serviceCount), icon: BriefcaseBusiness },
    { key: "partners", value: String(overview.partnerCount), icon: Users },
    { key: "escrow", value: overview.escrowBalance, icon: CreditCard },
    { key: "verification", value: String(overview.reviewCount), icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-col gap-8">
      <section className="hidden overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[0_10px_28px_rgba(22,33,28,0.05)] md:block">
        <div className="grid divide-y divide-[var(--border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
          {statCards.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.key} className="flex items-start gap-4 p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--emerald-pale)] text-[var(--emerald)]">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-[var(--text-muted)]">{t(`stats.${item.key}.label`)}</p>
                  <p className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)]">{item.value}</p>
                  <p className="mt-2 text-xs font-bold text-[var(--text-muted)]">{t(`stats.${item.key}.note`)}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5">
        <div className="rounded-xl border border-[var(--border)] bg-white p-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--gold)]">{t("charts.trendTitle")}</p>
            </div>
            <div className="flex bg-[var(--emerald-pale)] rounded-lg p-1">
              <Link 
                href="?period=weekly" 
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${chartPeriod === 'weekly' ? 'bg-white text-[var(--emerald)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--emerald)]'}`}
              >
                7 Hari
              </Link>
              <Link 
                href="?period=monthly" 
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${chartPeriod === 'monthly' ? 'bg-white text-[var(--emerald)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--emerald)]'}`}
              >
                30 Hari
              </Link>
            </div>
          </div>
          <TransactionTrendChart data={chartData.trend} />
        </div>
        
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-[var(--border)] bg-white p-5 flex flex-col">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--gold)]">{t("charts.distributionTitle")}</p>
              </div>
              <Link href="/admin/services/categories" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--emerald)] hover:text-[var(--emerald-light)] transition-colors">
                Detail
                <ArrowUpRight className="size-3" aria-hidden="true" />
              </Link>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-[250px]">
              <ServiceDistributionChart data={chartData.distribution} />
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--charcoal)] p-5 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Visual background element */}
            <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/5 blur-3xl pointer-events-none" />
            
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--gold-light)]">{t("queue.eyebrow")}</p>
              <h2 className="mt-2 text-xl font-extrabold relative z-10">{t("queue.title")}</h2>
            </div>
            
            <div className="mt-6 flex flex-col gap-6 relative z-10">
              {/* Muthawif Pending */}
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-sm text-white/90">{t("queue.items.muthawif.title")}</p>
                  <span className="text-lg font-extrabold text-[var(--gold-light)]">{queueData.muthawif}</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--gold-light)] transition-all duration-1000" style={{ width: `${Math.min(100, (queueData.muthawif / 20) * 100)}%` }} />
                </div>
              </div>

              {/* Provider Pending */}
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-sm text-white/90">{t("queue.items.provider.title")}</p>
                  <span className="text-lg font-extrabold text-[var(--gold-light)]">{queueData.provider}</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--gold-light)] transition-all duration-1000" style={{ width: `${Math.min(100, (queueData.provider / 20) * 100)}%` }} />
                </div>
              </div>

              {/* Escrow Pending */}
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-sm text-white/90">{t("queue.items.escrow.title")}</p>
                  <span className="text-lg font-extrabold text-[var(--gold-light)]">{queueData.escrow}</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--emerald-light)] transition-all duration-1000" style={{ width: `${Math.min(100, (queueData.escrow / 50) * 100)}%` }} />
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-white/50 relative z-10">
              <span>Diperbarui saat ini</span>
              <div className="flex items-center gap-1.5">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                </span>
                Live
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
