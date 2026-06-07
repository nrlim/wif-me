import { OtpPurpose } from "@prisma/client";
import { createAndSendOtp, verifyOtp } from "@/lib/auth/otp";
import { getPrismaClient } from "@/lib/db/prisma";
import { problemResponse, serverProblem, validationProblem } from "@/lib/http/problem";
import { hashPassword } from "@/lib/security/password";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validators/auth";

export const runtime = "nodejs";

const GENERIC_RESPONSE = {
  accepted: true,
  message: "If the email exists, password reset instructions will be sent.",
} as const;

export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return validationProblem("A valid email is required.");
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    return Response.json(GENERIC_RESPONSE);
  }

  await createAndSendOtp({
    userId: user.id,
    email: user.email,
    name: user.name,
    purpose: OtpPurpose.PASSWORD_RESET,
  }).catch(() => undefined);

  return Response.json(GENERIC_RESPONSE);
}

export async function PATCH(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return validationProblem("Valid email, 6 digit OTP, and a stronger password are required.");
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (!user) {
    return invalidOtpResponse();
  }

  const result = await verifyOtp({
    userId: user.id,
    otp: parsed.data.otp,
    purpose: OtpPurpose.PASSWORD_RESET,
  });

  if (result !== "valid") {
    return invalidOtpResponse();
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(parsed.data.password) },
    });

    return Response.json({ reset: true });
  } catch {
    return serverProblem();
  }
}

function invalidOtpResponse(): Response {
  return problemResponse({
    type: "https://wifme.id/problems/invalid-otp",
    title: "Invalid OTP",
    status: 400,
    detail: "The verification code is invalid or expired.",
  });
}
