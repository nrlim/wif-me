"use client";

import { KeyRound, Mail, User } from "lucide-react";
import { PasswordInput } from "@/components/shared/password-input";
import { useRouter } from "@/i18n/routing";
import type { FormEvent, ReactElement } from "react";
import { useState } from "react";

type InviteAcceptFormProps = {
  readonly token: string;
  readonly recipientEmail: string;
  readonly recipientName: string;
  readonly providerName: string;
};

export function InviteAcceptForm({ token, recipientEmail, recipientName, providerName }: InviteAcceptFormProps): ReactElement {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const response = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const detail = typeof payload === "object" && payload !== null && "detail" in payload
          ? String((payload as { detail: string }).detail)
          : "Gagal membuat akun. Periksa data dan coba lagi.";
        setErrorMessage(detail);
        return;
      }

      router.push({ pathname: "/verify-email", query: { email: recipientEmail } });
    } catch {
      setErrorMessage("Koneksi bermasalah. Coba beberapa saat lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full rounded-[12px] border border-[var(--border)] bg-white/92 p-4 shadow-[0_18px_54px_rgba(21,35,29,0.11)] backdrop-blur sm:p-5 lg:p-6">
      <div className="mb-4 border-l-2 border-[var(--gold)] pl-3 lg:mb-5 lg:pl-4">
        <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-[var(--gold)]">Undangan Provider</p>
        <h1 className="mt-1.5 text-[1.55rem] font-black leading-[1.05] tracking-[-0.035em] text-[var(--charcoal)] sm:text-[1.78rem] lg:text-[1.95rem]">
          Bergabung sebagai Muthawif
        </h1>
        <p className="mt-2 max-w-[34rem] text-[0.82rem] leading-5 text-[var(--text-muted)] lg:text-[0.88rem] lg:leading-6">
          <strong>{providerName}</strong> mengundang Anda untuk mendaftar di Wif-Me. Lengkapi data berikut untuk membuat akun.
        </p>
      </div>

      <form className="grid gap-2.5 lg:gap-3" onSubmit={handleSubmit}>
        {/* Email — readonly, prefilled */}
        <div className="grid gap-1">
          <label className="text-[0.73rem] font-extrabold text-[var(--charcoal)]" htmlFor="email">Email</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="size-4 text-[var(--text-muted)]" aria-hidden="true" />
            </div>
            <input
              id="email"
              type="email"
              value={recipientEmail}
              readOnly
              className="auth-input auth-input-icon cursor-not-allowed bg-[var(--ivory)] opacity-70"
            />
          </div>
          <p className="text-[0.7rem] font-semibold text-[var(--text-muted)]">
            Email sudah ditentukan oleh provider dan tidak dapat diubah.
          </p>
        </div>

        {/* Name */}
        <div className="grid gap-1">
          <label className="text-[0.73rem] font-extrabold text-[var(--charcoal)]" htmlFor="name">Nama Lengkap</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="size-4 text-[var(--text-muted)]" aria-hidden="true" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              defaultValue={recipientName}
              className="auth-input auth-input-icon"
              placeholder="Nama sesuai identitas"
            />
          </div>
        </div>

        {/* Password */}
        <div className="grid gap-1">
          <label className="text-[0.73rem] font-extrabold text-[var(--charcoal)]" htmlFor="password">Kata Sandi</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-muted)]">
              <KeyRound className="size-4" aria-hidden="true" />
            </div>
            <PasswordInput
              id="password"
              name="password"
              required
              minLength={8}
              className="auth-input auth-input-icon pl-10"
              placeholder="Minimal 8 karakter dengan huruf dan angka"
            />
          </div>
        </div>

        {errorMessage ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold leading-6 text-[var(--error)]" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex h-11 w-full items-center justify-center rounded-[9px] bg-[var(--emerald)] text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(27,107,74,0.2)] transition duration-200 hover:bg-[var(--emerald-light)] focus:outline-none focus:ring-4 focus:ring-[var(--emerald)]/20 disabled:cursor-not-allowed disabled:opacity-60 lg:h-12"
        >
          {isSubmitting ? "Memproses..." : "Buat Akun Muthawif"}
        </button>
      </form>

      <div className="mt-4 border-t border-[var(--border)] pt-3">
        <p className="text-xs font-semibold leading-5 text-[var(--text-muted)]">
          Dengan membuat akun, Anda menyetujui bahwa data ini digunakan untuk layanan pendampingan ibadah di platform Wif-Me.
        </p>
      </div>
    </section>
  );
}
