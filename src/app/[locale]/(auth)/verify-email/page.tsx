import type { Metadata } from "next";
import type { ReactElement } from "react";
import { EmailOtpFormCard } from "@/components/forms/email-otp-form-card";
import { AuthShell } from "@/components/layout/auth-shell";

export const metadata: Metadata = {
  title: "Verifikasi Email | Wif-Me",
  description: "Masukkan kode OTP untuk mengaktifkan akun Wif-Me.",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly email?: string }>;
}): Promise<ReactElement> {
  const { email = "" } = await searchParams;

  return (
    <AuthShell>
      <EmailOtpFormCard email={email} />
    </AuthShell>
  );
}
