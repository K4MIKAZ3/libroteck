const CONTENT_PATHS = ["/home", "/privacidad", "/sobre-nosotros"] as const;

export function isAdsEligiblePath(pathname: string): boolean {
  if (!pathname || pathname === "/") {
    return false;
  }

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next")
  ) {
    return false;
  }

  if (pathname === "/carrito" || pathname === "/ads.txt") {
    return false;
  }

  if (pathname.startsWith("/producto/")) {
    return true;
  }

  return CONTENT_PATHS.includes(pathname as (typeof CONTENT_PATHS)[number]);
}
