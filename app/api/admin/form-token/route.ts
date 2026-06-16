import { NextResponse } from "next/server";
import {
  createFormToken,
  type FormTokenPurpose,
} from "@/lib/auth/form-token";
import { requireAdminSession } from "@/lib/auth/request";

const ALLOWED_PURPOSES = new Set<FormTokenPurpose>([
  "settings",
  "password",
  "products",
  "users",
]);

export async function GET(request: Request) {
  const purpose = new URL(request.url).searchParams.get(
    "purpose",
  ) as FormTokenPurpose | null;

  if (!purpose || !ALLOWED_PURPOSES.has(purpose)) {
    return NextResponse.json({ error: "Propósito inválido" }, { status: 400 });
  }

  try {
    await requireAdminSession(request);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const token = await createFormToken(purpose);
  return NextResponse.json({ token });
}
