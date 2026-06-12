import { LocationType } from "@prisma/client";
import type { ReactElement } from "react";
import { Link } from "@/i18n/routing";

const LOCATION_TYPES: readonly LocationType[] = ["CITY", "AIRPORT", "TRAIN_STATION", "HOLY_SITE"];

type LocationFormText = {
  readonly name: string;
  readonly type: string;
  readonly countryCode: string;
  readonly isMaster: string;
  readonly submit: string;
  readonly cancel: string;
  readonly types: Record<LocationType, string>;
  readonly placeholders: {
    readonly name: string;
    readonly countryCode: string;
  };
};

type LocationFormValue = {
  readonly id?: string;
  readonly name?: string;
  readonly type?: LocationType;
  readonly countryCode?: string;
  readonly isMaster?: boolean;
};

type LocationFormProps = {
  readonly locale: string;
  readonly action: (formData: FormData) => Promise<never>;
  readonly text: LocationFormText;
  readonly location?: LocationFormValue;
};

export function LocationForm({ locale, action, text, location }: LocationFormProps): ReactElement {
  return (
    <form action={action} className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
      <input type="hidden" name="locale" value={locale} />
      {location?.id ? <input type="hidden" name="id" value={location.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="name">
          {text.name}
          <input id="name" name="name" defaultValue={location?.name ?? ""} placeholder={text.placeholders.name} className="auth-input" required />
        </label>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="type">
          {text.type}
          <select id="type" name="type" defaultValue={location?.type ?? "CITY"} className="auth-select" required>
            {LOCATION_TYPES.map((type) => <option key={type} value={type}>{text.types[type]}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="countryCode">
          {text.countryCode}
          <input id="countryCode" name="countryCode" defaultValue={location?.countryCode ?? "SA"} placeholder={text.placeholders.countryCode} className="auth-input uppercase" minLength={2} maxLength={2} required />
        </label>
        <label className="flex min-h-11 items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--ivory)] px-3 text-sm font-bold text-[var(--charcoal)] md:self-end">
          <input type="checkbox" name="isMaster" defaultChecked={location?.isMaster ?? true} className="size-4 accent-[var(--emerald)]" />
          {text.isMaster}
        </label>
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href="/admin/lookup/locations" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-extrabold text-[var(--charcoal)]">{text.cancel}</Link>
        <button type="submit" className="min-h-11 rounded-lg bg-[var(--emerald)] px-5 text-sm font-extrabold text-white">{text.submit}</button>
      </div>
    </form>
  );
}
