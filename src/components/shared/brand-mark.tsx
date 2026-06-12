import { Link } from "@/i18n/routing";
import Image from "next/image";
import type { ReactElement } from "react";

type BrandMarkProps = {
  readonly compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps): ReactElement {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label="Wif-Me beranda">
      <div className="relative grid size-12 place-items-center transition-transform duration-200 group-hover:-translate-y-0.5">
        <Image src="/logo-icon.png" alt="Wif-Me Logo" fill sizes="48px" className="object-contain" />
      </div>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span className="text-base font-extrabold tracking-tight text-[var(--charcoal)]">Wif-Me</span>
          <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">
            Umrah Companion
          </span>
        </span>
      ) : null}
    </Link>
  );
}
