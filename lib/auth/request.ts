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

export async function hasValidAdminSession(request: Request) {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(ADMIN_COOKIE_NAME)?.value ??
    getCookieTokenFromRequest(request);

  return verifyAdminSessionToken(token);
}

export async function requireAdminSession(request: Request) {
  if (!(await hasValidAdminSession(request))) {
    throw new Error("UNAUTHORIZED");
  }
}

export async function requireAdminMutation(
  request: Request,
  formToken: string | null | undefined,
  purpose: FormTokenPurpose,
) {
  await requireAdminSession(request);

  if (!(await verifyFormToken(formToken, purpose))) {
    throw new Error("UNAUTHORIZED");
  }
}

/** @deprecated Prefer requireAdminSession or requireAdminMutation */
export async function authorizeAdminRequest(
  request: Request,
  formToken?: string | null,
  purpose?: FormTokenPurpose,
) {
  if (!(await hasValidAdminSession(request))) {
    return false;
  }

  if (purpose) {
    return verifyFormToken(formToken, purpose);
  }

  return true;
}

export async function requireAdminRequest(
  request: Request,
  formToken?: string | null,
  purpose?: FormTokenPurpose,
) {
  if (purpose) {
    await requireAdminMutation(request, formToken, purpose);
    return;
  }

  await requireAdminSession(request);
}
