import { OtpPurpose } from "@prisma/client";
import { verifyOtp } from "@/lib/auth/otp";
import { getPrismaClient } from "@/lib/db/prisma";
import { problemResponse, serverProblem, validationProblem } from "@/lib/http/problem";
import { emailOtpSchema } from "@/lib/validators/auth";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = emailOtpSchema.safeParse(body);

  if (!parsed.success) {
    return validationProblem("Valid email and 6 digit OTP are required.");
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (!user) {
    return problemResponse({
      type: "https://wifme.id/problems/invalid-otp",
      title: "Invalid OTP",
      status: 400,
      detail: "The verification code is invalid or expired.",
    });
  }

  const result = await verifyOtp({
    userId: user.id,
    otp: parsed.data.otp,
    purpose: OtpPurpose.EMAIL_VERIFICATION,
  });

  if (result !== "valid") {
    return problemResponse({
      type: "https://wifme.id/problems/invalid-otp",
      title: "Invalid OTP",
      status: 400,
      detail: "The verification code is invalid or expired.",
    });
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    });

    return Response.json({ verified: true });
  } catch {
    return serverProblem();
  }
}
