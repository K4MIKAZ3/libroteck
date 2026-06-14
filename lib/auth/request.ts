import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/auth";

function getCookieValue(
  cookieHeader: string | null,
  name: string,
): string | undefined {
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${name}=`)) continue;
    return trimmed.slice(name.length + 1);
  }

  return undefined;
}

export async function requireAdminRequest(request: Request) {
  const cookieStore = await cookies();
  const tokenFromStore = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (await verifyAdminSessionToken(tokenFromStore)) {
    return;
  }

  const tokenFromHeader = getCookieValue(
    request.headers.get("cookie"),
    ADMIN_COOKIE_NAME,
  );

  if (await verifyAdminSessionToken(tokenFromHeader)) {
    return;
  }

  throw new Error("UNAUTHORIZED");
}
