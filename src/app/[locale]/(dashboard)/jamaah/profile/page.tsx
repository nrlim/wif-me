import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { BadgeCheck, UserRound } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { UserRole } from "@prisma/client";
import { updateJamaahProfileAction } from "@/app/[locale]/(dashboard)/jamaah/actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getJamaahProfile } from "@/lib/jamaah/data";

export const metadata: Metadata = { title: "General Profile" };

type JamaahProfilePageProps = {
  readonly searchParams: Promise<{ readonly notice?: string }>;
};

export default async function JamaahProfilePage({ searchParams }: JamaahProfilePageProps): Promise<ReactElement> {
  const session = await requireRoleSession([UserRole.JAMAAH]);
  const [t, params, profile] = await Promise.all([
    getTranslations("Jamaah.profile"),
    searchParams,
    getJamaahProfile(session.userId),
  ]);

  if (!profile) notFound();

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <section className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-xl bg-[var(--emerald)] text-xl font-extrabold text-white">{profile.name.charAt(0).toUpperCase()}</div>
          <div>
            <h1 className="text-xl font-extrabold tracking-[-0.03em] text-[var(--charcoal)]">{profile.name}</h1>
            <p className="mt-1 text-sm font-bold text-[var(--text-muted)]">{profile.email}</p>
          </div>
        </div>

        {params.notice ? <Notice type={params.notice} saved={t("notices.saved")} invalid={t("notices.invalid")} /> : null}

        <form action={updateJamaahProfileAction} className="mt-6 grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-extrabold text-[var(--charcoal)]" htmlFor="name">
              {t("fields.name")}
              <input id="name" name="name" className="auth-input pl-4" type="text" autoComplete="name" defaultValue={profile.name} required minLength={2} maxLength={160} />
            </label>
            <label className="grid gap-2 text-sm font-extrabold text-[var(--charcoal)]" htmlFor="email">
              {t("fields.email")}
              <input id="email" className="auth-input pl-4" type="email" defaultValue={profile.email} disabled aria-describedby="email-helper" />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-extrabold text-[var(--charcoal)]" htmlFor="phone">
            {t("fields.phone")}
            <input id="phone" name="phone" className="auth-input pl-4" type="tel" autoComplete="tel" defaultValue={profile.phone} maxLength={32} placeholder={t("fields.phonePlaceholder")} />
          </label>
          <p id="email-helper" className="text-sm font-semibold leading-6 text-[var(--text-muted)]">{t("emailHelper")}</p>
          <div className="border-t border-[var(--border)] pt-5">
            <button type="submit" className="min-h-11 w-full rounded-lg bg-[var(--emerald)] px-5 text-sm font-extrabold text-white md:w-fit">
              {t("actions.saveProfile")}
            </button>
          </div>
        </form>
      </section>

      <aside className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
        <UserRound className="size-8 text-[var(--emerald)]" aria-hidden="true" />
        <h2 className="mt-3 text-lg font-extrabold text-[var(--charcoal)]">{t("summary.title")}</h2>
        <div className="mt-4 grid gap-3 text-sm">
          <SummaryItem label={t("summary.memberSince")} value={formatDate(profile.createdAt)} />
          <SummaryItem label={t("summary.currency")} value={profile.preferredCurrency} />
          <div className="rounded-xl border border-[var(--border)] p-3">
            <p className="text-xs font-bold text-[var(--text-muted)]">{t("summary.verification")}</p>
            <div className="mt-2 flex items-center gap-2">
              <BadgeCheck className="size-4 text-[var(--emerald)]" aria-hidden="true" />
              <StatusBadge label={profile.emailVerified ? t("summary.verified") : t("summary.notVerified")} variant={profile.emailVerified ? "success" : "warning"} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Notice({ type, saved, invalid }: { readonly type: string; readonly saved: string; readonly invalid: string }): ReactElement | null {
  if (type === "saved") return <p className="mt-5 rounded-xl border border-[var(--emerald)]/20 bg-[var(--emerald)]/5 px-4 py-3 text-sm font-bold text-[var(--emerald)]" role="status">{saved}</p>;
  if (type === "invalid") return <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[var(--error)]" role="alert">{invalid}</p>;
  return null;
}

function SummaryItem({ label, value }: { readonly label: string; readonly value: string }): ReactElement {
  return <div className="rounded-xl border border-[var(--border)] p-3"><p className="text-xs font-bold text-[var(--text-muted)]">{label}</p><p className="mt-1 font-extrabold text-[var(--charcoal)]">{value}</p></div>;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
