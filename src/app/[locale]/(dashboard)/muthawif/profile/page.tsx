import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { BadgeCheck, Languages, MapPin, UserRound } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { UserRole } from "@prisma/client";
import { updateMuthawifProfileAction } from "@/app/[locale]/(dashboard)/muthawif/actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getMuthawifProfile } from "@/lib/partner/data";

export const metadata: Metadata = { title: "General Profile Muthawif" };

type MuthawifProfilePageProps = {
  readonly searchParams: Promise<{ readonly notice?: string }>;
};

export default async function MuthawifProfilePage({ searchParams }: MuthawifProfilePageProps): Promise<ReactElement> {
  const session = await requireRoleSession([UserRole.MUTHAWIF]);
  const [t, common, params, profile] = await Promise.all([
    getTranslations("Partner.muthawif.profile"),
    getTranslations("Partner.common"),
    searchParams,
    getMuthawifProfile(session.userId),
  ]);

  if (!profile) notFound();

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <section className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-xl bg-[var(--emerald)] text-xl font-extrabold text-white">{profile.displayName.charAt(0).toUpperCase()}</div>
          <div>
            <h1 className="text-xl font-extrabold tracking-[-0.03em] text-[var(--charcoal)]">{profile.displayName}</h1>
            <p className="mt-1 text-sm font-bold text-[var(--text-muted)]">{profile.email}</p>
          </div>
        </div>

        {params.notice ? <Notice type={params.notice} saved={t("notices.saved")} invalid={t("notices.invalid")} /> : null}

        <form action={updateMuthawifProfileAction} className="mt-6 grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t("fields.name")} htmlFor="name"><input id="name" name="name" className="auth-input pl-4" type="text" autoComplete="name" defaultValue={profile.name} required minLength={2} maxLength={160} /></Field>
            <Field label={t("fields.displayName")} htmlFor="displayName"><input id="displayName" name="displayName" className="auth-input pl-4" type="text" defaultValue={profile.displayName} required minLength={2} maxLength={180} /></Field>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t("fields.phone")} htmlFor="phone"><input id="phone" name="phone" className="auth-input pl-4" type="tel" autoComplete="tel" defaultValue={profile.phone} maxLength={32} placeholder={t("fields.phonePlaceholder")} /></Field>
            <Field label={t("fields.baseCity")} htmlFor="baseCity"><input id="baseCity" name="baseCity" className="auth-input pl-4" type="text" defaultValue={profile.baseCity} maxLength={120} placeholder={t("fields.baseCityPlaceholder")} /></Field>
          </div>
          <Field label={t("fields.email")} htmlFor="email"><input id="email" className="auth-input pl-4" type="email" defaultValue={profile.email} disabled aria-describedby="email-helper" /></Field>
          <Field label={t("fields.languages")} htmlFor="languages"><input id="languages" name="languages" className="auth-input pl-4" type="text" defaultValue={profile.languages.join(", ")} maxLength={240} placeholder={t("fields.languagesPlaceholder")} /></Field>
          <label className="grid gap-2 text-sm font-extrabold text-[var(--charcoal)]" htmlFor="bio">
            {t("fields.bio")}
            <textarea id="bio" name="bio" rows={5} className="min-h-32 rounded-lg border border-[#dfe4df] bg-[#fbfaf6] px-4 py-3 text-sm font-semibold text-[var(--charcoal)] outline-none focus:border-[var(--emerald)] focus:bg-white" defaultValue={profile.bio} maxLength={800} placeholder={t("fields.bioPlaceholder")} />
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
          <SummaryItem icon={<BadgeCheck className="size-4" aria-hidden="true" />} label={t("summary.verification")} value={common(`verification.${profile.verificationStatus}`)} />
          <SummaryItem icon={<MapPin className="size-4" aria-hidden="true" />} label={t("summary.city")} value={profile.baseCity || "-"} />
          <SummaryItem icon={<Languages className="size-4" aria-hidden="true" />} label={t("summary.languages")} value={profile.languages.length > 0 ? profile.languages.join(", ") : "-"} />
          <div className="rounded-xl border border-[var(--border)] p-3"><p className="text-xs font-bold text-[var(--text-muted)]">{t("summary.email")}</p><div className="mt-2"><StatusBadge label={profile.emailVerified ? t("summary.verified") : t("summary.notVerified")} variant={profile.emailVerified ? "success" : "warning"} /></div></div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, htmlFor, children }: { readonly label: string; readonly htmlFor: string; readonly children: ReactElement }): ReactElement {
  return <label className="grid gap-2 text-sm font-extrabold text-[var(--charcoal)]" htmlFor={htmlFor}>{label}{children}</label>;
}

function Notice({ type, saved, invalid }: { readonly type: string; readonly saved: string; readonly invalid: string }): ReactElement | null {
  if (type === "saved") return <p className="mt-5 rounded-xl border border-[var(--emerald)]/20 bg-[var(--emerald)]/5 px-4 py-3 text-sm font-bold text-[var(--emerald)]" role="status">{saved}</p>;
  if (type === "invalid") return <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[var(--error)]" role="alert">{invalid}</p>;
  return null;
}

function SummaryItem({ icon, label, value }: { readonly icon: ReactElement; readonly label: string; readonly value: string }): ReactElement {
  return <div className="rounded-xl border border-[var(--border)] p-3"><p className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">{icon}{label}</p><p className="mt-1 font-extrabold text-[var(--charcoal)]">{value}</p></div>;
}
