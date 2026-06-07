import type { ReactElement } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Admin General Profile",
};

const ACTIVITY_KEYS = ["login", "password", "session"] as const;

export default async function AdminProfilePage(): Promise<ReactElement> {
  const t = await getTranslations("Admin.profile");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
      <section className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-[0_10px_28px_rgba(22,33,28,0.05)]">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-lg bg-[var(--emerald)] text-2xl font-extrabold text-white">A</div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-[var(--charcoal)]">{t("name")}</h1>
            <p className="mt-1 text-sm font-bold text-[var(--text-muted)]">{t("role")}</p>
          </div>
        </div>
        <p className="mt-5 text-sm leading-7 text-[var(--text-muted)]">{t("description")}</p>

        <form className="mt-8 grid gap-5" action="#">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-extrabold text-[var(--charcoal)]">
              Nama Lengkap
              <input className="auth-input pl-4" type="text" defaultValue={t("name")} />
            </label>
            <label className="grid gap-2 text-sm font-extrabold text-[var(--charcoal)]">
              Email
              <input className="auth-input pl-4" type="email" defaultValue="admin@wifme.com" />
            </label>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-extrabold text-[var(--charcoal)]">
              Nomor Telepon
              <input className="auth-input pl-4" type="tel" defaultValue="+62 812 3456 7890" />
            </label>
            <label className="grid gap-2 text-sm font-extrabold text-[var(--charcoal)]">
              Bio / Deskripsi Singkat
              <input className="auth-input pl-4" type="text" defaultValue={t("description")} />
            </label>
          </div>
          
          <div className="mt-4 border-t border-[var(--border)] pt-5">
            <button type="submit" className="min-h-11 w-fit rounded-xl bg-[var(--emerald)] px-5 text-sm font-extrabold text-white transition hover:bg-[var(--emerald-light)]">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        <div className="border-b border-[var(--border)] p-5">
          <h2 className="text-xl font-extrabold text-[var(--charcoal)]">{t("activity.title")}</h2>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {ACTIVITY_KEYS.map((key) => (
            <article key={key} className="grid gap-1 p-5">
              <p className="font-extrabold text-[var(--charcoal)]">{t(`activity.items.${key}.title`)}</p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">{t(`activity.items.${key}.desc`)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
