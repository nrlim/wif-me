import { UserRole } from "@prisma/client";
import { createSessionCookie } from "@/lib/auth/session";
import { getPrismaClient } from "@/lib/db/prisma";
import { problemResponse, serverProblem, validationProblem } from "@/lib/http/problem";
import { verifyPassword } from "@/lib/security/password";
import { loginSchema } from "@/lib/validators/auth";

export const runtime = "nodejs";

type LoginResponse = {
  readonly authenticated: true;
  readonly redirectTo: string;
};

const ROLE_REDIRECTS = {
  [UserRole.JAMAAH]: "/jamaah",
  [UserRole.MUTHAWIF]: "/muthawif",
  [UserRole.PROVIDER]: "/provider",
  [UserRole.ADMIN]: "/admin",
} as const satisfies Record<UserRole, string>;

function invalidCredentialsResponse(): Response {
  return problemResponse({
    type: "https://wifme.id/problems/invalid-credentials",
    title: "Invalid Credentials",
    status: 401,
    detail: "Email or password is incorrect.",
  });
}

function emailVerificationRequiredResponse(email: string): Response {
  return problemResponse({
    type: "https://wifme.id/problems/email-verification-required",
    title: "Email Verification Required",
    status: 403,
    detail: `Email verification is required for ${email}.`,
  });
}

export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return validationProblem("A valid email and password are required.");
  }

  try {
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, email: true, passwordHash: true, role: true, emailVerified: true },
    });

    if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return invalidCredentialsResponse();
    }

    if (!user.emailVerified) {
      return emailVerificationRequiredResponse(user.email);
    }

    return Response.json(
      { authenticated: true, redirectTo: ROLE_REDIRECTS[user.role] } satisfies LoginResponse,
      {
        headers: {
          "Set-Cookie": createSessionCookie({ userId: user.id, role: user.role }),
        },
      }
    );
  } catch {
    return serverProblem();
  }
}
