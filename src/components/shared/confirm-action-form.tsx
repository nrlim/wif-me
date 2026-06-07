"use client";

import { useState, type ReactElement } from "react";
import { AlertTriangle, X } from "lucide-react";

type HiddenField = {
  readonly name: string;
  readonly value: string;
};

type ConfirmActionFormProps = {
  readonly action: (formData: FormData) => Promise<never>;
  readonly fields: readonly HiddenField[];
  readonly triggerLabel: string;
  readonly title: string;
  readonly description: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
};

export function ConfirmActionForm({ action, fields, triggerLabel, title, description, confirmLabel, cancelLabel }: ConfirmActionFormProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="min-h-11 rounded-lg bg-[var(--error)] px-5 text-sm font-extrabold text-white">{triggerLabel}</button>
      {isOpen ? (
        <div className="fixed inset-0 z-[230] flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm md:items-center">
          <section role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-xl border border-[var(--border)] bg-white p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)]">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[var(--error)]"><AlertTriangle className="size-5" aria-hidden="true" /></span>
              <div className="min-w-0 flex-1"><h2 id="confirm-title" className="text-lg font-extrabold text-[var(--charcoal)]">{title}</h2><p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{description}</p></div>
              <button type="button" aria-label={cancelLabel} onClick={() => setIsOpen(false)} className="flex size-9 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--ivory)]"><X className="size-4" aria-hidden="true" /></button>
            </div>
            <form action={action} className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {fields.map((field) => <input key={field.name} type="hidden" name={field.name} value={field.value} />)}
              <button type="button" onClick={() => setIsOpen(false)} className="min-h-11 rounded-lg border border-[var(--border)] px-4 text-sm font-extrabold text-[var(--charcoal)]">{cancelLabel}</button>
              <button type="submit" className="min-h-11 rounded-lg bg-[var(--error)] px-5 text-sm font-extrabold text-white">{confirmLabel}</button>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
