"use client";

import { Link, useRouter } from "@/i18n/routing";
import { MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FormEvent, ReactElement } from "react";
import { useState } from "react";

type EmailOtpFormCardProps = {
  readonly email: string;
};

type ProblemResponse = {
  readonly detail?: string;
};

function isProblemResponse(value: unknown): value is ProblemResponse {
  return typeof value === "object" && value !== null;
}

export function EmailOtpFormCard({ email }: EmailOtpFormCardProps): ReactElement {
  const router = useRouter();
  const t = useTranslations("Auth.verifyEmail");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const otp = String(formData.get("otp") ?? "").trim();

    try {
      const response = await fetch("/api/auth/email-verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
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
        <MailCheck className="mb-3 size-7 text-[var(--emerald)]" aria-hidden="true" />
        <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-[var(--gold)]">{t("eyebrow")}</p>
        <h1 className="mt-1.5 text-[1.55rem] font-black leading-[1.05] tracking-[-0.035em] text-[var(--charcoal)] sm:text-[1.78rem] lg:text-[1.95rem]">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-[34rem] text-[0.82rem] leading-5 text-[var(--text-muted)] lg:text-[0.88rem] lg:leading-6">
          {t("description", { email })}
        </p>
      </div>

      <form className="grid gap-3" onSubmit={handleSubmit}>
        <label className="grid gap-1 text-[0.73rem] font-extrabold text-[var(--charcoal)]" htmlFor="otp">
          {t("otpLabel")}
          <input id="otp" name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required className="auth-input pl-4 tracking-[0.32em]" placeholder="000000" />
        </label>

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
