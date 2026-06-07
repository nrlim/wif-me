import type { Metadata } from "next";
import type { ReactElement } from "react";
import { ResetPasswordFormCard } from "@/components/forms/reset-password-form-card";
import { AuthShell } from "@/components/layout/auth-shell";

export const metadata: Metadata = {
  title: "Reset Kata Sandi | Wif-Me",
  description: "Masukkan kode OTP dan kata sandi baru untuk memulihkan akun Wif-Me.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly email?: string }>;
}): Promise<ReactElement> {
  const { email = "" } = await searchParams;

  return (
    <AuthShell>
      <ResetPasswordFormCard email={email} />
    </AuthShell>
  );
}
