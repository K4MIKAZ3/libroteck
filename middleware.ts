import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { resolveStoreSlugFromHost } from "@/lib/store/context";

export function middleware(request: NextRequest) {
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
