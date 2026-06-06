import type { ReactElement } from "react";
import Link from "next/link";
import { CalendarDays, CreditCard, Search, FileText } from "lucide-react";

export default function JamaahDashboardPage(): ReactElement {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[var(--charcoal)]">Dashboard Jamaah</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Selamat datang kembali! Berikut ringkasan perjalanan ibadah Anda.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--emerald)]/10 text-[var(--emerald)]">
              <CalendarDays className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-muted)]">Booking Aktif</p>
              <p className="text-2xl font-black text-[var(--charcoal)]">1</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold)]">
              <CreditCard className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-muted)]">Status Escrow</p>
              <p className="text-lg font-black text-[var(--charcoal)]">Menunggu</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-muted)]">Status Visa</p>
              <p className="text-lg font-black text-[var(--charcoal)]">Selesai</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[var(--border)] px-6 py-5">
          <h2 className="text-base font-bold text-[var(--charcoal)]">Jadwal Mendatang</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 rounded-xl border border-[var(--emerald)]/20 bg-[var(--emerald)]/5 p-4">
            <div className="flex flex-col items-center justify-center rounded-lg bg-white px-4 py-2 shadow-sm">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Okt</span>
              <span className="text-xl font-black text-[var(--emerald)]">15</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[var(--charcoal)]">Umrah Reguler Pendampingan</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">Muthawif: Ustadz Ahmad Fauzie</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Lokasi: Mekkah, Arab Saudi</p>
            </div>
            <div>
              <span className="inline-flex rounded-full bg-[var(--emerald)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--emerald)]">
                Terkonfirmasi
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-base font-bold text-[var(--charcoal)]">Akses Cepat</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/search" className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-white p-4 transition-colors hover:border-[var(--emerald)] hover:bg-[var(--emerald)]/5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--emerald)]/10 text-[var(--emerald)]">
              <Search className="size-5" />
            </div>
            <div>
              <p className="font-bold text-[var(--charcoal)]">Cari Muthawif</p>
              <p className="text-xs text-[var(--text-muted)]">Temukan pendamping ibadah baru</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
