import { createHmac, timingSafeEqual } from "node:crypto";
import type { UserRole } from "@prisma/client";

const SESSION_COOKIE_NAME = "wif_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SIGNATURE_ENCODING = "base64url";

type SessionPayload = {
  readonly userId: string;
  readonly role: UserRole;
  readonly exp: number;
};

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is required for session signing.");
  }

  return secret;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getAuthSecret()).update(payload).digest(SIGNATURE_ENCODING);
}

function encodePayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString(SIGNATURE_ENCODING);
}

export function createSessionCookie(input: { readonly userId: string; readonly role: UserRole }): string {
  const payload = encodePayload({
    userId: input.userId,
    role: input.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  });
  const signature = signPayload(payload);
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${SESSION_COOKIE_NAME}=${payload}.${signature}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secureFlag}`;
}

export function verifySessionCookie(cookieValue: string): SessionPayload | null {
  const [payload, signature] = cookieValue.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);
  const expectedBuffer = Buffer.from(expectedSignature, SIGNATURE_ENCODING);
  const actualBuffer = Buffer.from(signature, SIGNATURE_ENCODING);

  if (expectedBuffer.byteLength !== actualBuffer.byteLength || !timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null;
  }

  const decoded: unknown = JSON.parse(Buffer.from(payload, SIGNATURE_ENCODING).toString("utf8"));

  if (!isSessionPayload(decoded) || decoded.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return decoded;
}

function isSessionPayload(value: unknown): value is SessionPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SessionPayload>;

  return typeof candidate.userId === "string" && typeof candidate.role === "string" && typeof candidate.exp === "number";
}
