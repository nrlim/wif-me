import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactElement } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  BusFront,
  CircleDollarSign,
  CreditCard,
  FileCheck2,
  Globe,
  Mail,
  Moon,
  Phone,
  Route,
  Search,
  ShieldCheck,
  User,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { LandingServiceSearchForm } from "@/components/forms/landing-service-search-form";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { getPublicCategoriesSummary } from "@/lib/services/public-data";

type LocalePageProps = { readonly params: Promise<{ readonly locale: string }> };
type CardText = { readonly title: string; readonly desc: string };
type StepText = CardText & { readonly step: string };

const SERVICE_ICONS = [UserCheck, BusFront, FileCheck2, Route] as const;
const FEATURE_ICONS = [BadgeCheck, ShieldCheck, CircleDollarSign, Route] as const;
const STEP_ICONS = [Search, UsersRound, CreditCard] as const;

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Landing.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LandingPage({ params }: LocalePageProps): Promise<ReactElement> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Landing" });
  const serviceCards = t.raw("services.items") as readonly CardText[];
  const whyItems = t.raw("about.features") as readonly CardText[];
  const roleCards = t.raw("about.roles") as readonly CardText[];
  const workflowItems = t.raw("workflow.items") as readonly StepText[];
  const joinCards = t.raw("join.cards") as readonly CardText[];
  const searchPills = t.raw("searchBox.pills") as readonly string[];
  const footerJoinItems = t.raw("footer.joinItems") as readonly string[];
  const dbCategories = await getPublicCategoriesSummary();
  const SERVICE_VALUES = dbCategories.map((c) => c.slug);
  const visibleServiceCards = serviceCards.slice(0, SERVICE_VALUES.length);
  const searchOptions = visibleServiceCards.map((service, index) => ({ value: SERVICE_VALUES[index] ?? "muthawif", label: service.title }));

  return (
    <>
      <SiteHeader />
      <main className="min-h-dvh overflow-hidden bg-[var(--ivory)] pb-20 text-[var(--charcoal)] min-[900px]:pb-0">
        <section id="home" className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pb-24 pt-[clamp(6rem,12vw,9rem)]" style={{ background: "linear-gradient(155deg, #0a2e1a 0%, #1B6B4A 55%, #27956A 100%)" }}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-[15%] -top-[20%] h-[70vw] max-h-[600px] w-[70vw] max-w-[600px] rounded-full border border-white/5 bg-white/[0.03]" />
            <div className="absolute right-[2%] top-[15%] h-[35vw] max-h-[280px] w-[35vw] max-w-[280px] rounded-full border border-[var(--gold)]/10 bg-[var(--gold)]/[0.07]" />
            <div className="absolute -bottom-[10%] -left-[8%] h-[50vw] max-h-[400px] w-[50vw] max-w-[400px] rounded-full border border-white/5 bg-white/[0.02]" />
          </div>
          <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-10">
            <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:gap-14">
              <div className="flex w-full flex-1 flex-col items-center text-center md:items-start md:text-left">
                <p className="mb-5 font-amiri text-[clamp(1rem,4vw,1.5rem)] leading-[1.8] text-[var(--gold)]/90">{t("hero.bismillah")}</p>
                <div className="mb-4 inline-flex items-center rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--gold-light)]">{t("hero.eyebrow")}</div>
                <h1 className="mb-5 max-w-[650px] text-[clamp(1.875rem,7vw,3.75rem)] font-black leading-[1.15] tracking-tight text-white">
                  {t("hero.titlePrefix")} <span className="bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold)] bg-clip-text text-transparent">{t("hero.titleHighlight")}</span>
                </h1>
                <p className="mb-8 max-w-[520px] text-[clamp(0.9375rem,2.5vw,1.0625rem)] leading-[1.75] text-white/75">{t("hero.description")}</p>
                <div className="mb-10 flex w-full max-w-[400px] flex-col gap-3 md:max-w-none md:flex-row">
                  <Link href="#search" className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] px-6 py-4 text-[1.0625rem] font-extrabold text-white shadow-[0_4px_20px_rgba(196,151,59,0.5)] transition-all duration-200 hover:-translate-y-0.5 md:w-auto"><Search className="size-5" /> {t("hero.primaryCta")}</Link>
                  <Link href="#layanan" className="flex items-center justify-center rounded-xl border-[1.5px] border-white/20 bg-white/10 px-6 py-4 text-base font-semibold text-white transition-colors duration-200 hover:bg-white/15 md:w-auto">{t("hero.secondaryCta")}</Link>
                </div>
                <div className="flex w-full items-center justify-center gap-5 border-t border-white/10 pt-7 md:justify-start md:gap-8">
                  <Stat value="5" label={t("hero.stats.services")} /><Divider /><Stat value="4" label={t("hero.stats.roles")} /><Divider /><Stat value="3" label={t("hero.stats.currency")} />
                </div>
              </div>
              <div id="search" className="flex w-full justify-center md:w-auto md:shrink-0">
                <LandingServiceSearchForm
                  eyebrow={t("searchBox.eyebrow")}
                  title={t("searchBox.title")}
                  description={t("searchBox.description")}
                  label={t("searchBox.label")}
                  button={t("searchBox.button")}
                  note={t("searchBox.note")}
                  pills={searchPills}
                  options={searchOptions}
                />
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 leading-[0]"><svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="block h-[70px] w-full"><path d="M0,70 L1440,70 L1440,25 Q1080,70 720,40 Q360,10 0,45 Z" fill="var(--ivory)" /></svg></div>
        </section>
        <section id="layanan" className="bg-[var(--ivory)] py-[clamp(3.5rem,8vw,5.5rem)]">
          <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-10">
            <SectionTitle eyebrow={t("services.eyebrow")} title={t("services.title")} desc={t("services.description")} />
            <div className={`grid grid-cols-1 gap-5 ${visibleServiceCards.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4"}`}>{visibleServiceCards.map((item, index) => { const Icon = SERVICE_ICONS[index]; return <Link href={`/services/${SERVICE_VALUES[index]}`} key={item.title} className="group rounded-[20px] border border-[var(--border)] bg-white p-[clamp(1.5rem,5vw,2rem)] text-center shadow-[0_2px_12px_rgba(0,0,0,0.05)] transition-all hover:border-[var(--emerald)] hover:shadow-md"><div className="mx-auto mb-5 flex size-[60px] items-center justify-center rounded-2xl bg-[var(--emerald-pale)] text-[var(--emerald)] transition-transform group-hover:scale-105"><Icon className="size-7" /></div><h3 className="mb-2.5 text-[1.0625rem] font-extrabold text-[var(--charcoal)]">{item.title}</h3><p className="text-[0.9rem] leading-[1.7] text-[var(--text-body)]">{item.desc}</p></Link>; })}</div>
          </div>
        </section>
        <section id="cara-kerja" className="bg-[var(--ivory-dark)] py-[clamp(3.5rem,8vw,5.5rem)]">
          <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-10">
            <SectionTitle eyebrow={t("workflow.eyebrow")} title={t("workflow.title")} desc={t("workflow.description")} />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">{workflowItems.map((item, index) => { const Icon = STEP_ICONS[index]; return <article key={item.step} className="rounded-[20px] border border-[var(--border)] bg-white p-[clamp(1.5rem,5vw,2rem)] text-center shadow-[0_2px_12px_rgba(0,0,0,0.05)]"><div className="mx-auto mb-5 flex size-[60px] items-center justify-center rounded-2xl bg-[var(--emerald-pale)] text-[var(--emerald)]"><Icon className="size-7" /></div><div className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--gold)]">{t("workflow.stepLabel", { step: item.step })}</div><h3 className="mb-2.5 text-[1.0625rem] font-extrabold text-[var(--charcoal)]">{item.title}</h3><p className="text-[0.9rem] leading-[1.7] text-[var(--text-body)]">{item.desc}</p></article>; })}</div>
          </div>
        </section>
        <section id="tentang" className="bg-[var(--ivory)] py-[clamp(3.5rem,8vw,5.5rem)]">
          <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-start gap-[clamp(2rem,5vw,4rem)] px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
            <div><div className="mb-4 h-1 w-12 rounded-full bg-[var(--gold)]" /><h2 className="mb-4 text-[clamp(1.5rem,4vw,2.25rem)] font-extrabold text-[var(--charcoal)]">{t("about.title")}</h2><p className="mb-8 text-[0.9375rem] leading-[1.8] text-[var(--text-body)]">{t("about.description")}</p><div className="flex flex-col gap-5">{whyItems.map((feature, index) => { const Icon = FEATURE_ICONS[index]; return <div key={feature.title} className="flex items-start gap-4"><div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--emerald)] text-white"><Icon className="size-[18px]" /></div><div><h4 className="mb-1 text-[0.9375rem] font-bold text-[var(--charcoal)]">{feature.title}</h4><p className="text-[0.875rem] leading-[1.65] text-[var(--text-body)]">{feature.desc}</p></div></div>; })}</div></div>
            <div className="flex flex-col gap-5"><div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[var(--emerald)] to-[#27956A] p-[clamp(1.5rem,5vw,2.25rem)] text-white"><p className="mb-4 text-right font-amiri text-[clamp(1.25rem,4vw,1.625rem)] leading-[1.8] text-white/95" dir="rtl">{t("about.verse")}</p><p className="mb-1.5 text-[0.9375rem] italic text-white/80">&quot;{t("about.verseMeaning")}&quot;</p><p className="text-[0.8125rem] text-white/55">— {t("about.verseSource")}</p></div><div className="rounded-[20px] border-2 border-[var(--emerald-pale)] bg-white p-[clamp(1.5rem,5vw,2rem)] shadow-[0_4px_16px_rgba(0,0,0,0.04)]"><h3 className="mb-4 text-[1.0625rem] font-extrabold text-[var(--charcoal)]">{t("about.rolesTitle")}</h3><div className="grid gap-3">{roleCards.map((role) => <div key={role.title} className="rounded-xl bg-[var(--ivory)] p-4"><p className="font-bold text-[var(--emerald)]">{role.title}</p><p className="mt-1 text-sm leading-6 text-[var(--text-body)]">{role.desc}</p></div>)}</div></div></div>
          </div>
        </section>
        <section id="bergabung" className="relative overflow-hidden bg-gradient-to-br from-[var(--charcoal)] to-[#0d2a26] py-[clamp(4rem,8vw,6rem)]">
          <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-10">
            <div className="mb-12 text-center">
              <div className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-[var(--emerald-light)]">{t("join.eyebrow")}</div>
              <h2 className="mb-4 text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold tracking-[-0.02em] text-white">{t("join.title")}</h2>
              <p className="mx-auto max-w-[560px] text-[0.9375rem] leading-[1.7] text-white/60">{t("join.description")}</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <JoinCard title={joinCards[0]?.title ?? ""} desc={joinCards[0]?.desc ?? ""} button={t("join.button")} href="/register?role=JAMAAH" icon={<User className="size-7 text-white" />} />
              <JoinCard title={joinCards[1]?.title ?? ""} desc={joinCards[1]?.desc ?? ""} button={t("join.button")} href="/register?role=MUTHAWIF" icon={<BriefcaseBusiness className="size-7 text-white" />} gold />
            </div>
            <div className="mt-10 text-center">
              <p className="text-white/70 text-[0.9375rem]">
                {t("join.providerLink")}{" "}
                <Link href="/register?role=PROVIDER" className="text-[var(--gold-light)] font-bold hover:underline transition-all">
                  {t("join.providerAction")}
                </Link>
              </p>
            </div>
          </div>
        </section>
        <section className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] py-[clamp(3.5rem,8vw,5rem)] text-center"><div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-10"><div className="mb-5 flex justify-center text-[var(--gold)]"><Moon className="size-10" /></div><h2 className="mb-4 text-[clamp(1.625rem,5vw,2.5rem)] font-black leading-[1.2] text-white">{t("cta.title")}</h2><p className="mx-auto mb-10 max-w-[520px] text-[clamp(0.9375rem,2vw,1.0625rem)] leading-[1.7] text-white/65">{t("cta.description")}</p><Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] px-8 py-[1.0625rem] text-[1.0625rem] font-extrabold text-white shadow-[0_4px_20px_rgba(196,151,59,0.4)] transition-transform hover:-translate-y-0.5">{t("cta.button")}</Link></div></section>
        <footer className="bg-[#0a0a0a] pb-[calc(2rem+64px)] pt-16 text-[0.875rem] text-white/60 min-[900px]:pb-8"><div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-10"><div className="mb-12 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4"><div><BrandFooter /><p className="mb-6 leading-[1.7]">{t("footer.description")}</p></div><FooterList title={t("footer.services")} items={visibleServiceCards.map((service) => service.title)} /><FooterList title={t("footer.join")} items={footerJoinItems} /><div><h4 className="mb-5 text-base font-bold text-white">{t("footer.contact")}</h4><ul className="flex flex-col gap-3"><li className="flex items-center gap-2"><Phone className="size-4 text-[var(--emerald)]" /> +62 812-3456-7890</li><li className="flex items-center gap-2"><Mail className="size-4 text-[var(--emerald)]" /> halo@wifme.id</li><li className="flex items-center gap-2"><Globe className="size-4 text-[var(--emerald)]" /> IDR · SAR · USD</li></ul></div></div><div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs sm:flex-row"><p>{t("footer.copyright")}</p><div className="flex gap-6"><Link href="#">{t("footer.privacy")}</Link><Link href="#">{t("footer.terms")}</Link></div></div></div></footer>
      </main>
      <MobileBottomNav />
    </>
  );
}
function Stat({ value, label }: { readonly value: string; readonly label: string }): ReactElement { return <div className="flex flex-col items-center md:items-start"><span className="text-[clamp(1.25rem,4vw,1.625rem)] font-black leading-tight text-white">{value}</span><span className="mt-1 max-w-[86px] text-[clamp(0.625rem,1.5vw,0.75rem)] leading-snug text-white/55">{label}</span></div>; }
function Divider(): ReactElement { return <div className="h-8 w-px shrink-0 bg-white/15" />; }
function SectionTitle({ eyebrow, title, desc }: { readonly eyebrow: string; readonly title: string; readonly desc: string }): ReactElement { return <div className="mb-12 text-center"><div className="mx-auto mb-4 h-1 w-12 rounded-full bg-[var(--gold)]" /><p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--gold)]">{eyebrow}</p><h2 className="mb-3 text-[clamp(1.5rem,4vw,2.25rem)] font-extrabold text-[var(--charcoal)]">{title}</h2><p className="mx-auto max-w-[560px] text-[clamp(0.9375rem,2vw,1.0625rem)] leading-[1.7] text-[var(--text-muted)]">{desc}</p></div>; }
function JoinCard({ title, desc, button, href, icon, gold = false }: { readonly title: string; readonly desc: string; readonly button: string; readonly href: string; readonly icon: ReactElement; readonly gold?: boolean }): ReactElement { const colorClass = gold ? "from-[var(--gold)] to-[#9a6a10]" : "from-[var(--emerald)] to-[#004D40]"; return <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8"><div className={`mb-6 flex size-16 items-center justify-center rounded-[18px] bg-gradient-to-br ${colorClass}`}>{icon}</div><h3 className="mb-3 text-[1.5rem] font-extrabold text-white">{title}</h3><p className="mb-8 text-[0.9375rem] leading-[1.7] text-white/60">{desc}</p><Link href={href} className="flex w-full items-center justify-center rounded-xl bg-white p-4 text-[0.9375rem] font-bold text-[var(--emerald)] transition-colors hover:bg-[var(--ivory)]">{button}</Link></div>; }
function BrandFooter(): ReactElement { return <div className="mb-5 flex items-center gap-3"><div className="relative size-12"><Image src="/logo-icon.png" alt="Wif-Me" fill sizes="48px" className="object-contain" /></div><span className="text-[1.25rem] font-extrabold tracking-[-0.02em] text-white">Wif<span className="text-[var(--gold)]">-Me</span></span></div>; }
function FooterList({ title, items }: { readonly title: string; readonly items: readonly string[] }): ReactElement { return <div><h4 className="mb-5 text-base font-bold text-white">{title}</h4><ul className="flex flex-col gap-3">{items.map((item) => <li key={item}><Link href="/register" className="transition-colors hover:text-white">{item}</Link></li>)}</ul></div>; }
