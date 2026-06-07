import { redirect } from "@/i18n/routing";

type AdminPartnersIndexProps = {
  readonly params: Promise<{ readonly locale: string }>;
};

export default async function AdminPartnersIndex({ params }: AdminPartnersIndexProps): Promise<never> {
  const { locale } = await params;
  return redirect({ href: "/admin/partners/muthawif", locale });
}
