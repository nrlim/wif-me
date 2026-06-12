import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

export type EncryptedValue = {
  readonly encrypted: string;
  readonly iv: string;
  readonly tag: string;
};

export function encryptSensitiveValue(value: string): EncryptedValue {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encrypted: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function decryptSensitiveValue(input: EncryptedValue): string {
  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(input.iv, "base64"));
  decipher.setAuthTag(Buffer.from(input.tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(input.encrypted, "base64")), decipher.final()]).toString("utf8");
}

function getEncryptionKey(): Buffer {
  const secret = process.env.WITHDRAWAL_ENCRYPTION_KEY ?? process.env.AUTH_SECRET ?? "wif-me-development-key";
  return createHash("sha256").update(secret).digest();
}
