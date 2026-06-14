import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/auth";

function isServerActionRequest(request: NextRequest) {
  return Boolean(
    request.headers.get("Next-Action") ??
      request.headers.get("next-action"),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isServerActionRequest(request)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const authenticated = await verifyAdminSessionToken(token);

    if (!authenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
