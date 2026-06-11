import type { Metadata } from "next";
import type { ReactElement } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { UserRole } from "@prisma/client";
import { updateJamaahPasswordAction } from "@/app/[locale]/(dashboard)/jamaah/actions";
import { requireRoleSession } from "@/lib/auth/current-session";

export const metadata: Metadata = { title: "Change Password" };

type JamaahSecurityPageProps = {
  readonly searchParams: Promise<{ readonly notice?: string }>;
};

export default async function JamaahSecurityPage({ searchParams }: JamaahSecurityPageProps): Promise<ReactElement> {
  await requireRoleSession([UserRole.JAMAAH]);
  const [t, params] = await Promise.all([getTranslations("Jamaah.profile"), searchParams]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <section className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--emerald-pale)] text-[var(--emerald)]">
            <KeyRound className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--charcoal)]">{t("security.title")}</h1>
            <p className="mt-1 text-sm font-semibold leading-6 text-[var(--text-muted)]">{t("security.description")}</p>
          </div>
        </div>

        {params.notice ? <Notice type={params.notice} t={t} /> : null}

        <form action={updateJamaahPasswordAction} className="mt-6 grid gap-5">
          <label className="grid gap-2 text-sm font-extrabold text-[var(--charcoal)]" htmlFor="currentPassword">
            {t("security.currentPassword")}
            <input id="currentPassword" name="currentPassword" className="auth-input pl-4" type="password" autoComplete="current-password" required />
          </label>
          <label className="grid gap-2 text-sm font-extrabold text-[var(--charcoal)]" htmlFor="newPassword">
            {t("security.newPassword")}
            <input id="newPassword" name="newPassword" className="auth-input pl-4" type="password" autoComplete="new-password" required minLength={8} />
          </label>
          <label className="grid gap-2 text-sm font-extrabold text-[var(--charcoal)]" htmlFor="confirmPassword">
            {t("security.confirmPassword")}
            <input id="confirmPassword" name="confirmPassword" className="auth-input pl-4" type="password" autoComplete="new-password" required minLength={8} />
          </label>
          <p className="text-sm font-semibold leading-6 text-[var(--text-muted)]">{t("security.helper")}</p>
          <button type="submit" className="min-h-11 w-full rounded-lg bg-[var(--emerald)] px-5 text-sm font-extrabold text-white md:w-fit">
            {t("actions.savePassword")}
          </button>
        </form>
      </section>

      <aside className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
        <ShieldCheck className="size-8 text-[var(--emerald)]" aria-hidden="true" />
        <h2 className="mt-3 text-lg font-extrabold text-[var(--charcoal)]">{t("security.infoTitle")}</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-muted)]">{t("security.infoDescription")}</p>
        <div className="mt-4 rounded-xl bg-[var(--ivory)] p-4 text-sm font-bold leading-6 text-[var(--text-muted)]">
          <p>{t("security.ruleLetters")}</p>
          <p>{t("security.ruleNumbers")}</p>
          <p>{t("security.rulePrivate")}</p>
        </div>
      </aside>
    </div>
  );
}

function Notice({ type, t }: { readonly type: string; readonly t: (key: string) => string }): ReactElement | null {
  if (type === "password-saved") return <p className="mt-5 rounded-xl border border-[var(--emerald)]/20 bg-[var(--emerald)]/5 px-4 py-3 text-sm font-bold text-[var(--emerald)]" role="status">{t("notices.passwordSaved")}</p>;
  if (type === "current-invalid") return <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[var(--error)]" role="alert">{t("notices.currentInvalid")}</p>;
  if (type === "invalid") return <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[var(--error)]" role="alert">{t("notices.passwordInvalid")}</p>;
  return null;
}
