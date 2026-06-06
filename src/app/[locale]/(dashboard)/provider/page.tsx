import type { ReactElement } from "react";
import { Users, CarFront, CreditCard, ShieldCheck } from "lucide-react";

export default function ProviderDashboardPage(): ReactElement {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[var(--charcoal)]">Dashboard Provider</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Manajemen staf muthawif dan armada Anda.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--emerald)]/10 text-[var(--emerald)]">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-muted)]">Status Verifikasi</p>
              <p className="text-sm font-black text-[var(--emerald)]">Terverifikasi</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-muted)]">Staf Aktif</p>
              <p className="text-2xl font-black text-[var(--charcoal)]">24</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold)]">
              <CarFront className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-muted)]">Armada Tersedia</p>
              <p className="text-2xl font-black text-[var(--charcoal)]">15</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <CreditCard className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-muted)]">Total Pemasukan</p>
              <p className="text-lg font-black text-[var(--charcoal)]">SAR 15,400</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[var(--border)] px-6 py-5">
          <h2 className="text-base font-bold text-[var(--charcoal)]">Kinerja Staf (B2B Booking)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--ivory)]">
              <tr>
                <th className="px-6 py-4 font-bold text-[var(--charcoal)]">Nama Staf</th>
                <th className="px-6 py-4 font-bold text-[var(--charcoal)]">Booking Bulan Ini</th>
                <th className="px-6 py-4 font-bold text-[var(--charcoal)]">Rating Rata-rata</th>
                <th className="px-6 py-4 font-bold text-[var(--charcoal)]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {[
                { name: "Ahmad Fauzie", booking: 5, rating: "4.9", status: "Tugas" },
                { name: "Zayn Abbas", booking: 3, rating: "5.0", status: "Tersedia" },
                { name: "Fatimah Azzahra", booking: 4, rating: "4.8", status: "Tersedia" },
              ].map((staff) => (
                <tr key={staff.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{staff.name}</td>
                  <td className="px-6 py-4">{staff.booking} perjalanan</td>
                  <td className="px-6 py-4 text-[var(--gold)] font-semibold">★ {staff.rating}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${staff.status === 'Tersedia' ? 'bg-[var(--emerald)]/10 text-[var(--emerald)]' : 'bg-gray-100 text-gray-600'}`}>
                      {staff.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
