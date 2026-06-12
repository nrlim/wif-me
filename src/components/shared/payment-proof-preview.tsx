import type { ReactElement } from "react";
import { ProofImagePopup } from "./proof-image-popup";

export function PaymentProofPreview({ 
  proofUrl, 
  fileName, 
  mimeType, 
  viewLabel 
}: { 
  readonly proofUrl: string | null; 
  readonly fileName: string | null; 
  readonly mimeType: string | null; 
  readonly viewLabel: string 
}): ReactElement | null {
  if (!proofUrl) return null;

  if (mimeType?.startsWith("image/")) {
    return (
      <div className="mb-4 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--ivory)]">
        <ProofImagePopup url={proofUrl} alt={fileName ?? viewLabel} />
        <div className="border-t border-[var(--border)] bg-white px-3 py-2 text-xs font-bold text-[var(--text-muted)] truncate">
          {fileName ?? viewLabel}
        </div>
      </div>
    );
  }

  return (
    <a 
      href={proofUrl} 
      target="_blank" 
      rel="noreferrer" 
      className="mb-4 inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--ivory)] px-4 text-sm font-extrabold text-[var(--charcoal)] transition-colors hover:bg-gray-50"
    >
      {fileName ?? viewLabel}
    </a>
  );
}
