import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { isAdminRole, type AdminRole } from "@/lib/auth/roles";

export const ADMIN_COOKIE_NAME = "libroteck_admin";
const SESSION_DURATION = 60 * 60 * 24 * 7;
const MIN_SECRET_LENGTH = 32;

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
  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    ...getAdminCookieOptions(host),
    maxAge: 0,
  });
  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    ...getHostOnlyCookieOptions(),
    maxAge: 0,
  });
}

export function setAdminAuthCookie(
  cookieStore: WritableCookies,
  token: string,
  host?: string | null,
) {
  clearAdminAuthCookies(cookieStore, host);
  cookieStore.set(ADMIN_COOKIE_NAME, token, getAdminCookieOptions(host));
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

export function readAdminCookieTokens(
  cookieHeader: string | null | undefined,
): string[] {
  if (!cookieHeader) {
    return [];
  }

  const tokens: string[] = [];

  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${ADMIN_COOKIE_NAME}=`)) {
      continue;
    }

    const value = trimmed.slice(ADMIN_COOKIE_NAME.length + 1);
    if (value) {
      tokens.push(value);
    }
  }

  return tokens;
}

export async function verifyAdminSessionFromCookieHeader(
  cookieHeader: string | null | undefined,
) {
  for (const token of readAdminCookieTokens(cookieHeader)) {
    if (await parseAdminSessionToken(token)) {
      return true;
    }
  }

  return false;
}

export async function verifyAdminSessionToken(token?: string | null) {
  return Boolean(await parseAdminSessionToken(token));
}

export async function getAdminSessionFromCookieHeader(
  cookieHeader: string | null | undefined,
) {
  for (const token of readAdminCookieTokens(cookieHeader)) {
    const session = await parseAdminSessionToken(token);
    if (session) {
      return session;
    }
  }

  return null;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const tokens = [
    cookieStore.get(ADMIN_COOKIE_NAME)?.value,
    ...readAdminCookieTokens(headerStore.get("cookie")),
  ].filter((token): token is string => Boolean(token));

  for (const token of tokens) {
    const session = await parseAdminSessionToken(token);
    if (session) {
      return session;
    }
  }

  return null;
}

export async function createAdminSession(user: AdminSessionPayload) {
  const token = await createAdminSessionToken(user);
  const cookieStore = await cookies();
  const host = (await headers()).get("host");
  setAdminAuthCookie(cookieStore, token, host);
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
