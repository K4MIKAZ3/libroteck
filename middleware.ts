import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { ADMIN_COOKIE_NAME } from "@/lib/auth/session";
import { resolveStoreSlugFromHost } from "@/lib/store/context";

async function hasAdminSession(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return false;
  }

  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) ||
    (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/login"))
  ) {
    if (!(await hasAdminSession(request))) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }

      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const host = request.headers.get("host") ?? "";
  const storeSlug = resolveStoreSlugFromHost(host);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-store-slug", storeSlug);

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
