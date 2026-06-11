"use client";

import type { FormEvent, ReactElement } from "react";
import { Handshake, MapPin, Search } from "lucide-react";
import { useRouter } from "@/i18n/routing";

type ServiceSearchOption = {
  readonly value: string;
  readonly label: string;
};

type LandingServiceSearchFormProps = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly label: string;
  readonly button: string;
  readonly note: string;
  readonly pills: readonly string[];
  readonly options: readonly ServiceSearchOption[];
};

export function LandingServiceSearchForm({
  eyebrow,
  title,
  description,
  label,
  button,
  note,
  pills,
  options,
}: LandingServiceSearchFormProps): ReactElement {
  const router = useRouter();
  const defaultValue = options[0]?.value ?? "muthawif";

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const selectedService = String(formData.get("service") ?? defaultValue);
    const safeService = options.some((option) => option.value === selectedService) ? selectedService : defaultValue;

    router.push(`/services/${safeService}`);
  }

  return (
    <form className="w-full max-w-[390px] rounded-[14px] border border-white/80 bg-white/94 p-5 shadow-[0_24px_58px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:p-6 lg:max-w-[460px] lg:p-7" onSubmit={handleSubmit}>
      <div className="mb-5 border-l-2 border-[var(--gold)] pl-4 lg:mb-6">
        <div className="mb-2 flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[var(--gold)]"><Handshake className="size-4" aria-hidden="true" />{eyebrow}</div>
        <h2 className="text-xl font-black leading-tight tracking-[-0.03em] text-gray-950 lg:text-2xl">{title}</h2>
        <p className="mt-2 text-xs leading-5 text-gray-500 lg:max-w-[22rem] lg:text-sm lg:leading-6">{description}</p>
      </div>
      <label htmlFor="service" className="mb-2 flex items-center gap-1.5 text-[0.72rem] font-extrabold uppercase tracking-[0.07em] text-gray-500"><MapPin className="size-[13px] text-[var(--emerald)]" aria-hidden="true" /> {label}</label>
      <select id="service" name="service" className="mb-4 h-12 w-full rounded-[10px] border border-gray-200 bg-[#FAFAF8] px-4 text-sm font-bold text-gray-900 outline-none transition-colors focus:border-[var(--emerald)] lg:h-[52px]" defaultValue={defaultValue}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <div className="mb-5 grid grid-cols-3 gap-2 text-center">{pills.map((pill) => <Pill key={pill}>{pill}</Pill>)}</div>
      <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--emerald)] text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(27,107,74,0.28)] transition-colors duration-200 hover:bg-[var(--emerald-light)] lg:h-[52px]"><Search className="size-[18px]" aria-hidden="true" /> {button}</button>
      <p className="mt-3 text-center text-[0.7rem] leading-5 text-gray-400">{note}</p>
    </form>
  );
}

function Pill({ children }: { readonly children: string }): ReactElement {
  return <span className="inline-flex items-center justify-center rounded-[8px] border border-[var(--emerald)]/15 bg-[var(--emerald)]/[0.06] px-2 py-1 text-[0.66rem] font-bold text-[var(--emerald)] lg:px-3 lg:py-1.5 lg:text-[0.72rem]">{children}</span>;
}
