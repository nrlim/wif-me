"use client";

import { useEffect, useState, type ReactElement } from "react";
import { CheckCircle2, X } from "lucide-react";

type NoticeKey = "saved" | "deleted" | "approved" | "released";

const NOTICE_MESSAGES: Record<NoticeKey, string> = {
  saved: "Perubahan berhasil disimpan.",
  deleted: "Data berhasil dihapus.",
  approved: "Permintaan berhasil disetujui.",
  released: "Dana escrow berhasil diproses.",
};

export function DashboardFeedback(): ReactElement | null {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const notice = params.get("notice") as NoticeKey | null;
    if (!notice || !(notice in NOTICE_MESSAGES)) return;

    const showTimer = window.setTimeout(() => setMessage(NOTICE_MESSAGES[notice]), 0);
    params.delete("notice");
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);

    const timer = window.setTimeout(() => setMessage(null), 4200);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(timer);
    };
  }, []);

  if (!message) return null;

  return (
    <div className="fixed right-4 top-4 z-[240] w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-[var(--border)] bg-white p-4 shadow-[0_18px_50px_rgba(22,33,28,0.18)] md:right-6 md:top-6">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--emerald)]/10 text-[var(--emerald)]"><CheckCircle2 className="size-5" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1"><p className="font-extrabold text-[var(--charcoal)]">{message}</p><p className="mt-1 text-xs font-medium leading-5 text-[var(--text-muted)]">Status halaman sudah diperbarui.</p></div>
        <button type="button" aria-label="Tutup notifikasi" onClick={() => setMessage(null)} className="flex size-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--ivory)]"><X className="size-4" aria-hidden="true" /></button>
      </div>
    </div>
  );
}
