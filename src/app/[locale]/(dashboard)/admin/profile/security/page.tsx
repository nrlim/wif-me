import type { ReactElement } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShieldCheck, KeyRound } from "lucide-react";
import { PasswordInput } from "@/components/shared/password-input";

export const metadata: Metadata = {
  title: "Admin Keamanan & Password",
};

export default async function AdminSecurityPage(): Promise<ReactElement> {
  const t = await getTranslations("Admin.profile");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-[0_10px_28px_rgba(22,33,28,0.05)]">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[var(--emerald-pale)] text-[var(--emerald)]">
            <KeyRound className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-[var(--charcoal)]">{t("changePassword.title")}</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{t("changePassword.desc")}</p>
          </div>
        </div>

        <form className="mt-6 grid gap-5" action="#">
          <label className="grid gap-2 text-sm font-extrabold text-[var(--charcoal)]">
            {t("changePassword.current")}
            <PasswordInput id="currentPassword" name="currentPassword" required className="auth-input pl-4" autoComplete="current-password" />
          </label>
          <label className="grid gap-2 text-sm font-extrabold text-[var(--charcoal)]">
            {t("changePassword.next")}
            <PasswordInput id="newPassword" name="newPassword" required className="auth-input pl-4" autoComplete="new-password" minLength={8} />
          </label>
          <label className="grid gap-2 text-sm font-extrabold text-[var(--charcoal)]">
            {t("changePassword.confirm")}
            <PasswordInput id="confirmPassword" name="confirmPassword" required className="auth-input pl-4" autoComplete="new-password" minLength={8} />
          </label>
          <p className="text-sm leading-6 text-[var(--text-muted)]">{t("changePassword.helper")}</p>
          <button type="submit" className="min-h-11 w-fit rounded-xl bg-[var(--emerald)] px-5 text-sm font-extrabold text-white">
            {t("changePassword.submit")}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-[0_10px_28px_rgba(22,33,28,0.05)]">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[var(--emerald-pale)] text-[var(--emerald)]">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-[var(--charcoal)]">{t("security.title")}</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{t("security.desc")}</p>
          </div>
        </div>
        <div className="mt-6 rounded-lg bg-[var(--ivory)] p-4 text-sm font-bold text-[var(--text-muted)] leading-6">
          <p>Login Terakhir: Hari ini, 09:41</p>
          <p>IP Address: 192.168.1.1</p>
          <p>Perangkat: Chrome / MacOS</p>
        </div>
      </section>
    </div>
  );
}
