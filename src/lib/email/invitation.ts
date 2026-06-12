import { sendMail } from "@/lib/email/mailer";

type StaffInvitationInput = {
  readonly recipientEmail: string;
  readonly recipientName: string;
  readonly providerName: string;
  readonly inviteToken: string;
};

function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) throw new Error("NEXT_PUBLIC_APP_URL is required for invitation links.");
  return url.replace(/\/+$/, "");
}

function buildInviteUrl(token: string): string {
  return `${getAppUrl()}/invite/${token}`;
}

function buildInvitationEmail(input: StaffInvitationInput): {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html: string;
} {
  const inviteUrl = buildInviteUrl(input.inviteToken);

  return {
    to: input.recipientEmail,
    subject: `Undangan bergabung sebagai Muthawif di Wif-Me — ${input.providerName}`,
    text: [
      `Assalamu'alaikum ${input.recipientName},`,
      "",
      `${input.providerName} mengundang Anda untuk bergabung sebagai Muthawif di platform Wif-Me.`,
      "",
      `Klik link berikut untuk membuat akun:`,
      inviteUrl,
      "",
      `Link ini berlaku selama 7 hari dan hanya bisa digunakan oleh email ${input.recipientEmail}.`,
      "",
      `Jika Anda tidak mengenali undangan ini, abaikan email ini.`,
      "",
      "— Tim Wif-Me",
    ].join("\n"),
    html: `
      <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;line-height:1.6;color:#16211c;max-width:520px;margin:0 auto">
        <div style="border-bottom:3px solid #1B6B4A;padding-bottom:16px;margin-bottom:20px">
          <h2 style="margin:0;color:#1B6B4A;font-size:20px">Wif-Me</h2>
        </div>
        <p>Assalamu'alaikum <strong>${input.recipientName}</strong>,</p>
        <p><strong>${input.providerName}</strong> mengundang Anda untuk bergabung sebagai <strong>Muthawif</strong> di platform Wif-Me.</p>
        <div style="margin:24px 0;text-align:center">
          <a href="${inviteUrl}" style="display:inline-block;background:#1B6B4A;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:700;font-size:14px">
            Terima Undangan
          </a>
        </div>
        <p style="font-size:13px;color:#64748b">Link berlaku <strong>7 hari</strong> dan hanya bisa digunakan oleh email <strong>${input.recipientEmail}</strong>.</p>
        <p style="font-size:13px;color:#64748b">Jika Anda tidak mengenali undangan ini, abaikan email ini.</p>
        <div style="border-top:1px solid #e2e8f0;margin-top:24px;padding-top:16px;font-size:12px;color:#94a3b8">
          Tim Wif-Me — Platform Pendamping Ibadah Umrah
        </div>
      </div>
    `,
  };
}

export async function sendStaffInvitationEmail(input: StaffInvitationInput): Promise<void> {
  await sendMail(buildInvitationEmail(input));
}

export { buildInviteUrl };
