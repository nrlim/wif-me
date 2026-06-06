<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Wif-Me — Platform Pendamping Ibadah Umrah

## 1. Product Overview

**Wif-Me** adalah platform multi-service yang menghubungkan jamaah umrah/haji mandiri dengan berbagai layanan pendampingan ibadah. Platform ini berfungsi sebagai penengah pendamping antara penyedia jasa dan jamaah.

### 1.1 Core Services

| # | Layanan | Deskripsi |
|---|---------|-----------|
| 1 | **Muthawif Personal** | Booking muthawif perorangan yang terverifikasi untuk pendampingan ibadah umrah/haji |
| 2 | **Provider Muthawif** | Kerjasama B2B dengan penyedia/supplier muthawif (travel agent, organisasi) |
| 3 | **Transportasi** | Penyewaan transportasi berbasis rute tujuan (Makkah-Madinah, bandara, ziarah, dll) |
| 4 | **Visa Processing** | Pengurusan visa umrah, haji, dan jenis visa lainnya yang berkaitan |
| 5 | **Layanan Tambahan** | Layanan pendukung lain yang saling berelasi dengan ekosistem ibadah |

### 1.2 Platform Characteristics

- **Multi-service platform** — semua layanan saling berkesinambungan dan berelasi satu sama lain
- **Multi-currency** — support SAR (Saudi Riyal) dan USD (US Dollar), dengan IDR sebagai mata uang dasar
- **Multi-language** — Bahasa Indonesia sebagai bahasa utama, dengan potensi ekspansi ke Bahasa Arab dan Inggris
- **Escrow payment** — pembayaran aman melalui sistem escrow untuk melindungi kedua belah pihak
- **Verified ecosystem** — setiap penyedia jasa melalui proses verifikasi dokumen dan pengalaman

### 1.3 User Roles

| Role | Deskripsi |
|------|-----------|
| **Jamaah** | Pengguna yang mencari dan memesan layanan pendampingan ibadah |
| **Muthawif** | Pembimbing ibadah perorangan yang menawarkan jasa |
| **Provider** | Perusahaan/organisasi penyedia muthawif dan layanan terkait |
| **Admin** | Pengelola platform (verifikasi, moderasi, keuangan) |

### 1.4 Reference

- Website v1: https://wifme.vercel.app/
- Gunakan sebagai referensi arah design dan branding, bukan sebagai blueprint final

---

## 2. Technology Stack

### 2.1 Core

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | **Next.js** (Fullstack) | 16.x (lihat `package.json`) |
| Language | **TypeScript** | ^5 |
| Runtime | **React** | 19.x |
| Styling | **Tailwind CSS** | ^4 |
| UI Components | **shadcn/ui** | Latest |
| Multi-step Forms | **Vercel AI SDK Workflow** / multi-step form pattern | Gunakan untuk alur pengajuan/pengisian form kompleks |

### 2.2 Supporting Libraries

Gunakan library berikut sesuai kebutuhan (install saat dibutuhkan):

- **`zod`** — schema validation untuk form dan API
- **`react-hook-form`** — form state management
- **`@tanstack/react-query`** — server state management dan caching
- **`lucide-react`** — icon library (sudah digunakan di v1)
- **`next-intl`** atau solusi i18n — untuk multi-language support
- **`date-fns`** — date manipulation
- **`nuqs`** — URL search params state management
- **Library lainnya** yang secara spesifik dibutuhkan untuk fitur platform

### 2.3 Font Stack

- **Primary:** Plus Jakarta Sans (weight: 300–800)
- **Arabic:** Amiri (untuk teks Bahasa Arab dan ayat)
- Load via Google Fonts dengan `preconnect` dan `preload`

---

## 3. Architecture & Code Structure

### 3.1 Directory Convention

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # Route group: halaman publik (landing, search, detail)
│   ├── (auth)/             # Route group: login, register, forgot-password
│   ├── (dashboard)/        # Route group: halaman setelah login
│   │   ├── jamaah/         # Dashboard jamaah
│   │   ├── muthawif/       # Dashboard muthawif
│   │   ├── provider/       # Dashboard provider
│   │   └── admin/          # Dashboard admin
│   ├── api/                # API routes (server-side only)
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles & Tailwind directives
├── components/
│   ├── ui/                 # shadcn/ui components (auto-generated)
│   ├── layout/             # Navigation, footer, sidebar, bottom-sheet
│   ├── forms/              # Reusable form components
│   └── shared/             # Shared components across features
├── lib/
│   ├── api/                # API client functions
│   ├── auth/               # Authentication utilities
│   ├── currency/           # Currency conversion & formatting (SAR, USD, IDR)
│   ├── validators/         # Zod schemas
│   ├── constants/          # App-wide constants
│   └── utils/              # General utilities
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── middleware.ts           # Next.js middleware (auth, rate limit, security)
└── config/                 # App configuration
```

### 3.2 Naming Conventions

- **Files:** `kebab-case.ts` / `kebab-case.tsx`
- **Components:** `PascalCase` (match file name ke export)
- **Hooks:** `use-kebab-case.ts` → `export function useKebabCase()`
- **Types/Interfaces:** `PascalCase`, prefix `I` tidak digunakan
- **Constants:** `UPPER_SNAKE_CASE`
- **API routes:** `kebab-case` sesuai REST convention

### 3.3 Code Quality Rules

- Semua function dan component harus memiliki TypeScript types yang eksplisit — **jangan gunakan `any`**
- Gunakan `"use client"` hanya pada component yang benar-benar membutuhkan client-side interactivity
- Prefer Server Components untuk data fetching
- Setiap file tidak boleh melebihi **300 baris** — pecah menjadi module yang lebih kecil jika melebihi
- Semua business logic harus di-extract ke custom hooks atau utility functions
- Gunakan barrel exports (`index.ts`) per folder hanya jika folder memiliki 3+ exports
- Jangan hardcode string — gunakan constants atau config
- **Wajib untuk multi-language:** setiap pembuatan/perubahan label, heading, CTA, helper text, error message, navigasi, atau UI copy lainnya HARUS menambahkan/memperbarui key terjemahan yang sesuai di `messages/id.json`, `messages/en.json`, dan `messages/ar.json`. Jangan menulis UI text langsung di komponen kecuali nama brand, data kontak, kode mata uang, atau teks Arab ayat yang memang bersifat konten tetap.

---

## 4. Mobile-First Design System

### 4.1 Layout Architecture

Platform ini di-design sebagai **native mobile-first** application:

```
┌─────────────────────────┐
│     Status Bar Area     │
├─────────────────────────┤
│                         │
│                         │
│     Main Content        │
│     (scrollable)        │
│                         │
│                         │
│                         │
├──┬──┬────┬──┬──────────┤
│  │  │ ●● │  │          │  ← Bottom Navigation Bar
│🏠│🔍│Menu│📋│👤        │     dengan Center Action Button
└──┴──┴────┴──┴──────────┘
```

### 4.2 Bottom Navigation Bar

- **Fixed di bawah** viewport dengan `position: fixed`
- **5 tab items** — 4 regular + 1 center action button yang menonjol (elevated/floating)
- Center button membuka **bottom sheet** modal dengan menu grid
- Gunakan `safe-area-inset-bottom` untuk kompatibilitas notch devices
- Tab bar menggunakan **glassmorphism** effect (`backdrop-filter: blur`)
- Desktop (≥900px): bottom bar diganti dengan top navigation bar

### 4.3 Responsive Breakpoints

| Breakpoint | Target |
|-----------|--------|
| `< 640px` | Mobile (primary design target) |
| `640px – 899px` | Tablet |
| `≥ 900px` | Desktop (top navbar, expanded layouts) |

### 4.4 Design Tokens

Gunakan CSS custom properties yang sudah ada di v1 sebagai basis:

```css
/* Warna utama */
--emerald: #1B6B4A;
--emerald-light: #27956A;
--emerald-pale: /* light emerald bg */;
--gold: #C4973B;
--gold-light: #E4B55A;
--charcoal: /* dark text */;
--ivory: /* light bg */;
--ivory-dark: /* slightly darker bg */;

/* Semantic */
--text-body: /* body text color */;
--text-muted: /* muted/secondary text */;
--border: /* default border color */;
--error: /* error/danger color */;
--white: #FFFFFF;
```

---

## 5. Security Rules (MANDATORY)

> Setiap baris kode yang ditulis HARUS mematuhi aturan keamanan berikut. Tidak ada pengecualian.

### 5.1 API Security

- **JANGAN PERNAH** expose API keys, secrets, database credentials, atau token di client-side code
- Semua secret disimpan di environment variables dan HANYA diakses di server-side (`process.env`)
- Gunakan `NEXT_PUBLIC_` prefix HANYA untuk variabel yang memang boleh diakses client
- Semua API endpoint harus melalui Next.js API Routes (`/api/`) — jangan panggil third-party API langsung dari client
- Validasi SETIAP input di server-side menggunakan Zod schema, meskipun sudah divalidasi di client
- Gunakan HTTPS strict untuk semua komunikasi

### 5.2 Authentication & Authorization

- Implementasikan proper session management
- Setiap protected route HARUS di-check via middleware (`middleware.ts`)
- Role-based access control (RBAC) — validasi role di SERVER, bukan hanya di client UI
- Token refresh mechanism yang aman
- Logout harus invalidate session di server-side

### 5.3 Input Sanitization & Injection Prevention

**SQL Injection:**
- JANGAN PERNAH gunakan string concatenation untuk query database
- Selalu gunakan parameterized queries atau ORM yang aman
- Validasi dan sanitize semua user input sebelum masuk ke query

**XSS (Cross-Site Scripting):**
- JANGAN PERNAH gunakan `dangerouslySetInnerHTML` kecuali konten sudah di-sanitize dengan library seperti `DOMPurify`
- Escape semua user-generated content yang di-render
- Implementasikan Content-Security-Policy (CSP) headers

**LFI (Local File Inclusion):**
- JANGAN PERNAH gunakan user input untuk construct file paths
- Whitelist semua file paths yang diizinkan
- Validasi dan sanitize path parameters

**Command Injection:**
- JANGAN PERNAH execute shell commands dengan user input
- Jika harus berinteraksi dengan system, gunakan library yang aman dengan whitelisted operations

**CSRF (Cross-Site Request Forgery):**
- Implementasikan CSRF token untuk semua state-changing operations
- Validasi `Origin` dan `Referer` headers

### 5.4 Rate Limiting

```typescript
// Implementasikan rate limiting di middleware.ts atau per-route
// Contoh strategi:
{
  "global": "100 requests / 1 menit / IP",
  "auth_login": "5 requests / 1 menit / IP",
  "auth_register": "3 requests / 1 menit / IP",
  "api_search": "30 requests / 1 menit / user",
  "api_booking": "10 requests / 1 menit / user",
  "api_payment": "5 requests / 1 menit / user"
}
```

- Gunakan sliding window atau token bucket algorithm
- Return proper `429 Too Many Requests` response dengan `Retry-After` header
- Log suspicious activity (repeated 429s dari IP yang sama)
- Implementasikan IP-based dan user-based rate limiting

### 5.5 Security Headers

Semua response HARUS menyertakan headers berikut (via `next.config.ts` atau middleware):

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: [configured per environment]
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 5.6 Data Privacy

- JANGAN log data sensitif (password, token, payment info)
- Encrypt data sensitif at rest dan in transit
- Implementasikan data minimization — hanya simpan data yang diperlukan
- PII (Personally Identifiable Information) harus di-handle sesuai regulasi
- Payment data TIDAK BOLEH disimpan di server kita — gunakan payment gateway

### 5.7 Error Handling

- JANGAN expose stack traces, internal paths, atau database errors ke client
- Gunakan generic error messages untuk client, detailed logs untuk server
- Implementasikan global error boundary di React
- Semua API routes harus memiliki proper try-catch dengan error response yang konsisten

---

## 6. Anti-AI-Slop Design Rules (MANDATORY)

> Platform ini harus terlihat dan terasa seperti dibuat oleh tim design profesional. TIDAK BOLEH ada indikasi bahwa website ini dibuat oleh AI.

### 6.1 Larangan Mutlak

- **JANGAN** gunakan emoticon/emoji di UI text, heading, atau label (kecuali konteks chat/messaging)
- **JANGAN** buat card dengan rounded corners yang berlebihan dan kaku (`border-radius: 24px` dengan shadow generic)
- **JANGAN** gunakan gradient yang terlihat generic/template (rainbow gradients, neon gradients)
- **JANGAN** gunakan layout grid 3-kolom dengan icon-title-description yang terlalu seragam dan repetitif
- **JANGAN** gunakan stock illustration style yang terlihat AI-generated
- **JANGAN** gunakan wording yang terdengar AI-generated seperti:
  - "Unlock the power of..."
  - "Seamlessly integrate..."
  - "Revolutionize your..."
  - "In today's fast-paced world..."
  - "Leverage cutting-edge..."
- **JANGAN** gunakan hero section dengan teks besar + subtitle generic + 2 button (CTA pattern yang terlalu umum) tanpa elemen pembeda yang kuat
- **JANGAN** gunakan terlalu banyak micro-animations yang tidak purposeful

### 6.2 Design Principles

- **Purposeful design** — setiap elemen visual harus memiliki alasan fungsional
- **Asymmetry where appropriate** — hindari layout yang terlalu simetris dan predictable
- **Texture and depth** — gunakan subtle noise, grain, atau organic shapes
- **Custom spacing** — jangan gunakan spacing yang terlalu seragam, variasikan secara intentional
- **Typography hierarchy** — buat kontras yang kuat antara heading, subheading, dan body text
- **Color restraint** — gunakan palet warna yang terkontrol, jangan terlalu banyak warna
- **Human copywriting** — teks harus terasa ditulis oleh manusia yang memahami konteks ibadah

### 6.3 Component Design Standards

- Cards harus memiliki **variasi visual** — tidak semua card terlihat sama
- Border radius bervariasi sesuai konteks: `8px` untuk input, `12px` untuk card kecil, `16-20px` untuk card besar
- Shadows harus subtle dan layered, bukan single-layer `box-shadow` generic
- Hover states harus terasa natural, bukan sekedar `scale(1.05)` generic
- Gunakan warna brand secara konsisten namun dengan variasi tonal (emerald → teal → sage)
- Transitions dan animations menggunakan `cubic-bezier` yang sudah di-custom, bukan `ease` default

### 6.4 Content Guidelines

- Gunakan Bahasa Indonesia yang natural dan sesuai konteks spiritual/ibadah
- Hindari superlative berlebihan ("terbaik", "tercanggih", "pertama di dunia")
- Teks harus informatif dan langsung ke inti — jamaah perlu informasi yang jelas, bukan marketing fluff
- Gunakan referensi Islami yang tepat dan respectful
- Teks Arab menggunakan font Amiri dan harus secara typographic benar

---

## 7. Multi-Currency Implementation

### 7.1 Supported Currencies

| Currency | Code | Symbol | Usage |
|----------|------|--------|-------|
| Indonesian Rupiah | IDR | Rp | Mata uang dasar, tampilan default untuk user Indonesia |
| Saudi Riyal | SAR | ﷼ / SR | Harga lokal di Arab Saudi |
| US Dollar | USD | $ | Referensi internasional |

### 7.2 Rules

- Harga dasar disimpan dalam **IDR** di database
- Exchange rate di-fetch dari reliable source dan di-cache (update minimal per 6 jam)
- User dapat toggle currency display di UI
- Format angka sesuai locale (IDR: `Rp 1.500.000`, USD: `$100.00`, SAR: `SR 375.00`)
- Currency preference disimpan di user profile dan localStorage

---

## 8. Form & Workflow Patterns

### 8.1 Multi-step Forms

Untuk flow kompleks (booking, registrasi muthawif, pengajuan visa), gunakan pattern berikut:

- Step indicator yang jelas (progress bar atau numbered steps)
- Data persist antar step (gunakan state management atau URL params)
- Validasi per-step sebelum lanjut ke step berikutnya
- Ability untuk kembali ke step sebelumnya tanpa kehilangan data
- Summary/review step sebelum final submission
- Gunakan Vercel AI SDK Workflow jika flow melibatkan banyak conditional logic

### 8.2 Form Validation

- Client-side validation untuk immediate feedback
- Server-side validation sebagai source of truth (Zod schemas)
- Error messages yang jelas dan spesifik (bukan "Field required" generic)
- Inline validation (validate on blur, bukan hanya on submit)

---

## 9. Performance Guidelines

- Gunakan `next/image` untuk semua gambar dengan proper sizing
- Implementasikan lazy loading untuk konten di bawah fold
- Code splitting per route (otomatis dari Next.js App Router)
- Minimize client-side JavaScript — prefer Server Components
- Cache API responses yang jarang berubah (profiles, static content)
- Gunakan `loading.tsx` dan `Suspense` untuk loading states yang proper
- Avoid layout shifts (CLS) — set explicit dimensions untuk media elements

---

## 10. Testing & Quality Assurance

- Semua API routes harus memiliki input validation tests
- Security-sensitive functions harus memiliki unit tests
- Test rate limiting behavior
- Test authorization checks (role-based access)
- Test currency conversion accuracy
- Test form validation flows end-to-end

---

## 11. Environment Variables Convention

```
# Server-only (JANGAN gunakan NEXT_PUBLIC_ prefix)
DATABASE_URL=
AUTH_SECRET=
PAYMENT_GATEWAY_KEY=
EXCHANGE_RATE_API_KEY=

# Client-safe (boleh NEXT_PUBLIC_)
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_DEFAULT_CURRENCY=IDR
NEXT_PUBLIC_SUPPORTED_CURRENCIES=IDR,SAR,USD
```

---

## 12. Git & Development Workflow

- Branch naming: `feature/`, `fix/`, `refactor/`, `security/`
- Commit messages dalam Bahasa Inggris, deskriptif
- Jangan commit file `.env`, secrets, atau node_modules
- Review semua dependency sebelum install — hindari dependency dengan vulnerability
- Update dependencies secara regular untuk security patches
- **Wajib (Mandatory):** Setelah melakukan perubahan atau penambahan kode, selalu jalankan pengecekan TypeScript (`npm run typecheck` / `npx tsc --noEmit`) dan linter (`npm run lint`) untuk memastikan tidak ada error pada *type* maupun *syntax* sebelum pekerjaan dianggap selesai.

---

## 13. Agent Skills (MANDATORY)

> Sebelum menulis atau merevisi kode **apapun**, agent WAJIB membaca dan mengikuti skill files yang relevan dari `C:\Users\nural\.agents\skills\`. Skills adalah knowledge base otoritatif yang **menggantikan asumsi dari training data**.

### 13.1 Daftar Skills & Kapan Digunakan

| Priority | Skill | Path | Wajib Baca Ketika |
|----------|-------|------|-------------------|
| 1 | **shadcn** | `shadcn/SKILL.md` | Menambah/menggunakan/menyusun komponen shadcn/ui. **Baca juga sub-rules:** `rules/styling.md`, `rules/forms.md`, `rules/composition.md`, `rules/icons.md` |
| 2 | **ui-ux-pro-max** | `ui-ux-pro-max/SKILL.md` | Membuat halaman baru, mendesain komponen, memilih warna/tipografi/spacing, review UX/aksesibilitas, implementasi animasi. **Gunakan `--design-system` script untuk rekomendasi design system.** |
| 3 | **next-best-practices** | `next-best-practices/SKILL.md` | Menulis/merevisi Next.js code. **Baca juga sub-docs:** `rsc-boundaries.md`, `data-patterns.md`, `error-handling.md`, `metadata.md`, `image.md`, `font.md` |
| 4 | **vercel-react-best-practices** | `vercel-react-best-practices/SKILL.md` | Optimasi performa React — eliminasi waterfalls, bundle size, re-render, server-side performance |
| 5 | **typescript-pro** | `typescript-pro/SKILL.md` | Type system design, branded types, type guards, discriminated unions, tsconfig. **Baca juga** `references/` untuk advanced patterns |
| 6 | **find-skills** | `find-skills/SKILL.md` | Ketika butuh kapabilitas yang mungkin ada sebagai installable skill |

### 13.2 Aturan Penggunaan

- **Baca SKILL.md SEBELUM menulis kode** — Jangan menebak API atau pola dari training data. Baca skill file terlebih dahulu.
- **shadcn rules adalah hukum** — Semua aturan di `shadcn/rules/*.md` bersifat wajib saat menggunakan komponen shadcn/ui:
  - Gunakan `gap-*` bukan `space-x-*`/`space-y-*`
  - Gunakan `size-*` bukan `w-* h-*` untuk dimensi yang sama
  - Gunakan `cn()` untuk conditional classes
  - Gunakan `data-icon` untuk ikon di dalam Button
  - Jangan override warna komponen via `className` — gunakan semantic tokens atau variants
  - Jangan tambahkan manual `z-index` pada overlay components
- **UI/UX Pro Max wajib untuk halaman baru** — Saat membuat halaman atau komponen baru, jalankan `--design-system` script untuk mendapatkan rekomendasi design system yang kontekstual.
- **Vercel React rules untuk performa** — Saat menulis komponen React, pastikan mengikuti aturan eliminasi waterfall (`Promise.all`, Suspense), bundle optimization (dynamic imports), dan re-render prevention.
- **TypeScript Pro untuk type safety** — Semua public API harus memiliki explicit return types. Gunakan branded types untuk domain modeling. Jangan gunakan `any` tanpa justifikasi.
- **Cross-reference antar skills** — Skills saling melengkapi. Contoh: saat membuat form, baca `shadcn/rules/forms.md` DAN `ui-ux-pro-max` bagian "Forms & Feedback".

### 13.3 Prioritas Konflik

Jika ada konflik antara skill dan aturan di AGENTS.md ini:
1. **AGENTS.md Section 5 (Security)** selalu menang — tidak ada pengecualian
2. **AGENTS.md Section 6 (Anti-AI-Slop)** menang atas rekomendasi style dari skill
3. **Skill-specific rules** menang atas asumsi dari training data
4. Jika konflik antar skills, prioritaskan sesuai tabel di atas (shadcn > ui-ux > next > vercel-react > typescript)
