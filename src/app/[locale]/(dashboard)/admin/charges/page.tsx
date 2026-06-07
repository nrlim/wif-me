import type { ReactElement } from "react";
import type { Metadata } from "next";
import { FinanceRuleKind } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getFinanceRules } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Pengaturan Charge" };

export default async function AdminChargesPage(): Promise<ReactElement> {
  const t = await getTranslations("Admin.finance");
  const rules = await getFinanceRules(FinanceRuleKind.CHARGE);
  return <div className="flex flex-col gap-6"><section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div className="hidden max-w-3xl md:block"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("charges.eyebrow")}</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)]">{t("charges.title")}</h1><p className="mt-3 text-sm font-medium leading-7 text-[var(--text-muted)]">{t("charges.description")}</p></div><Link href="/admin/charges/new" className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-[var(--emerald)] px-4 text-sm font-extrabold !text-white"><Plus className="size-4 text-white" />{t("actions.add")}</Link></section><section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white"><div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-[var(--ivory)] text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]"><tr><th className="px-5 py-4">{t("settings.name")}</th><th className="px-5 py-4">{t("settings.value")}</th><th className="px-5 py-4">{t("settings.status")}</th><th className="px-5 py-4">{t("table.action")}</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{rules.map((row) => <tr key={row.key}><td className="px-5 py-4"><p className="font-extrabold text-[var(--charcoal)]">{row.title}</p><p className="text-xs font-bold text-[var(--text-muted)]">{row.description}</p></td><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{row.value}</td><td className="px-5 py-4"><Status label={t(`ruleStatuses.${row.status === "ACTIVE" ? "active" : "draft"}`)} status={row.status === "ACTIVE" ? "active" : "draft"} /></td><td className="px-5 py-4"><div className="flex gap-2"><Link href={`/admin/charges/${row.key}/edit`} className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 font-extrabold text-[var(--charcoal)]">{t("actions.edit")}</Link><Link href={`/admin/charges/${row.key}/delete`} className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 font-extrabold text-[var(--error)]">{t("actions.delete")}</Link></div></td></tr>)}</tbody></table></div></section></div>;
}
function Status({ label, status }: { readonly label: string; readonly status: string }): ReactElement { 
  let colors = "bg-[var(--emerald)]/10 text-[var(--emerald)]";
  if (status === "draft") colors = "bg-[var(--gold)]/10 text-[var(--gold)]";
  return <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${colors}`}>{label}</span>; 
}
