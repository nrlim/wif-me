"use client";

import { useCartStore } from "@/hooks/use-cart-store";
import { type PublicOfferingRow } from "@/lib/services/public-data";
import { Plus, ShoppingCart, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useState, type ReactElement } from "react";
import { cn } from "@/lib/utils/cn";

interface AddToCartButtonProps {
  service: PublicOfferingRow;
  canCheckout: boolean;
  registerLabel: string;
}

export function AddToCartButton({ service, canCheckout, registerLabel }: AddToCartButtonProps): ReactElement {
  const { items, addItem } = useCartStore();
  const [added, setAdded] = useState(false);

  const cartItem = items.find((item) => item.serviceOfferingId === service.id);

  if (!canCheckout) {
    const href = `/register?next=${encodeURIComponent(`/services`)}`;
    return (
      <Link href={href} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--emerald)] text-sm font-extrabold text-white transition-opacity hover:opacity-90">
        {registerLabel}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    );
  }

  const handleAddToCart = () => {
    addItem({
      serviceOfferingId: service.id,
      type: service.type,
      title: service.title,
      basePriceIdr: service.basePriceIdr,
      baseCurrency: "IDR",
      priceInBaseCurrency: service.basePriceIdr,
      quantity: 1,
      scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // Default to +7 days, will be adjustable in cart
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={added}
      className={cn(
        "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-extrabold transition-all",
        added
          ? "bg-[var(--gold)] text-white"
          : cartItem
          ? "bg-[var(--emerald-pale)] text-[var(--emerald)] border border-[var(--emerald)]/30 hover:bg-[var(--emerald)] hover:text-white"
          : "bg-[var(--emerald)] text-white hover:opacity-90"
      )}
    >
      {added ? (
        <>Ditambahkan!</>
      ) : cartItem ? (
        <>
          <ShoppingCart className="size-4" aria-hidden="true" />
          + Tambah Lagi ({cartItem.quantity})
        </>
      ) : (
        <>
          <Plus className="size-4" aria-hidden="true" />
          Tambah ke Keranjang
        </>
      )}
    </button>
  );
}
