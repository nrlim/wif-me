import type { ReactElement } from "react";
import { Users, FileText, ShieldCheck, CreditCard } from "lucide-react";

export default function AdminDashboardPage(): ReactElement {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[var(--charcoal)]">Dashboard Admin</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Ringkasan statistik platform dan moderasi.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-muted)]">Total Pengguna</p>
              <p className="text-2xl font-black text-[var(--charcoal)]">1,240</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--emerald)]/10 text-[var(--emerald)]">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-muted)]">Menunggu Verifikasi</p>
              <p className="text-2xl font-black text-[var(--charcoal)]">12</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold)]">
              <CreditCard className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-muted)]">Volume Escrow</p>
              <p className="text-lg font-black text-[var(--charcoal)]">SAR 450K</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <FileText className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-muted)]">Total Transaksi</p>
              <p className="text-2xl font-black text-[var(--charcoal)]">342</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[var(--border)] px-6 py-5 flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--charcoal)]">Permintaan Verifikasi Terbaru</h2>
            <button className="text-sm font-bold text-[var(--emerald)] hover:underline">Lihat Semua</button>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {[
              { name: "Siti Aminah", type: "Muthawif", date: "Hari Ini" },
              { name: "PT Umrah Berkah", type: "Provider", date: "Kemarin" },
              { name: "Ali Usman", type: "Muthawif", date: "Kemarin" },
            ].map((req, idx) => (
              <div key={idx} className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[var(--charcoal)]">{req.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{req.type} • {req.date}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded bg-[var(--emerald)]/10 px-3 py-1.5 text-xs font-bold text-[var(--emerald)] hover:bg-[var(--emerald)] hover:text-white transition-colors">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[var(--border)] px-6 py-5 flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--charcoal)]">Aktivitas Escrow</h2>
            <button className="text-sm font-bold text-[var(--emerald)] hover:underline">Lihat Semua</button>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {[
              { ref: "#TRX-8902", amount: "SAR 1,500", status: "Pelepasan Dana (Release)" },
              { ref: "#TRX-8901", amount: "SAR 3,000", status: "Dana Masuk" },
              { ref: "#TRX-8900", amount: "SAR 500", status: "Pelepasan Dana (Release)" },
            ].map((trx, idx) => (
              <div key={idx} className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[var(--charcoal)]">{trx.ref}</p>
                  <p className="text-xs text-[var(--text-muted)]">{trx.status}</p>
                </div>
                <div>
                  <p className="font-bold text-[var(--charcoal)]">{trx.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
