"use client";

import { Link, useRouter } from "@/i18n/routing";
import { KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import { PasswordInput } from "@/components/shared/password-input";

type ResetPasswordFormCardProps = {
  readonly email: string;
};

type ProblemResponse = {
  readonly detail?: string;
};

function isProblemResponse(value: unknown): value is ProblemResponse {
  return typeof value === "object" && value !== null;
}

export function ResetPasswordFormCard({ email }: ResetPasswordFormCardProps): ReactElement {
  const router = useRouter();
  const t = useTranslations("Auth.resetPassword");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const otp = String(formData.get("otp") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const response = await fetch("/api/auth/password-resets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });

      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        setErrorMessage(isProblemResponse(payload) && payload.detail ? payload.detail : t("errors.invalid"));
        return;
      }

      router.push("/login");
    } catch {
      setErrorMessage(t("errors.network"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full rounded-[12px] border border-[var(--border)] bg-white/92 p-4 shadow-[0_18px_54px_rgba(21,35,29,0.11)] backdrop-blur sm:p-5 lg:p-6">
      <div className="mb-5 border-l-2 border-[var(--gold)] pl-3 lg:pl-4">
        <KeyRound className="mb-3 size-7 text-[var(--emerald)]" aria-hidden="true" />
        <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-[var(--gold)]">{t("eyebrow")}</p>
        <h1 className="mt-1.5 text-[1.55rem] font-black leading-[1.05] tracking-[-0.035em] text-[var(--charcoal)] sm:text-[1.78rem] lg:text-[1.95rem]">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-[34rem] text-[0.82rem] leading-5 text-[var(--text-muted)] lg:text-[0.88rem] lg:leading-6">
          {t("description", { email })}
        </p>
      </div>

      <form className="grid gap-3" onSubmit={handleSubmit}>
        <FieldFrame icon={<KeyRound className="size-4 text-[var(--text-muted)]" aria-hidden="true" />} htmlFor="otp" label={t("otpLabel")}>
          <input id="otp" name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required className="auth-input auth-input-icon tracking-[0.32em]" placeholder="000000" />
        </FieldFrame>
        <div className="grid gap-1">
          <label className="text-[0.73rem] font-extrabold text-[var(--charcoal)]" htmlFor="password">{t("passwordLabel")}</label>
          <PasswordInput id="password" name="password" autoComplete="new-password" minLength={8} required className="auth-input auth-input-icon" placeholder={t("passwordPlaceholder")} />
        </div>

        {errorMessage ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold leading-6 text-[var(--error)]" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button type="submit" disabled={isSubmitting} className="flex h-11 w-full items-center justify-center rounded-[9px] bg-[var(--emerald)] text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(27,107,74,0.2)] disabled:cursor-not-allowed disabled:opacity-60 lg:h-12">
          {isSubmitting ? t("submitting") : t("submit")}
        </button>
      </form>

      <div className="mt-4 border-t border-[var(--border)] pt-3 text-xs font-bold text-[var(--text-muted)]">
        <Link href="/login" className="text-[var(--emerald)] underline-offset-4 hover:underline">
          {t("backToLogin")}
        </Link>
      </div>
    </section>
  );
}

type FieldFrameProps = {
  readonly children: React.ReactElement;
  readonly htmlFor: string;
  readonly icon: React.ReactElement;
  readonly label: string;
};

function FieldFrame({ children, htmlFor, icon, label }: FieldFrameProps): React.ReactElement {
  return <div className="grid gap-1"><label className="text-[0.73rem] font-extrabold text-[var(--charcoal)]" htmlFor={htmlFor}>{label}</label><div className="relative"><div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">{icon}</div>{children}</div></div>;
}
