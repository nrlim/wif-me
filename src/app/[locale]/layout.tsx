import type { Metadata } from "next";
import { Amiri, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode, ReactElement } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { CurrencyProvider } from "@/lib/currency/context";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import "../globals.css";

type AppLocale = (typeof routing.locales)[number];

function isAppLocale(locale: string): locale is AppLocale {
  return routing.locales.some((supportedLocale) => supportedLocale === locale);
}

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wifme.app"),
  title: {
    default: "Wif-Me | Platform Pendamping Ibadah Umrah",
    template: "%s | Wif-Me",
  },
  description:
    "Platform multi-service untuk muthawif personal, provider, transportasi, dan pengurusan visa jamaah umrah mandiri.",
  openGraph: {
    title: "Wif-Me | Platform Pendamping Ibadah Umrah",
    description: "Platform multi-service untuk muthawif personal, provider, transportasi, dan pengurusan visa jamaah umrah mandiri.",
    siteName: "Wif-Me",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wif-Me | Platform Pendamping Ibadah Umrah",
    description: "Platform multi-service untuk muthawif personal, provider, transportasi, dan pengurusan visa jamaah umrah mandiri.",
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>): Promise<ReactElement> {
  const { locale } = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} data-scroll-behavior="smooth" className={`${jakartaSans.variable} ${amiri.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
