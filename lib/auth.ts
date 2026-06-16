import bcrypt from "bcryptjs";
import {
  getAdminUserByUsername,
  verifyAdminUserPassword,
} from "@/lib/db/admin-users";
import { getAdminPasswordHash } from "@/lib/db/queries";
import type { AdminSessionPayload } from "@/lib/auth/session";

export {
  ADMIN_COOKIE_NAME,
  clearAdminAuthCookies,
  createAdminSession,
  createAdminSessionToken,
  clearAdminSession,
  getAdminCookieOptions,
  getAdminSecret,
  getAdminSession,
  getHostFromRequest,
  isAdminAuthenticated,
  parseAdminSessionToken,
  readAdminCookieTokens,
  requireAdmin,
  setAdminAuthCookie,
  verifyAdminSessionFromCookieHeader,
  verifyAdminSessionToken,
} from "@/lib/auth/session";

export type { AdminSessionPayload } from "@/lib/auth/session";

function getEnvAdminPassword() {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (password) {
    return password;
  }

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return "admin123";
}

export async function verifyAdminLogin(
  username: string,
  password: string,
  request?: Request,
): Promise<AdminSessionPayload | null> {
  const normalizedUsername = username.trim().toLowerCase() || "admin";
  const user = await verifyAdminUserPassword(
    normalizedUsername,
    password,
    request,
  );

  if (user) {
    return {
      userId: user.id,
      username: user.username,
      role: user.role,
      storeId: user.storeId,
    };
  }

  if (normalizedUsername !== "admin") {
    return null;
  }

  const hash = await getAdminPasswordHash(request);
  if (hash && (await bcrypt.compare(password, hash))) {
    const legacyUser = await getAdminUserByUsername("admin", request);
    if (legacyUser) {
      return {
        userId: legacyUser.id,
        username: legacyUser.username,
        role: legacyUser.role,
        storeId: legacyUser.storeId,
      };
    }
  }

  const expected = getEnvAdminPassword();
  if (!expected || password !== expected) {
    return null;
  }

  const storeModule = await import("@/lib/store/context");
  const storeId = request
    ? await (async () => {
        const { getStoreSlugFromRequest } = storeModule;
        const { getDb } = await import("@/lib/db/index");
        const { stores } = await import("@/lib/db/schema");
        const { eq } = await import("drizzle-orm");
        const slug = getStoreSlugFromRequest(request);
        const db = await getDb();
        const store = await db.query.stores.findFirst({
          where: eq(stores.slug, slug),
        });
        return store?.id ?? 0;
      })()
    : (await storeModule.getStoreContext()).storeId;

  return {
    userId: 0,
    username: "admin",
    role: "superadmin",
    storeId,
  };
}

/** @deprecated Use verifyAdminLogin */
export async function verifyAdminPassword(password: string, request?: Request) {
  const session = await verifyAdminLogin("admin", password, request);
  return Boolean(session);
}
