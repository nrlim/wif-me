export type PartnerType = "personal" | "provider";
export type PartnerServiceKey = "muthawifPersonal" | "providerMuthawif" | "transportation";
export type PartnerCityKey = "makkah" | "jeddah" | "madinah";
export type PartnerStatusKey = "verified" | "review" | "paused";

export type PartnerKey = "abdullah" | "aminah" | "hijrahTravel" | "safaTransport" | "rawdahGroup" | "haramainFleet";

export type PartnerRow = {
  readonly key: PartnerKey;
  readonly type: PartnerType;
  readonly serviceKey: PartnerServiceKey;
  readonly cityKey: PartnerCityKey;
  readonly bookings: number;
  readonly status: PartnerStatusKey;
};

export const PARTNERS: readonly PartnerRow[] = [
  { key: "abdullah", type: "personal", serviceKey: "muthawifPersonal", cityKey: "makkah", bookings: 38, status: "verified" },
  { key: "aminah", type: "personal", serviceKey: "muthawifPersonal", cityKey: "makkah", bookings: 24, status: "paused" },
  { key: "hijrahTravel", type: "provider", serviceKey: "providerMuthawif", cityKey: "jeddah", bookings: 112, status: "review" },
  { key: "safaTransport", type: "provider", serviceKey: "transportation", cityKey: "madinah", bookings: 76, status: "verified" },
  { key: "rawdahGroup", type: "provider", serviceKey: "providerMuthawif", cityKey: "madinah", bookings: 54, status: "verified" },
  { key: "haramainFleet", type: "provider", serviceKey: "transportation", cityKey: "jeddah", bookings: 41, status: "review" },
];

export function getPartnerByKey(key: string): PartnerRow | undefined {
  return PARTNERS.find((partner) => partner.key === key);
}

export function getPartnersByType(type: PartnerType): readonly PartnerRow[] {
  return PARTNERS.filter((partner) => partner.type === type);
}
