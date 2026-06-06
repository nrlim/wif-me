import { Link } from "@/i18n/routing";
import { Lock, Mail, User } from "lucide-react";
import type { ReactElement } from "react";
import { AUTH_COPY, type AuthMode } from "@/lib/constants/marketing";

type AuthFormCardProps = {
  readonly mode: AuthMode;
};

export function AuthFormCard({ mode }: AuthFormCardProps): ReactElement {
  const copy = AUTH_COPY[mode];
  const isRegister = mode === "register";
  const isForgotPassword = mode === "forgot-password";

  return (
    <section className="w-full rounded-[12px] border border-[var(--border)] bg-white/92 p-4 shadow-[0_18px_54px_rgba(21,35,29,0.11)] backdrop-blur sm:p-5 lg:p-6">
      <div className="mb-4 border-l-2 border-[var(--gold)] pl-3 lg:mb-5 lg:pl-4">
        <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-[var(--gold)]">{copy.eyebrow}</p>
        <h1 className="mt-1.5 text-[1.55rem] font-black leading-[1.05] tracking-[-0.035em] text-[var(--charcoal)] sm:text-[1.78rem] lg:text-[1.95rem]">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-[34rem] text-[0.82rem] leading-5 text-[var(--text-muted)] lg:text-[0.88rem] lg:leading-6">{copy.description}</p>
      </div>

      <form className="grid gap-2.5 lg:gap-3" action="#" method="post">
        {isRegister ? (
          <FieldFrame icon={<User className="size-4 text-[var(--text-muted)]" aria-hidden="true" />} htmlFor="name" label="Nama lengkap">
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="auth-input"
              placeholder="Nama sesuai identitas"
            />
          </FieldFrame>
        ) : null}

        <FieldFrame icon={<Mail className="size-4 text-[var(--text-muted)]" aria-hidden="true" />} htmlFor="email" label="Email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="auth-input"
            placeholder="nama@email.com"
          />
        </FieldFrame>

        {!isForgotPassword ? (
          <FieldFrame icon={<Lock className="size-4 text-[var(--text-muted)]" aria-hidden="true" />} htmlFor="password" label="Kata sandi">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              minLength={8}
              className="auth-input"
              placeholder="Minimal 8 karakter"
            />
          </FieldFrame>
        ) : null}

        {isRegister ? (
          <div className="grid gap-1">
            <label className="text-[0.73rem] font-extrabold text-[var(--charcoal)]" htmlFor="role">
              Daftar sebagai
            </label>
            <select id="role" name="role" required className="auth-select" defaultValue="jamaah">
              <option value="jamaah">Jamaah</option>
              <option value="muthawif">Muthawif</option>
              <option value="provider">Provider</option>
            </select>
          </div>
        ) : null}

        <button
          type="submit"
          className="mt-1 flex h-11 w-full items-center justify-center rounded-[9px] bg-[var(--emerald)] text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(27,107,74,0.2)] transition duration-200 hover:bg-[var(--emerald-light)] focus:outline-none focus:ring-4 focus:ring-[var(--emerald)]/20 lg:h-12"
        >
          {copy.submitLabel}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-3 text-xs font-bold text-[var(--text-muted)]">
        <Link href={copy.alternateHref} className="text-[var(--emerald)] underline-offset-4 hover:underline">
          {copy.alternateLabel}
        </Link>
        {mode === "login" ? (
          <Link href="/forgot-password" className="underline-offset-4 hover:text-[var(--emerald)] hover:underline">
            Lupa kata sandi
          </Link>
        ) : null}
      </div>
    </section>
  );
}

type FieldFrameProps = {
  readonly children: ReactElement;
  readonly htmlFor: string;
  readonly icon: ReactElement;
  readonly label: string;
};

function FieldFrame({ children, htmlFor, icon, label }: FieldFrameProps): ReactElement {
  return (
    <div className="grid gap-1">
      <label className="text-[0.73rem] font-extrabold text-[var(--charcoal)]" htmlFor={htmlFor}>
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">{icon}</div>
        {children}
      </div>
    </div>
  );
}
