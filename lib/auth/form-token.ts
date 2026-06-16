import { SignJWT, jwtVerify } from "jose";
import { getAdminSecret } from "@/lib/auth/session";

export type FormTokenPurpose =
  | "settings"
  | "password"
  | "products"
  | "users";

const FORM_TOKEN_TTL: Record<FormTokenPurpose, string> = {
  products: "8h",
  settings: "2h",
  password: "30m",
  users: "2h",
};

export async function createFormToken(purpose: FormTokenPurpose) {
  return new SignJWT({ purpose })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(FORM_TOKEN_TTL[purpose])
    .sign(getAdminSecret());
}

export async function verifyFormToken(
  token: string | null | undefined,
  purpose: FormTokenPurpose,
) {
  if (!token) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(token, getAdminSecret());
    return payload.purpose === purpose;
  } catch {
    return false;
  }
}
