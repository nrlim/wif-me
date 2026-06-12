import type { Metadata } from "next";
import type { ReactElement } from "react";
import { ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { getPrismaClient } from "@/lib/db/prisma";
import { AuthShell } from "@/components/layout/auth-shell";
import { InviteAcceptForm } from "./invite-accept-form";

export const metadata: Metadata = {
  title: "Terima Undangan | Wif-Me",
  description: "Bergabung sebagai Muthawif di platform Wif-Me melalui undangan provider.",
};

type InvitePageProps = {
  readonly params: Promise<{ readonly token: string }>;
};

export default async function InvitePage({ params }: InvitePageProps): Promise<ReactElement> {
  const { token } = await params;
  const now = getCurrentTimestamp();
  const prisma = getPrismaClient();

  const staffRecord = await prisma.providerStaff.findFirst({
    where: { inviteToken: token },
    select: {
      id: true,
      email: true,
      name: true,
      inviteStatus: true,
      inviteExpiresAt: true,
      userId: true,
      provider: { select: { name: true, providerProfile: { select: { displayName: true } } } },
    },
  });

  // Invalid token
  if (!staffRecord || !staffRecord.email) {
    return (
      <AuthShell>
        <ErrorCard
          icon={<ShieldAlert className="size-10 text-[var(--error)]" />}
          title="Link Tidak Valid"
          description="Link undangan tidak ditemukan atau sudah dibatalkan. Hubungi provider untuk mengirim ulang undangan."
        />
      </AuthShell>
    );
  }

  // Already accepted
  if (staffRecord.inviteStatus !== "PENDING") {
    return (
      <AuthShell>
        <ErrorCard
          icon={<CheckCircle2 className="size-10 text-[var(--emerald)]" />}
          title="Undangan Sudah Digunakan"
          description="Akun Anda sudah terdaftar melalui undangan ini. Silakan login untuk melanjutkan."
          actionHref="/login"
          actionLabel="Login"
        />
      </AuthShell>
    );
  }

  // Expired
  if (!staffRecord.inviteExpiresAt || staffRecord.inviteExpiresAt.getTime() < now) {
    return (
      <AuthShell>
        <ErrorCard
          icon={<Clock className="size-10 text-[var(--gold)]" />}
          title="Link Kadaluarsa"
          description="Link undangan sudah tidak berlaku. Hubungi provider untuk mengirim ulang undangan baru."
        />
      </AuthShell>
    );
  }

  const providerName = staffRecord.provider.providerProfile?.displayName ?? staffRecord.provider.name;

  return (
    <AuthShell>
      <InviteAcceptForm
        token={token}
        recipientEmail={staffRecord.email}
        recipientName={staffRecord.name}
        providerName={providerName}
      />
    </AuthShell>
  );
}

function getCurrentTimestamp(): number {
  return Date.now();
}

function ErrorCard({ icon, title, description, actionHref, actionLabel }: {
  readonly icon: ReactElement;
  readonly title: string;
  readonly description: string;
  readonly actionHref?: string;
  readonly actionLabel?: string;
}): ReactElement {
  return (
    <section className="w-full rounded-[12px] border border-[var(--border)] bg-white/92 p-6 text-center shadow-[0_18px_54px_rgba(21,35,29,0.11)] backdrop-blur">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--ivory)]">
        {icon}
      </div>
      <h1 className="mt-4 text-xl font-black text-[var(--charcoal)]">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{description}</p>
      {actionHref && actionLabel ? (
        <a
          href={actionHref}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-[9px] bg-[var(--emerald)] px-6 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(27,107,74,0.2)] transition hover:bg-[var(--emerald-light)]"
        >
          {actionLabel}
        </a>
      ) : null}
    </section>
  );
}
