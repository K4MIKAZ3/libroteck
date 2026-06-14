import { SignJWT, jwtVerify } from "jose";
import { getAdminSecret } from "@/lib/auth";

export type FormTokenPurpose = "settings" | "password";

export async function createFormToken(purpose: FormTokenPurpose) {
  return new SignJWT({ purpose })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m")
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
