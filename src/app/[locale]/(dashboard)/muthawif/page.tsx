import type { ReactElement } from "react";
import { CalendarDays, CreditCard, ShieldCheck, Star } from "lucide-react";

export default function MuthawifDashboardPage(): ReactElement {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[var(--charcoal)]">Dashboard Muthawif</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Ringkasan aktivitas dan pendapatan Anda.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--emerald)]/10 text-[var(--emerald)]">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-muted)]">Status Profil</p>
              <p className="text-sm font-black text-[var(--emerald)]">Terverifikasi</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-muted)]">Booking Aktif</p>
              <p className="text-2xl font-black text-[var(--charcoal)]">3</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold)]">
              <CreditCard className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-muted)]">Pendapatan</p>
              <p className="text-lg font-black text-[var(--charcoal)]">SAR 1,200</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Star className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-muted)]">Rating Rata-rata</p>
              <p className="text-2xl font-black text-[var(--charcoal)]">4.9</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[var(--border)] px-6 py-5">
          <h2 className="text-base font-bold text-[var(--charcoal)]">Jadwal Mendatang</h2>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {[
            { date: "Okt 15", title: "Umrah Pendampingan", jamaah: "Bpk. Budi Santoso", status: "Terkonfirmasi" },
            { date: "Okt 20", title: "City Tour Makkah", jamaah: "Keluarga Ibu Siti", status: "Menunggu Pembayaran" },
          ].map((item, idx) => (
            <div key={idx} className="p-6 flex items-center gap-4">
              <div className="flex flex-col items-center justify-center rounded-lg bg-[var(--ivory)] border border-[var(--border)] px-4 py-2">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase">{item.date.split(" ")[0]}</span>
                <span className="text-xl font-black text-[var(--charcoal)]">{item.date.split(" ")[1]}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--charcoal)]">{item.title}</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">Jamaah: {item.jamaah}</p>
              </div>
              <div>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'Terkonfirmasi' ? 'bg-[var(--emerald)]/10 text-[var(--emerald)]' : 'bg-[var(--gold)]/10 text-[var(--gold)]'}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
