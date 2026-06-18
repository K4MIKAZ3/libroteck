import { cookies } from "next/headers";
import {
  roleHasPermission,
  type AdminPermission,
  type AdminRole,
} from "@/lib/auth/roles";
import {
  verifyFormToken,
  type FormTokenPurpose,
} from "@/lib/auth/form-token";
import {
  ADMIN_COOKIE_NAME,
  getAdminCookieName,
  getAdminSession,
  getAdminSessionForStore,
  readCookieValues,
  type AdminSessionPayload,
} from "@/lib/auth/session";
import { getStoreIdForRequest } from "@/lib/db/admin-users";
import { getStoreSlugFromRequest } from "@/lib/store/context";

export function getCookieTokenFromRequest(request: Request) {
  const storeSlug = getStoreSlugFromRequest(request);
  const values = [
    ...readCookieValues(request.headers.get("cookie"), getAdminCookieName(storeSlug)),
    ...readCookieValues(request.headers.get("cookie"), ADMIN_COOKIE_NAME),
  ];
  return values[0];
}

export async function getAdminSessionFromRequest(request: Request) {
  const storeSlug = getStoreSlugFromRequest(request);
  const cookieStore = await cookies();

  return getAdminSessionForStore(
    storeSlug,
    request.headers.get("cookie"),
    cookieStore.get(getAdminCookieName(storeSlug))?.value ??
      cookieStore.get(ADMIN_COOKIE_NAME)?.value,
  );
}

async function assertSessionStore(
  session: AdminSessionPayload,
  request: Request,
) {
  const storeId = await getStoreIdForRequest(request);
  if (session.storeId !== storeId) {
    throw new Error("UNAUTHORIZED");
  }
}

export async function hasValidAdminSession(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return false;
  }

  try {
    await assertSessionStore(session, request);
    return true;
  } catch {
    return false;
  }
}

export async function requireAdminSession(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  await assertSessionStore(session, request);
  return session;
}

export async function requireAdminPermission(
  request: Request,
  permission: AdminPermission,
) {
  const session = await requireAdminSession(request);

  if (!roleHasPermission(session.role, permission)) {
    throw new Error("FORBIDDEN");
  }

  return session;
}

export async function requireAdminMutation(
  request: Request,
  formToken: string | null | undefined,
  purpose: FormTokenPurpose,
  permission: AdminPermission,
) {
  const session = await requireAdminPermission(request, permission);

  if (!(await verifyFormToken(formToken, purpose))) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

export async function requireAdminRequest(
  request: Request,
  formToken?: string | null,
  purpose?: FormTokenPurpose,
  permission: AdminPermission = "products:write",
) {
  if (purpose) {
    await requireAdminMutation(request, formToken, purpose, permission);
    return;
  }

  await requireAdminPermission(request, permission);
}

export async function getCurrentAdminRole(): Promise<AdminRole | null> {
  const session = await getAdminSession();
  return session?.role ?? null;
}

export async function getCurrentAdminSession() {
  return getAdminSession();
}
