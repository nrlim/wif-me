import nodemailer, { type Transporter } from "nodemailer";

const globalForMailer = globalThis as typeof globalThis & {
  mailTransporter?: Transporter;
};

type MailMessage = {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html: string;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for email delivery.`);
  }

  return value;
}

function getMailTransporter(): Transporter {
  globalForMailer.mailTransporter ??= nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: getRequiredEnv("GMAIL_USER"),
      pass: getRequiredEnv("GMAIL_APP_PASSWORD"),
    },
  });

  return globalForMailer.mailTransporter;
}

export async function sendMail(message: MailMessage): Promise<void> {
  const from = process.env.MAIL_FROM ?? `Wif-Me <${getRequiredEnv("GMAIL_USER")}>`;
  const transporter = getMailTransporter();

  await transporter.sendMail({
    from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}
