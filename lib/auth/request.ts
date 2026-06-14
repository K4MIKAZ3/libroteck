import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/auth/session";
import {
  verifyFormToken,
  type FormTokenPurpose,
} from "@/lib/auth/form-token";

export function getCookieTokenFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${ADMIN_COOKIE_NAME}=`)) continue;
    return trimmed.slice(ADMIN_COOKIE_NAME.length + 1);
  }

  return undefined;
}

export async function authorizeAdminRequest(
  request: Request,
  formToken?: string | null,
  purpose?: FormTokenPurpose,
) {
  if (purpose && (await verifyFormToken(formToken, purpose))) {
    return true;
  }

  const cookieStore = await cookies();
  if (await verifyAdminSessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value)) {
    return true;
  }

  const tokenFromHeader = getCookieTokenFromRequest(request);
  if (await verifyAdminSessionToken(tokenFromHeader)) {
    return true;
  }

  return false;
}

export async function requireAdminRequest(
  request: Request,
  formToken?: string | null,
  purpose?: FormTokenPurpose,
) {
  if (!(await authorizeAdminRequest(request, formToken, purpose))) {
    throw new Error("UNAUTHORIZED");
  }
}
