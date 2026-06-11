import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const SESSION_COOKIE_NAME = "wif_session";
const PROTECTED_PREFIXES = ["/jamaah", "/muthawif", "/provider", "/admin"] as const;

export default function proxy(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;
  const normalizedPath = stripLocale(pathname);
  const isProtected = PROTECTED_PREFIXES.some((prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`));

  if (isProtected && !request.cookies.has(SESSION_COOKIE_NAME)) {
    const locale = getLocaleFromPath(pathname);
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("next", `${normalizedPath}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(request);
}

function getLocaleFromPath(pathname: string): string {
  const segment = pathname.split("/")[1];
  return routing.locales.some((locale) => locale === segment) ? segment : routing.defaultLocale;
}

function stripLocale(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  if (pathname === `/${locale}`) return "/";
  return pathname.startsWith(`/${locale}/`) ? pathname.slice(locale.length + 1) : pathname;
}

export const config = {
  matcher: ["/", "/(id|en|ar)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
