export type ServiceItem = {
  readonly title: string;
  readonly description: string;
  readonly meta: string;
};

export type TrustMetric = {
  readonly value: string;
  readonly label: string;
};

export type AuthMode = "login" | "register" | "forgot-password";

export const SITE_NAV_ITEMS = [
  { href: "#layanan", label: "Layanan" },
  { href: "#alur", label: "Alur" },
  { href: "#keamanan", label: "Keamanan" },
  { href: "/login", label: "Masuk" },
] as const;

export const SERVICES: readonly ServiceItem[] = [
  {
    title: "Muthawif Personal",
    description:
      "Pendamping ibadah terverifikasi untuk jamaah mandiri, keluarga kecil, dan rombongan khusus.",
    meta: "Profil, pengalaman, bahasa, dan jadwal terlihat sejak awal.",
  },
  {
    title: "Provider Muthawif",
    description:
      "Kerja sama B2B untuk travel, komunitas, dan organisasi yang membutuhkan suplai pembimbing.",
    meta: "Cocok untuk kebutuhan rutin maupun periode puncak musim umrah.",
  },
  {
    title: "Transportasi Rute Ibadah",
    description:
      "Pemesanan kendaraan berdasarkan rute: bandara, Makkah, Madinah, ziarah, dan antar kota.",
    meta: "Harga rute jelas dengan opsi SAR, USD, dan IDR.",
  },
  {
    title: "Visa Processing",
    description:
      "Pengurusan visa umrah dan dokumen pendukung dengan status proses yang mudah dipantau.",
    meta: "Jamaah mengetahui dokumen yang perlu disiapkan tanpa bolak-balik bertanya.",
  },
] as const;

export const TRUST_METRICS: readonly TrustMetric[] = [
  { value: "5", label: "kelompok layanan yang saling terhubung" },
  { value: "4", label: "peran pengguna dalam satu ekosistem" },
  { value: "3", label: "mata uang tampilan: IDR, SAR, USD" },
] as const;

export const PROCESS_STEPS = [
  "Pilih layanan dan kebutuhan perjalanan",
  "Bandingkan profil, harga, dan ketersediaan",
  "Bayar melalui escrow, penyedia mulai bekerja",
  "Selesaikan perjalanan dengan catatan dan ulasan",
] as const;

export const AUTH_COPY = {
  login: {
    eyebrow: "Masuk akun",
    title: "Masuk ke akun Wif-Me.",
    description: "Pantau booking, visa, pembayaran escrow, dan percakapan penyedia.",
    submitLabel: "Masuk",
    alternateHref: "/register",
    alternateLabel: "Belum punya akun? Daftar",
  },
  register: {
    eyebrow: "Daftar akun",
    title: "Daftar sesuai peran Anda.",
    description: "Pilih jamaah, muthawif, atau provider. Verifikasi menyusul setelah akun dibuat.",
    submitLabel: "Buat akun",
    alternateHref: "/login",
    alternateLabel: "Sudah punya akun? Masuk",
  },
  "forgot-password": {
    eyebrow: "Pulihkan akses",
    title: "Pulihkan akses akun.",
    description: "Masukkan email terdaftar. Instruksi pemulihan dikirim jika akun ditemukan.",
    submitLabel: "Kirim instruksi",
    alternateHref: "/login",
    alternateLabel: "Kembali masuk",
  },
} as const satisfies Record<
  AuthMode,
  {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly submitLabel: string;
    readonly alternateHref: string;
    readonly alternateLabel: string;
  }
>;
