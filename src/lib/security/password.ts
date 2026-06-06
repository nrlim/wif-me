import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const HASH_ENCODING = "base64url";

type PasswordHashParts = {
  readonly salt: string;
  readonly hash: string;
};

function parsePasswordHash(passwordHash: string): PasswordHashParts | null {
  const [scheme, salt, hash] = passwordHash.split(":");

  if (scheme !== "scrypt" || !salt || !hash) {
    return null;
  }

  return { salt, hash };
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString(HASH_ENCODING);
  const hash = scryptSync(password, salt, KEY_LENGTH).toString(HASH_ENCODING);

  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  const parts = parsePasswordHash(passwordHash);

  if (!parts) {
    return false;
  }

  const expectedHash = Buffer.from(parts.hash, HASH_ENCODING);
  const actualHash = scryptSync(password, parts.salt, KEY_LENGTH);

  if (expectedHash.byteLength !== actualHash.byteLength) {
    return false;
  }

  return timingSafeEqual(expectedHash, actualHash);
}
