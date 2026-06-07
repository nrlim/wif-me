import { redirect } from "@/i18n/routing";

type AdminEscrowIndexProps = { readonly params: Promise<{ readonly locale: string }> };

export default async function AdminEscrowIndex({ params }: AdminEscrowIndexProps): Promise<never> {
  const { locale } = await params;
  return redirect({ href: "/admin/escrow/holding", locale });
}
