import type { ReactElement } from "react";
import { Building2, UserCheck } from "lucide-react";
import { Link } from "@/i18n/routing";

type PartnerDisplayRow = {
  readonly id: string;
  readonly name: string;
  readonly typeLabel: string;
  readonly type: "personal" | "provider";
  readonly serviceLabel: string;
  readonly city: string;
  readonly bookings: number;
  readonly statusLabel: string;
  readonly statusKey: string;
};

type PartnerListText = { readonly tableTitle: string; readonly partner: string; readonly service: string; readonly city: string; readonly bookings: string; readonly status: string; readonly action: string; readonly review: string; readonly delete: string };

type PartnerListProps = { readonly partners: readonly PartnerDisplayRow[]; readonly text: PartnerListText; readonly actionBasePath: "/admin/partners/muthawif" | "/admin/partners/providers" };

export function PartnerList({ partners, text, actionBasePath }: PartnerListProps): ReactElement {
  return <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[0_10px_28px_rgba(22,33,28,0.05)]"><div className="border-b border-[var(--border)] p-5"><h2 className="text-xl font-extrabold text-[var(--charcoal)]">{text.tableTitle}</h2></div><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[var(--ivory)] text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]"><tr><th scope="col" className="px-5 py-4">{text.partner}</th><th scope="col" className="px-5 py-4">{text.service}</th><th scope="col" className="px-5 py-4">{text.city}</th><th scope="col" className="px-5 py-4">{text.bookings}</th><th scope="col" className="px-5 py-4">{text.status}</th><th scope="col" className="px-5 py-4">{text.action}</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{partners.map((partner) => <PartnerTableRow key={partner.id} partner={partner} text={text} actionBasePath={actionBasePath} />)}</tbody></table></div><div className="grid gap-3 p-3 md:hidden">{partners.map((partner) => <PartnerMobileCard key={partner.id} partner={partner} text={text} actionBasePath={actionBasePath} />)}</div></section>;
}

function PartnerTableRow({ partner, text, actionBasePath }: { readonly partner: PartnerDisplayRow; readonly text: PartnerListText; readonly actionBasePath: string }): ReactElement {
  const Icon = partner.type === "personal" ? UserCheck : Building2;
  return <tr><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-[var(--emerald-pale)] text-[var(--emerald)]"><Icon className="size-5" aria-hidden="true" /></span><div><p className="font-extrabold text-[var(--charcoal)]">{partner.name}</p><p className="text-xs font-bold text-[var(--text-muted)]">{partner.typeLabel}</p></div></div></td><td className="px-5 py-4 font-bold text-[var(--text-muted)]">{partner.serviceLabel}</td><td className="px-5 py-4 font-bold text-[var(--text-muted)]">{partner.city}</td><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{partner.bookings}</td><td className="px-5 py-4"><StatusPill label={partner.statusLabel} status={partner.statusKey} /></td><td className="px-5 py-4"><div className="flex gap-2"><Link href={`${actionBasePath}/${partner.id}/edit`} className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 font-extrabold text-[var(--charcoal)]">{text.review}</Link><Link href={`${actionBasePath}/${partner.id}/delete`} className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 font-extrabold text-[var(--error)]">{text.delete}</Link></div></td></tr>;
}

function PartnerMobileCard({ partner, text, actionBasePath }: { readonly partner: PartnerDisplayRow; readonly text: PartnerListText; readonly actionBasePath: string }): ReactElement {
  const Icon = partner.type === "personal" ? UserCheck : Building2;
  return <article className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between gap-3"><p className="text-xs font-bold text-[var(--text-muted)]">{partner.typeLabel}</p><StatusPill label={partner.statusLabel} status={partner.statusKey} /></div><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--ivory)] text-[var(--emerald)]"><Icon className="size-5" aria-hidden="true" /></span><div className="min-w-0 flex-1"><h3 className="font-extrabold text-[var(--charcoal)]">{partner.name}</h3><p className="mt-0.5 text-xs font-bold text-[var(--text-muted)]">{partner.serviceLabel} • {partner.city}</p></div></div><div className="mt-4 flex items-end justify-between gap-4"><div><p className="text-xs font-bold text-[var(--text-muted)]">{text.bookings}</p><p className="mt-0.5 text-lg font-extrabold text-[var(--charcoal)]">{partner.bookings}</p></div><div className="flex gap-2"><Link href={`${actionBasePath}/${partner.id}/edit`} className="inline-flex min-h-9 items-center rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-extrabold text-[var(--charcoal)]">{text.review}</Link><Link href={`${actionBasePath}/${partner.id}/delete`} className="inline-flex min-h-9 items-center rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-extrabold text-[var(--error)]">{text.delete}</Link></div></div></article>;
}

function StatusPill({ label, status }: { readonly label: string; readonly status: string }): ReactElement { 
  let colors = "bg-[var(--emerald)]/10 text-[var(--emerald)]";
  if (status === "review" || status === "paused") colors = "bg-[var(--gold)]/10 text-[var(--gold)]";
  return <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${colors}`}>{label}</span>; 
}
