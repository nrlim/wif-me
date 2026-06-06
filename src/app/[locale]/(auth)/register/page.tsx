import type { Metadata } from "next";
import type { ReactElement } from "react";
import { AuthFormCard } from "@/components/forms/auth-form-card";
import { AuthShell } from "@/components/layout/auth-shell";

export const metadata: Metadata = {
  title: "Daftar | Wif-Me",
  description: "Buat akun Wif-Me sebagai jamaah, muthawif, atau provider layanan pendampingan ibadah.",
};

export default function RegisterPage(): ReactElement {
  return (
    <AuthShell>
      <AuthFormCard mode="register" />
    </AuthShell>
  );
}
