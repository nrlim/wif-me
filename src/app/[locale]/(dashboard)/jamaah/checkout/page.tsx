import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { CalendarDays, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { UserRole } from "@prisma/client";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getServiceForCheckout } from "@/lib/jamaah/data";
import { createJamaahBookingAction } from "@/app/[locale]/(dashboard)/jamaah/actions";

export const metadata: Metadata = { title: "Checkout Booking" };

type CheckoutPageProps = {
  readonly searchParams: Promise<{ readonly serviceId?: string }>;
};

export default async function JamaahCheckoutPage({ searchParams }: CheckoutPageProps): Promise<ReactElement> {
  await requireRoleSession([UserRole.JAMAAH]);
  const { serviceId } = await searchParams;
  if (!serviceId) notFound();

  const service = await getServiceForCheckout(serviceId);
  if (!service) notFound();

  const t = await getTranslations("Jamaah.checkout");
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const minDate = today.toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <DashboardPageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px] lg:items-start">
        <section className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
          <h2 className="text-lg font-extrabold text-[var(--charcoal)]">{t("formTitle")}</h2>
          <form action={createJamaahBookingAction} className="mt-4 grid gap-4">
            <input type="hidden" name="serviceId" value={service.id} />
            <label className="grid gap-1.5 text-sm font-extrabold text-[var(--charcoal)]" htmlFor="scheduledStart">
              {t("fields.date")}
              <input id="scheduledStart" name="scheduledStart" type="date" min={minDate} required className="auth-input" />
            </label>
            <label className="grid gap-1.5 text-sm font-extrabold text-[var(--charcoal)]" htmlFor="notes">
              {t("fields.notes")}
              <textarea id="notes" name="notes" rows={5} className="min-h-32 rounded-lg border border-[#dfe4df] bg-[#fbfaf6] px-4 py-3 text-sm font-semibold text-[var(--charcoal)] outline-none focus:border-[var(--emerald)] focus:bg-white" placeholder={t("fields.notesPlaceholder")} />
            </label>
            <button type="submit" className="min-h-12 rounded-lg bg-[var(--emerald)] px-5 text-sm font-extrabold text-white">
              {t("submit")}
            </button>
          </form>
        </section>

        <aside className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--gold)]">{t("summary.eyebrow")}</p>
          <h2 className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-[var(--charcoal)]">{service.title}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-muted)]">{service.description}</p>
          <div className="mt-5 grid gap-3 text-sm">
            <div className="flex items-center gap-3 rounded-xl bg-[var(--ivory)] p-3"><CalendarDays className="size-5 text-[var(--emerald)]" aria-hidden="true" /><div><p className="font-bold text-[var(--text-muted)]">{t("summary.provider")}</p><p className="font-extrabold text-[var(--charcoal)]">{service.ownerName}</p></div></div>
            <div className="flex items-center gap-3 rounded-xl bg-[var(--ivory)] p-3"><ShieldCheck className="size-5 text-[var(--emerald)]" aria-hidden="true" /><div><p className="font-bold text-[var(--text-muted)]">{t("summary.escrow")}</p><p className="font-extrabold text-[var(--charcoal)]">{t("summary.escrowValue")}</p></div></div>
          </div>
          <div className="mt-5 border-t border-[var(--border)] pt-4">
            <div className="flex items-center justify-between gap-4"><p className="font-bold text-[var(--text-muted)]">{t("summary.total")}</p><p className="text-xl font-black text-[var(--charcoal)]">{service.basePrice}</p></div>
            <p className="mt-2 text-xs font-semibold leading-5 text-[var(--text-muted)]">{t("summary.note")}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
