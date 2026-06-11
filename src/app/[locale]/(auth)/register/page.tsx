import type { Metadata } from "next";
import type { ReactElement } from "react";
import { AuthFormCard } from "@/components/forms/auth-form-card";
import { AuthShell } from "@/components/layout/auth-shell";

export const metadata: Metadata = {
  title: "Daftar | Wif-Me",
  description: "Buat akun Wif-Me sebagai jamaah, muthawif, atau provider layanan pendampingan ibadah.",
};

export default async function RegisterPage({ searchParams }: { readonly searchParams: Promise<{ readonly next?: string }> }): Promise<ReactElement> {
  const { next = "" } = await searchParams;

  return (
    <AuthShell>
      <AuthFormCard mode="register" nextPath={next} />
    </AuthShell>
  );
}
