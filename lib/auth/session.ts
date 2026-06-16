import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "libroteck_admin";
const SESSION_DURATION = 60 * 60 * 24 * 7;
const MIN_SECRET_LENGTH = 32;

function assertProductionSecret() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      "ADMIN_SECRET must be set in production (at least 32 characters).",
    );
  }
}

export function getAdminSecret() {
  assertProductionSecret();

  const secret =
    process.env.ADMIN_SECRET ??
    (process.env.NODE_ENV === "production"
      ? ""
      : "libroteck-dev-secret-change-me");

  if (!secret) {
    throw new Error("ADMIN_SECRET is required.");
  }

  return new TextEncoder().encode(secret);
}

export function getAdminCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  const sameSite: "strict" | "lax" = isProduction ? "strict" : "lax";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    maxAge: SESSION_DURATION,
    path: "/",
  };
}

export async function createAdminSessionToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getAdminSecret());
}

export async function verifyAdminSessionToken(token?: string | null) {
  if (!token) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(token, getAdminSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function createAdminSession() {
  const token = await createAdminSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, getAdminCookieOptions());
  return token;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("UNAUTHORIZED");
  }
}
