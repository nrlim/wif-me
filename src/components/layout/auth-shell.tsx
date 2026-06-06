import { Link } from "@/i18n/routing";
import type { ReactElement, ReactNode } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";

type AuthShellProps = {
  readonly children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps): ReactElement {
  return (
    <main className="relative h-dvh overflow-hidden bg-[var(--ivory)] px-4 py-4 sm:px-6 lg:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-36 top-0 h-full w-[58%] skew-x-[-7deg] bg-[var(--emerald)]" />
        <div className="absolute left-[45%] top-16 size-56 rounded-full bg-[var(--emerald-pale)]/70 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex h-11 max-w-6xl items-center justify-between">
        <BrandMark compact />
        <Link
          href="/"
          className="group inline-flex min-h-10 items-center gap-2 rounded-[9px] border border-[var(--border)] bg-white/78 px-4 text-sm font-bold text-[var(--charcoal)] backdrop-blur transition hover:border-[var(--emerald)] hover:text-[var(--emerald)]"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          Kembali
        </Link>
      </div>

      <div className="relative z-10 mx-auto grid h-[calc(100dvh-4.25rem)] max-w-6xl items-center gap-8 py-2 lg:grid-cols-[0.95fr_1fr]">
        <aside className="hidden max-w-lg pr-8 text-white lg:block">
          <div className="mb-5 inline-flex items-center gap-2 border border-white/18 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[var(--gold-light)] backdrop-blur">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Ekosistem terverifikasi
          </div>
          <div className="border-l border-white/18 pl-5">
            <p className="font-amiri text-[2.15rem] leading-[1.7] text-white xl:text-[2.45rem]" lang="ar" dir="rtl">
              وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/86">
              Wa atimmul-hajja wal-‘umrata lillāh.
            </p>
            <p className="mt-2 text-xs leading-6 text-white/64">
              Sempurnakanlah ibadah haji dan umrah karena Allah.
            </p>
          </div>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/76">
            Kelola booking muthawif, provider, transportasi, visa, dan pembayaran escrow dari satu akun Wif-Me.
          </p>
        </aside>

        <div className="mx-auto w-full max-w-[430px] sm:max-w-[450px] lg:mr-4 lg:max-w-[480px]">{children}</div>
      </div>
    </main>
  );
}
