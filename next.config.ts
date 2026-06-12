import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const scriptPolicy =
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://kfzyvdfbwojcqawfvntw.supabase.co";
const supabaseHostname = new URL(supabaseUrl).hostname;

const supabaseImageSource = `https://${supabaseHostname}`;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: `${scriptPolicy}; default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' ${supabaseImageSource} data: blob:; font-src 'self' data:; connect-src 'self' ${supabaseImageSource}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`,
  },
] as const;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...securityHeaders],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
