import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "libroteck_admin";
const SESSION_DURATION = 60 * 60 * 24 * 7;

function getSecret() {
  return new TextEncoder().encode(
    process.env.ADMIN_SECRET ?? "libroteck-dev-secret-change-me",
  );
}

export async function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "admin123";
  return password === expected;
}

export async function createAdminSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    throw new Error("UNAUTHORIZED");
  }
}
