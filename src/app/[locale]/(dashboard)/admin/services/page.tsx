import { redirect } from "@/i18n/routing";

type AdminServicesIndexProps = {
  readonly params: Promise<{ readonly locale: string }>;
};

export default async function AdminServicesIndex({ params }: AdminServicesIndexProps): Promise<never> {
  const { locale } = await params;
  return redirect({ href: "/admin/services/categories", locale });
}
