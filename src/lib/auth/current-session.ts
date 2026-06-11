import "server-only";

import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionCookie, type SessionPayload } from "@/lib/auth/session";

const ROLE_DASHBOARD_PATHS = {
  [UserRole.JAMAAH]: "/jamaah",
  [UserRole.MUTHAWIF]: "/muthawif",
  [UserRole.PROVIDER]: "/provider",
  [UserRole.ADMIN]: "/admin",
} as const satisfies Record<UserRole, string>;

export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  return sessionCookie ? verifySessionCookie(sessionCookie) : null;
}

export async function requireRoleSession(allowedRoles: readonly UserRole[]): Promise<SessionPayload> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!allowedRoles.includes(session.role)) {
    redirect(ROLE_DASHBOARD_PATHS[session.role]);
  }

  return session;
}
