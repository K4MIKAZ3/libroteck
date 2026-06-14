import {
  ADMIN_COOKIE_NAME,
  isAdminAuthenticated,
  verifyAdminSessionToken,
} from "@/lib/auth";

function getCookieValue(
  cookieHeader: string | null,
  name: string,
): string | undefined {
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (rawName === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }

  return undefined;
}

export async function requireAdminRequest(request: Request) {
  const token = getCookieValue(
    request.headers.get("cookie"),
    ADMIN_COOKIE_NAME,
  );

  if (await verifyAdminSessionToken(token)) {
    return;
  }

  if (await isAdminAuthenticated()) {
    return;
  }

  throw new Error("UNAUTHORIZED");
}
