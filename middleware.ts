import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyAdminSessionFromCookieHeader } from "@/lib/auth/session";
import { resolveStoreSlugFromHost } from "@/lib/store/context";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const host = request.headers.get("host") ?? "";
  const storeSlug = resolveStoreSlugFromHost(host);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-store-slug", storeSlug);

  if (
    (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) ||
    (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/login"))
  ) {
    if (
      !(await verifyAdminSessionFromCookieHeader(
        request.headers.get("cookie"),
        storeSlug,
      ))
    ) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }

      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
