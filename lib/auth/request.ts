import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  readAdminCookieTokens,
  verifyAdminSessionToken,
} from "@/lib/auth/session";
import {
  verifyFormToken,
  type FormTokenPurpose,
} from "@/lib/auth/form-token";

export function getCookieTokenFromRequest(request: Request) {
  const tokens = readAdminCookieTokens(request.headers.get("cookie"));
  return tokens[0];
}

export async function hasValidAdminSession(request: Request) {
  const cookieStore = await cookies();
  const candidates = [
    cookieStore.get(ADMIN_COOKIE_NAME)?.value,
    ...readAdminCookieTokens(request.headers.get("cookie")),
  ].filter((token): token is string => Boolean(token));

  for (const token of candidates) {
    if (await verifyAdminSessionToken(token)) {
      return true;
    }
  }

  return false;
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
