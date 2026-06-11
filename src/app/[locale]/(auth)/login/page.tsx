import type { Metadata } from "next";
import type { ReactElement } from "react";
import { AuthFormCard } from "@/components/forms/auth-form-card";
import { AuthShell } from "@/components/layout/auth-shell";

export const metadata: Metadata = {
  title: "Masuk | Wif-Me",
  description: "Masuk ke akun Wif-Me untuk mengelola booking dan layanan pendampingan ibadah.",
};

export default async function LoginPage({ searchParams }: { readonly searchParams: Promise<{ readonly next?: string }> }): Promise<ReactElement> {
  const { next = "" } = await searchParams;

  return (
    <AuthShell>
      <AuthFormCard mode="login" nextPath={next} />
    </AuthShell>
  );
}
