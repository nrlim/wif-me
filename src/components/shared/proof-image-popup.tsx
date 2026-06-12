"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

type ProofImagePopupProps = {
  readonly url: string;
  readonly alt: string;
};

export function ProofImagePopup({ url, alt }: ProofImagePopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        type="button" 
        onClick={() => setIsOpen(true)} 
        className="block w-full cursor-zoom-in hover:opacity-95 transition-opacity bg-black/5"
        title="Klik untuk memperbesar"
      >
        <Image src={url} alt={alt} width={400} height={560} className="h-auto max-h-[280px] w-full object-contain" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="relative max-h-full max-w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="absolute -right-3 -top-12 sm:-right-10 sm:-top-0 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md"
              aria-label="Tutup"
            >
              <X className="size-6" />
            </button>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
              <Image src={url} alt={alt} width={1200} height={1600} className="h-auto max-h-[85vh] w-auto max-w-[90vw] object-contain" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
