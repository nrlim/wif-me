"use client";

import { useCartStore } from "@/hooks/use-cart-store";
import { formatCurrency } from "@/lib/currency/formatters";
import { cn } from "@/lib/utils/cn";
import { ShoppingCart, X, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useEffect, useSyncExternalStore, type ReactElement } from "react";
import { createPortal } from "react-dom";
import { Link } from "@/i18n/routing";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps): ReactElement {
  const mounted = useSyncExternalStore(subscribeToHydration, getClientSnapshot, getServerSnapshot);
  const cartStore = useCartStore();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!mounted) return <></>;

  const { items, removeItem, updateQuantity, getTotalIdr } = cartStore;
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed bottom-0 right-0 top-0 z-[210] flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] sm:rounded-l-2xl",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--emerald-pale)] text-[var(--emerald)]">
              <ShoppingCart className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[var(--charcoal)]">Keranjang</h2>
              <p className="text-xs font-medium text-[var(--text-muted)]">
                {totalItems} layanan dipilih
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex size-9 items-center justify-center rounded-full bg-[var(--ivory-dark)] text-[var(--text-muted)] transition-colors hover:bg-red-50 hover:text-[var(--error)]"
          >
            <X className="size-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-[var(--ivory)] text-[var(--emerald-light)]">
                <ShoppingCart className="size-10" />
              </div>
              <h3 className="text-lg font-bold text-[var(--charcoal)]">Keranjang Kosong</h3>
              <p className="max-w-[250px] text-sm text-[var(--text-muted)]">
                Temukan layanan pendampingan dan transportasi terbaik untuk perjalanan Anda.
              </p>
              <button
                onClick={() => onOpenChange(false)}
                className="mt-4 rounded-xl border border-[var(--emerald)] px-6 py-2.5 text-sm font-bold text-[var(--emerald)] transition-colors hover:bg-[var(--emerald)] hover:text-white"
              >
                Cari Layanan
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <span className="mb-1 inline-block rounded-md bg-[var(--ivory)] px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-[var(--emerald)]">
                        {item.type.replace("_", " ")}
                      </span>
                      <h4 className="line-clamp-2 text-sm font-bold text-[var(--charcoal)]">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {new Intl.DateTimeFormat("id-ID", {
                          dateStyle: "medium",
                        }).format(item.scheduledStart)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[var(--charcoal)]">
                        {formatCurrency(item.basePriceIdr * item.quantity, "IDR")}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[0.65rem] text-[var(--text-muted)]">
                          {item.quantity} x {formatCurrency(item.basePriceIdr, "IDR")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="size-3.5" /> Hapus
                    </button>
                    
                    <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--ivory)] p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex size-7 items-center justify-center rounded-md bg-white text-[var(--charcoal)] shadow-sm disabled:opacity-50"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[var(--charcoal)]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex size-7 items-center justify-center rounded-md bg-white text-[var(--charcoal)] shadow-sm"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t bg-[var(--ivory)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-[var(--text-muted)]">Total Pembayaran</span>
              <span className="text-xl font-black text-[var(--emerald)]">
                {formatCurrency(getTotalIdr(), "IDR")}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={() => onOpenChange(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--emerald)] py-3.5 font-bold text-white shadow-md shadow-[var(--emerald)]/20 transition-transform active:scale-[0.98] hover:bg-[var(--emerald-light)]"
            >
              Lanjut ke Pembayaran <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}

function subscribeToHydration(): () => void {
  return () => undefined;
}

function getClientSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}
