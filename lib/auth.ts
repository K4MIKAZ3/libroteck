import bcrypt from "bcryptjs";
import { getAdminPasswordHash } from "@/lib/db/queries";

export {
  ADMIN_COOKIE_NAME,
  createAdminSession,
  createAdminSessionToken,
  clearAdminSession,
  getAdminCookieOptions,
  getAdminSecret,
  isAdminAuthenticated,
  requireAdmin,
  verifyAdminSessionToken,
} from "@/lib/auth/session";

export async function verifyAdminPassword(password: string, request?: Request) {
  const hash = await getAdminPasswordHash(request);
  if (hash) {
    return bcrypt.compare(password, hash);
  }

  const expected = process.env.ADMIN_PASSWORD ?? "admin123";
  return password === expected;
}
