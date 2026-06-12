"use client";

import type { ReactElement } from "react";
import { Share2 } from "lucide-react";

type InviteActionsProps = {
  readonly inviteToken: string;
  readonly staffName: string;
  readonly providerName: string;
  readonly labels: {
    readonly share: string;
    readonly copyLink?: string;
    readonly copied?: string;
    readonly pending?: string;
  };
};

function getInviteUrl(token: string): string {
  const base = (typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL) ?? "";
  return `${base}/invite/${token}`;
}

export function InviteActions({ inviteToken, staffName, providerName, labels }: InviteActionsProps): ReactElement {
  const inviteUrl = getInviteUrl(inviteToken);

  const whatsappText = encodeURIComponent(
    `Assalamu'alaikum ${staffName},\n\n${providerName} mengundang Anda untuk bergabung sebagai Muthawif di platform Wif-Me.\n\nKlik link berikut untuk mendaftar:\n${inviteUrl}\n\nLink berlaku 7 hari.`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  return (
    <>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 px-2.5 text-xs font-bold text-[#128C7E] transition-colors hover:bg-[#25D366]/20"
        title={labels.share}
      >
        <Share2 className="size-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">{labels.share}</span>
      </a>
    </>
  );
}
