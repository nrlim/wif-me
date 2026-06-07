export type TransactionStatus = "paid" | "escrow" | "completed" | "refunded";
export type WithdrawalStatus = "review" | "approved" | "paid" | "rejected";
export type FeeStatus = "active" | "draft";

export type EscrowStatus = "held" | "releaseReview" | "released";

export type EscrowRow = {
  readonly id: string;
  readonly serviceKey: "muthawifPersonal" | "providerMuthawif" | "transportation" | "visaProcessing";
  readonly customerKey: "keluargaRahman" | "travelAmanah" | "nabila";
  readonly amount: string;
  readonly status: EscrowStatus;
};

export type TransactionRow = {
  readonly id: string;
  readonly serviceKey: "muthawifPersonal" | "providerMuthawif" | "transportation" | "visaProcessing";
  readonly customerKey: "keluargaRahman" | "travelAmanah" | "nabila";
  readonly amount: string;
  readonly status: TransactionStatus;
};

export type WithdrawalRow = {
  readonly id: string;
  readonly partnerKey: "abdullah" | "hijrahTravel" | "safaTransport" | "aminah";
  readonly amount: string;
  readonly status: WithdrawalStatus;
};

export type FeeRule = {
  readonly key: "platformCommission" | "providerCommission" | "withdrawalFee";
  readonly value: string;
  readonly status: FeeStatus;
};

export type ChargeRule = {
  readonly key: "paymentGateway" | "currencySpread" | "urgentProcessing";
  readonly value: string;
  readonly status: FeeStatus;
};

export const ESCROWS: readonly EscrowRow[] = [
  { id: "ESC-2401", serviceKey: "muthawifPersonal", customerKey: "keluargaRahman", amount: "Rp 4.800.000", status: "held" },
  { id: "ESC-2402", serviceKey: "providerMuthawif", customerKey: "travelAmanah", amount: "Rp 32.500.000", status: "releaseReview" },
  { id: "ESC-2403", serviceKey: "transportation", customerKey: "nabila", amount: "Rp 7.250.000", status: "released" },
  { id: "ESC-2404", serviceKey: "visaProcessing", customerKey: "keluargaRahman", amount: "Rp 12.000.000", status: "held" },
];

export const TRANSACTIONS: readonly TransactionRow[] = [
  { id: "TRX-2401", serviceKey: "muthawifPersonal", customerKey: "keluargaRahman", amount: "Rp 4.800.000", status: "escrow" },
  { id: "TRX-2402", serviceKey: "providerMuthawif", customerKey: "travelAmanah", amount: "Rp 32.500.000", status: "paid" },
  { id: "TRX-2403", serviceKey: "transportation", customerKey: "nabila", amount: "Rp 7.250.000", status: "completed" },
  { id: "TRX-2404", serviceKey: "visaProcessing", customerKey: "keluargaRahman", amount: "Rp 12.000.000", status: "refunded" },
];

export const WITHDRAWALS: readonly WithdrawalRow[] = [
  { id: "WDR-2401", partnerKey: "abdullah", amount: "Rp 3.900.000", status: "review" },
  { id: "WDR-2402", partnerKey: "hijrahTravel", amount: "Rp 28.000.000", status: "approved" },
  { id: "WDR-2403", partnerKey: "safaTransport", amount: "Rp 6.500.000", status: "paid" },
  { id: "WDR-2404", partnerKey: "aminah", amount: "Rp 2.100.000", status: "rejected" },
];

export const FEE_RULES: readonly FeeRule[] = [
  { key: "platformCommission", value: "10%", status: "active" },
  { key: "providerCommission", value: "7%", status: "active" },
  { key: "withdrawalFee", value: "Rp 6.500", status: "draft" },
];

export const CHARGE_RULES: readonly ChargeRule[] = [
  { key: "paymentGateway", value: "2,9% + Rp 2.000", status: "active" },
  { key: "currencySpread", value: "1,5%", status: "active" },
  { key: "urgentProcessing", value: "Rp 150.000", status: "draft" },
];

export function getTransactionById(id: string): TransactionRow | undefined {
  return TRANSACTIONS.find((row) => row.id === id);
}

export function getEscrowById(id: string): EscrowRow | undefined {
  return ESCROWS.find((row) => row.id === id);
}

export function getWithdrawalById(id: string): WithdrawalRow | undefined {
  return WITHDRAWALS.find((row) => row.id === id);
}

export function getFeeRuleByKey(key: string): FeeRule | undefined {
  return FEE_RULES.find((row) => row.key === key);
}

export function getChargeRuleByKey(key: string): ChargeRule | undefined {
  return CHARGE_RULES.find((row) => row.key === key);
}
