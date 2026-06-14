import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getAdminPasswordHash } from "@/lib/db/queries";

export const ADMIN_COOKIE_NAME = "libroteck_admin";
const SESSION_DURATION = 60 * 60 * 24 * 7;

export function getAdminSecret() {
  return new TextEncoder().encode(
    process.env.ADMIN_SECRET ?? "libroteck-dev-secret-change-me",
  );
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_DURATION,
    path: "/",
  };
}

export async function verifyAdminPassword(password: string) {
  const hash = await getAdminPasswordHash();
  if (hash) {
    return bcrypt.compare(password, hash);
  }

  const expected = process.env.ADMIN_PASSWORD ?? "admin123";
  return password === expected;
}

export async function createAdminSessionToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getAdminSecret());
}

export async function verifyAdminSessionToken(token?: string | null) {
  if (!token) return false;

  try {
    await jwtVerify(token, getAdminSecret());
    return true;
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
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    throw new Error("UNAUTHORIZED");
  }
}
