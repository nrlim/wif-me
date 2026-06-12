export const ESCROW_BANK_ACCOUNT = {
  bankName: "Bank Syariah Indonesia",
  accountNumber: "8800 1020 3300",
  accountName: "WIF-ME ESCROW",
  branch: "Jakarta",
} as const;

export const PAYMENT_PROOF_UPLOAD = {
  maxSizeBytes: 5 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
} as const;
