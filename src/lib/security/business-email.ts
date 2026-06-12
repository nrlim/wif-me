const PERSONAL_EMAIL_DOMAINS = new Set<string>([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.id",
  "ymail.com",
  "rocketmail.com",
  "hotmail.com",
  "hotmail.co.id",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "tutanota.com",
  "tuta.io",
  "zoho.com",
  "mail.com",
  "gmx.com",
  "gmx.net",
  "fastmail.com",
  "hey.com",
  "yandex.com",
  "yandex.ru",
]);

const TEMP_EMAIL_DOMAINS = new Set<string>([
  "10minutemail.com",
  "10minutemail.net",
  "20minutemail.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "mailinator.com",
  "yopmail.com",
  "temp-mail.org",
  "tempmail.com",
  "tempmail.net",
  "throwawaymail.com",
  "trashmail.com",
  "maildrop.cc",
  "getnada.com",
  "inboxkitten.com",
  "sharklasers.com",
  "grr.la",
  "guerrillamailblock.com",
  "dispostable.com",
  "fakeinbox.com",
  "mintemail.com",
  "mohmal.com",
  "emailondeck.com",
  "mailnesia.com",
  "mytemp.email",
  "tempr.email",
  "tempail.com",
  "dropmail.me",
  "burnermail.io",
  "moakt.com",
  "mail.tm",
  "mail.gw",
]);

const RESERVED_OR_LOCAL_DOMAINS = new Set<string>([
  "localhost",
  "local",
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "invalid",
]);

const TEMP_DOMAIN_MARKERS = ["10minute", "tempmail", "temp-mail", "throwaway", "trashmail", "mailinator", "guerrillamail", "disposable"] as const;

export type BusinessEmailValidation = {
  readonly accepted: boolean;
  readonly reason?: "personal" | "temporary" | "reserved" | "invalid";
};

export function validateProviderBusinessEmail(email: string): BusinessEmailValidation {
  const domain = getEmailDomain(email);
  if (!domain) return { accepted: false, reason: "invalid" };
  if (RESERVED_OR_LOCAL_DOMAINS.has(domain) || domain.endsWith(".test") || domain.endsWith(".local")) return { accepted: false, reason: "reserved" };
  if (PERSONAL_EMAIL_DOMAINS.has(domain)) return { accepted: false, reason: "personal" };
  if (TEMP_EMAIL_DOMAINS.has(domain) || TEMP_DOMAIN_MARKERS.some((marker) => domain.includes(marker))) return { accepted: false, reason: "temporary" };
  if (!isBusinessLikeDomain(domain)) return { accepted: false, reason: "invalid" };
  return { accepted: true };
}

function getEmailDomain(email: string): string | null {
  const [, rawDomain] = email.trim().toLowerCase().split("@");
  return rawDomain && rawDomain.length <= 253 ? rawDomain : null;
}

function isBusinessLikeDomain(domain: string): boolean {
  if (!domain.includes(".")) return false;
  if (domain.startsWith(".") || domain.endsWith(".")) return false;
  return domain.split(".").every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label));
}
