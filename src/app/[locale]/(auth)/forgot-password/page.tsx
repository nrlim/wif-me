import type { Metadata } from "next";
import type { ReactElement } from "react";
import { AuthFormCard } from "@/components/forms/auth-form-card";
import { AuthShell } from "@/components/layout/auth-shell";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi | Wif-Me",
  description: "Pulihkan akses akun Wif-Me dengan instruksi pengaturan ulang kata sandi.",
};

export default function ForgotPasswordPage(): ReactElement {
  return (
    <AuthShell>
      <AuthFormCard mode="forgot-password" />
    </AuthShell>
  );
}
