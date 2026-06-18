import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { isAdminRole, type AdminRole } from "@/lib/auth/roles";
import {
  getStoreSlugFromRequest,
  resolveStoreSlugFromHost,
  type StoreSlug,
} from "@/lib/store/context";

export const ADMIN_COOKIE_NAME = "libroteck_admin";
const SESSION_DURATION = 60 * 60 * 24 * 7;
const MIN_SECRET_LENGTH = 32;

export function getAdminCookieName(storeSlug: StoreSlug) {
  return `${ADMIN_COOKIE_NAME}_${storeSlug}`;
}

export function getAllAdminCookieNames(): string[] {
  return [
    ADMIN_COOKIE_NAME,
    getAdminCookieName("libroteck"),
    getAdminCookieName("streaming"),
  ];
}

export type AdminSessionPayload = {
  userId: number;
  username: string;
  role: AdminRole;
  storeId: number;
};

function readAdminSecret(): string | null {
  const secret = process.env.ADMIN_SECRET?.trim();

  if (process.env.NODE_ENV === "production") {
    if (!secret || secret.length < MIN_SECRET_LENGTH) {
      return null;
    }
    return secret;
  }

  return secret || "libroteck-dev-secret-change-me";
}

function assertProductionSecret() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  if (!readAdminSecret()) {
    throw new Error(
      "ADMIN_SECRET must be set in production (at least 32 characters).",
    );
  }
}

export function getAdminSecret() {
  assertProductionSecret();

  const secret = readAdminSecret();
  if (!secret) {
    throw new Error("ADMIN_SECRET is required.");
  }

  return new TextEncoder().encode(secret);
}

export function resolveAdminCookieDomain(host?: string | null): string | undefined {
  if (process.env.NODE_ENV !== "production" || !host) {
    return undefined;
  }

  const hostname = host.split(":")[0].toLowerCase();
  if (hostname === "libroteck.xyz" || hostname.endsWith(".libroteck.xyz")) {
    return ".libroteck.xyz";
  }

  return undefined;
}

export function getHostFromRequest(request: Request): string | undefined {
  return request.headers.get("host") ?? undefined;
}

export function getAdminCookieOptions(host?: string | null) {
  const isProduction = process.env.NODE_ENV === "production";
  const domain = resolveAdminCookieDomain(host);

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge: SESSION_DURATION,
    path: "/",
    ...(domain ? { domain } : {}),
  };
}

function getHostOnlyCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
  };
}

type WritableCookies = {
  set: (
    name: string,
    value: string,
    options?: {
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: "lax" | "strict" | "none";
      maxAge?: number;
      path?: string;
      domain?: string;
    },
  ) => void;
};

export function clearAdminAuthCookies(
  cookieStore: WritableCookies,
  host?: string | null,
) {
  for (const cookieName of getAllAdminCookieNames()) {
    cookieStore.set(cookieName, "", {
      ...getAdminCookieOptions(host),
      maxAge: 0,
    });
    cookieStore.set(cookieName, "", {
      ...getHostOnlyCookieOptions(),
      maxAge: 0,
    });
  }
}

export function setAdminAuthCookie(
  cookieStore: WritableCookies,
  token: string,
  storeSlug: StoreSlug,
  host?: string | null,
) {
  clearAdminAuthCookies(cookieStore, host);
  cookieStore.set(
    getAdminCookieName(storeSlug),
    token,
    getAdminCookieOptions(host),
  );
}

export async function createAdminSessionToken(user: AdminSessionPayload) {
  return new SignJWT({
    sub: String(user.userId),
    username: user.username,
    role: user.role,
    storeId: user.storeId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getAdminSecret());
}

export function parseAdminSessionPayload(
  payload: Record<string, unknown>,
): AdminSessionPayload | null {
  const userId = Number(payload.sub);
  const username =
    typeof payload.username === "string" ? payload.username : null;
  const role = typeof payload.role === "string" ? payload.role : null;
  const storeId = Number(payload.storeId);

  if (
    !Number.isFinite(userId) ||
    !username ||
    !isAdminRole(role) ||
    !Number.isFinite(storeId)
  ) {
    return null;
  }

  return { userId, username, role, storeId };
}

export async function parseAdminSessionToken(
  token?: string | null,
): Promise<AdminSessionPayload | null> {
  if (!token) {
    return null;
  }

  const secret = readAdminSecret();
  if (!secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );
    return parseAdminSessionPayload(payload as Record<string, unknown>);
  } catch {
    return null;
  }
}

export function readCookieValues(
  cookieHeader: string | null | undefined,
  cookieName: string,
): string[] {
  if (!cookieHeader) {
    return [];
  }

  const values: string[] = [];
  const prefix = `${cookieName}=`;

  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(prefix)) {
      continue;
    }

    const value = trimmed.slice(prefix.length);
    if (value) {
      values.push(value);
    }
  }

  return values;
}

export function readAdminCookieTokens(
  cookieHeader: string | null | undefined,
): string[] {
  return readCookieValues(cookieHeader, ADMIN_COOKIE_NAME);
}

async function resolveStoreIdForSlug(storeSlug: StoreSlug) {
  const { getDb } = await import("@/lib/db/index");
  const { stores } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const db = await getDb();
  const store = await db.query.stores.findFirst({
    where: eq(stores.slug, storeSlug),
  });

  if (!store) {
    throw new Error(`Tienda no encontrada: ${storeSlug}`);
  }

  return store.id;
}

async function readSessionTokensForStore(
  storeSlug: StoreSlug,
  cookieHeader?: string | null,
  cookieStoreValue?: string | null,
) {
  const tokens = [
    cookieStoreValue,
    ...readCookieValues(cookieHeader, getAdminCookieName(storeSlug)),
    ...readAdminCookieTokens(cookieHeader),
  ].filter((token): token is string => Boolean(token));

  return tokens;
}

export async function getAdminSessionForStore(
  storeSlug: StoreSlug,
  cookieHeader?: string | null,
  cookieStoreValue?: string | null,
) {
  const storeId = await resolveStoreIdForSlug(storeSlug);
  const tokens = await readSessionTokensForStore(
    storeSlug,
    cookieHeader,
    cookieStoreValue,
  );

  for (const token of tokens) {
    const session = await parseAdminSessionToken(token);
    if (session?.storeId === storeId) {
      return session;
    }
  }

  return null;
}

export async function verifyAdminSessionFromCookieHeader(
  cookieHeader: string | null | undefined,
  storeSlug: StoreSlug,
) {
  const session = await getAdminSessionForStore(storeSlug, cookieHeader);
  return Boolean(session);
}

export async function verifyAdminSessionToken(token?: string | null) {
  return Boolean(await parseAdminSessionToken(token));
}

export async function getAdminSessionFromCookieHeader(
  cookieHeader: string | null | undefined,
  storeSlug?: StoreSlug,
) {
  if (storeSlug) {
    return getAdminSessionForStore(storeSlug, cookieHeader);
  }

  for (const slug of ["libroteck", "streaming"] as const) {
    const session = await getAdminSessionForStore(slug, cookieHeader);
    if (session) {
      return session;
    }
  }

  return null;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const storeSlug = resolveStoreSlugFromHost(headerStore.get("host") ?? "");

  return getAdminSessionForStore(
    storeSlug,
    headerStore.get("cookie"),
    cookieStore.get(getAdminCookieName(storeSlug))?.value ??
      cookieStore.get(ADMIN_COOKIE_NAME)?.value,
  );
}

export async function createAdminSession(user: AdminSessionPayload) {
  const token = await createAdminSessionToken(user);
  const cookieStore = await cookies();
  const headerStore = await headers();
  const host = headerStore.get("host");
  const { getStoreSlug } = await import("@/lib/store/context");
  const storeSlug = await getStoreSlug();
  setAdminAuthCookie(cookieStore, token, storeSlug, host);
  return token;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const host = (await headers()).get("host");
  clearAdminAuthCookies(cookieStore, host);
}

export async function isAdminAuthenticated() {
  return Boolean(await getAdminSession());
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("UNAUTHORIZED");
  }
}
