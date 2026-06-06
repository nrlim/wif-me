import { createHash, randomInt } from "node:crypto";
import type { OtpPurpose } from "@prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";
import { sendMail } from "@/lib/email/mailer";

const OTP_TTL_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

type OtpEmailInput = {
  readonly email: string;
  readonly name: string;
  readonly otp: string;
  readonly purpose: OtpPurpose;
};

export type OtpVerificationResult = "valid" | "invalid" | "expired" | "too_many_attempts";

function getOtpPepper(): string {
  const pepper = process.env.AUTH_SECRET;

  if (!pepper) {
    throw new Error("AUTH_SECRET is required for OTP hashing.");
  }

  return pepper;
}

function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function hashOtp(otp: string): string {
  return createHash("sha256").update(`${otp}:${getOtpPepper()}`).digest("hex");
}

function buildOtpEmail({ email, name, otp, purpose }: OtpEmailInput): {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html: string;
} {
  const isReset = purpose === "PASSWORD_RESET";
  const subject = isReset ? "Kode reset kata sandi Wif-Me" : "Kode verifikasi email Wif-Me";
  const title = isReset ? "Reset kata sandi" : "Verifikasi email";
  const intro = isReset
    ? "Gunakan kode berikut untuk mengatur ulang kata sandi akun Wif-Me Anda."
    : "Gunakan kode berikut untuk mengonfirmasi email akun Wif-Me Anda.";

  return {
    to: email,
    subject,
    text: `Assalamu'alaikum ${name},\n\n${intro}\n\nKode OTP: ${otp}\nBerlaku ${OTP_TTL_MINUTES} menit.\n\nJika Anda tidak meminta kode ini, abaikan email ini.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#16211c"><h2>${title}</h2><p>Assalamu'alaikum ${name},</p><p>${intro}</p><p style="font-size:28px;font-weight:800;letter-spacing:6px;color:#1B6B4A">${otp}</p><p>Kode berlaku ${OTP_TTL_MINUTES} menit.</p><p>Jika Anda tidak meminta kode ini, abaikan email ini.</p></div>`,
  };
}

export async function createAndSendOtp(input: {
  readonly userId: string;
  readonly email: string;
  readonly name: string;
  readonly purpose: OtpPurpose;
}): Promise<void> {
  const prisma = getPrismaClient();
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

  await prisma.emailOtp.create({
    data: {
      userId: input.userId,
      purpose: input.purpose,
      otpHash: hashOtp(otp),
      expiresAt,
    },
  });

  await sendMail(buildOtpEmail({ ...input, otp }));
}

export async function verifyOtp(input: {
  readonly userId: string;
  readonly otp: string;
  readonly purpose: OtpPurpose;
}): Promise<OtpVerificationResult> {
  const prisma = getPrismaClient();
  const otpRecord = await prisma.emailOtp.findFirst({
    where: {
      userId: input.userId,
      purpose: input.purpose,
      consumedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    return "invalid";
  }

  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    return "too_many_attempts";
  }

  if (otpRecord.expiresAt.getTime() < Date.now()) {
    return "expired";
  }

  const isValid = otpRecord.otpHash === hashOtp(input.otp);

  if (!isValid) {
    await prisma.emailOtp.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    return "invalid";
  }

  await prisma.emailOtp.update({
    where: { id: otpRecord.id },
    data: { consumedAt: new Date() },
  });

  return "valid";
}
