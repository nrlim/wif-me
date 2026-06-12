"use client";

import { useTranslations } from "next-intl";
import { useCartStore } from "@/hooks/use-cart-store";
import { formatCurrency } from "@/lib/currency/formatters";
import { ShieldCheck, Calendar, Trash2 } from "lucide-react";
import { useState, type ReactElement } from "react";
import { useRouter } from "@/i18n/routing";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { createJamaahOrderAction } from "@/app/[locale]/(dashboard)/jamaah/actions";

export function CheckoutClient(): ReactElement {
  const t = useTranslations("Jamaah.checkout");
  const cartStore = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { items, updateQuantity, removeItem, getTotalIdr } = cartStore;

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const voucherCode = formData.get("voucherCode") as string | undefined;

    try {
      const payload = {
        items: items.map(item => ({
          serviceId: item.serviceOfferingId,
          scheduledStart: item.scheduledStart.toISOString().slice(0, 10),
          quantity: item.quantity,
          notes: (formData.get(`notes-${item.id}`) as string) || "",
        })),
        voucherCode,
      };

      const result = await createJamaahOrderAction(payload);
      if (result.success && result.url) {
        cartStore.clearCart();
        router.push(result.url as Parameters<typeof router.push>[0]);
      } else {
        setError(result.message || "Gagal membuat pesanan");
        setLoading(false);
      }
    } catch {
      setError("Terjadi kesalahan sistem");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-[var(--border)] bg-white p-12 text-center">
        <h2 className="text-xl font-bold text-[var(--charcoal)]">Keranjang Kosong</h2>
        <p className="text-[var(--text-muted)]">Belum ada layanan yang dipilih untuk dipesan.</p>
        <button onClick={() => router.push("/services")} className="mt-4 rounded-lg bg-[var(--emerald)] px-6 py-3 font-bold text-white transition-opacity hover:opacity-90">
          Cari Layanan
        </button>
      </div>
    );
  }

  const subtotal = getTotalIdr();
  const discount = items.length > 1 ? Math.floor(subtotal * 0.05) : 0; // Simple bundling logic preview
  const total = subtotal - discount;

  const today = new Date();
  today.setDate(today.getDate() + 1);
  const minDate = today.toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <DashboardPageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleCheckout} className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--charcoal)]">{t("formTitle")}</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-[var(--text-muted)]">{t("availabilityNote")}</p>
          </div>
          
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-[var(--border)] bg-white p-5">
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <span className="mb-1 inline-block rounded-md bg-[var(--ivory)] px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[var(--emerald)]">
                    {item.type.replace("_", " ")}
                  </span>
                  <h3 className="text-base font-extrabold text-[var(--charcoal)]">{item.title}</h3>
                  <label className="mt-3 grid gap-1.5 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10 p-3 text-sm font-extrabold text-[var(--charcoal)]">
                    <span className="flex items-center gap-2">
                      <Calendar className="size-4 text-[var(--gold)]" aria-hidden="true" />
                      {t("fields.date")} <span className="text-[var(--error)]">*</span>
                    </span>
                    <input 
                      type="date"
                      className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--emerald)]"
                      min={minDate}
                      defaultValue={item.scheduledStart.toISOString().slice(0, 10)}
                      onChange={(e) => {
                        const newDate = new Date(`${e.target.value}T08:00:00.000Z`);
                        if (!isNaN(newDate.getTime())) {
                           useCartStore.getState().updateItem(item.id, { scheduledStart: newDate });
                        }
                      }}
                      required
                    />
                    <span className="text-xs font-semibold leading-5 text-[var(--text-muted)]">{t("fields.dateHelper")}</span>
                  </label>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[var(--charcoal)]">{formatCurrency(item.basePriceIdr * item.quantity, "IDR")}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{item.quantity} x {formatCurrency(item.basePriceIdr, "IDR")}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <label className="grid gap-1.5 text-sm font-bold text-[var(--charcoal)]">
                  {t("fields.notes")}
                  <textarea
                    name={`notes-${item.id}`}
                    rows={2}
                    className="rounded-lg border border-[var(--border)] bg-[var(--ivory)] px-3 py-2 text-sm outline-none focus:border-[var(--emerald)] focus:bg-white"
                    placeholder={t("fields.notesPlaceholder")}
                  />
                </label>

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={() => removeItem(item.id)} className="flex items-center gap-1.5 text-sm font-bold text-red-500 hover:text-red-600">
                    <Trash2 className="size-4" /> Hapus
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[var(--text-muted)]">Jumlah:</span>
                    <div className="flex items-center rounded-lg border border-[var(--border)] bg-white p-1">
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="flex size-7 items-center justify-center rounded bg-[var(--ivory)] font-bold text-[var(--charcoal)] disabled:opacity-50">-</button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex size-7 items-center justify-center rounded bg-[var(--ivory)] font-bold text-[var(--charcoal)]">+</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <aside className="rounded-xl border border-[var(--border)] bg-white p-5 lg:sticky lg:top-[100px]">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--gold)]">{t("summary.eyebrow")}</p>
          <h2 className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-[var(--charcoal)]">Ringkasan Pesanan</h2>
          
          <div className="mt-5 grid gap-3 text-sm">
            <div className="flex items-center gap-3 rounded-xl bg-[var(--ivory)] p-3">
              <ShieldCheck className="size-5 text-[var(--emerald)]" aria-hidden="true" />
              <div>
                <p className="font-bold text-[var(--text-muted)]">{t("summary.escrow")}</p>
                <p className="font-extrabold text-[var(--charcoal)]">{t("summary.escrowValue")}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-col gap-2 rounded-xl border border-[var(--border)] p-3">
              <label className="text-xs font-bold text-[var(--text-muted)]">Punya Kode Voucher?</label>
              <div className="flex gap-2">
                <input type="text" name="voucherCode" placeholder="Masukkan kode..." className="w-full rounded-md border border-[var(--border)] px-3 py-1.5 text-sm uppercase outline-none focus:border-[var(--emerald)]" />
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3 border-t border-[var(--border)] pt-4 text-sm">
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Subtotal ({items.length} Layanan)</span><span className="font-bold text-[var(--charcoal)]">{formatCurrency(subtotal, "IDR")}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-[var(--emerald)]"><span>Diskon Bundling (5%)</span><span className="font-bold">-{formatCurrency(discount, "IDR")}</span></div>
            )}
            <div className="flex justify-between border-t pt-3"><span className="font-bold text-[var(--text-muted)]">Total Pembayaran</span><span className="text-xl font-black text-[var(--emerald)]">{formatCurrency(total, "IDR")}</span></div>
            <p className="mt-2 text-xs font-semibold leading-5 text-[var(--text-muted)]">{t("summary.note")}</p>
          </div>

          <button type="submit" disabled={loading} className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--emerald)] px-5 text-sm font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-50">
            {loading ? "Memproses..." : "Lanjut ke Pembayaran"}
          </button>
        </aside>
      </form>
    </div>
  );
}
