import bcrypt from "bcryptjs";
import { getAdminPasswordHash } from "@/lib/db/queries";

export {
  ADMIN_COOKIE_NAME,
  createAdminSession,
  createAdminSessionToken,
  clearAdminSession,
  getAdminCookieOptions,
  getAdminSecret,
  getHostFromRequest,
  isAdminAuthenticated,
  requireAdmin,
  verifyAdminSessionToken,
} from "@/lib/auth/session";

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

export async function verifyAdminPassword(password: string, request?: Request) {
  const hash = await getAdminPasswordHash(request);
  if (hash) {
    return bcrypt.compare(password, hash);
  }

  const expected = getEnvAdminPassword();
  if (!expected) {
    return false;
  }

  return password === expected;
}
