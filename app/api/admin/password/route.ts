import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { verifyAdminPassword, ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/auth";
import { verifyFormToken } from "@/lib/auth/form-token";
import { updateAdminPassword } from "@/lib/db/queries";

function getCookieToken(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${ADMIN_COOKIE_NAME}=`)) continue;
    return trimmed.slice(ADMIN_COOKIE_NAME.length + 1);
  }

  return null;
}

async function isAuthorized(request: Request, formToken: string | null | undefined) {
  if (await verifyFormToken(formToken, "password")) {
    return true;
  }

  const cookieToken = getCookieToken(request);
  return verifyAdminSessionToken(cookieToken);
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
      _token?: string;
    };

    if (!(await isAuthorized(request, body._token))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const currentPassword = body.currentPassword ?? "";
    const newPassword = body.newPassword ?? "";
    const confirmPassword = body.confirmPassword ?? "";

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 8 caracteres" },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "La nueva contraseña y la confirmación no coinciden" },
        { status: 400 },
      );
    }

    if (!(await verifyAdminPassword(currentPassword, request))) {
      return NextResponse.json(
        { error: "La contraseña actual no es correcta" },
        { status: 400 },
      );
    }

    await updateAdminPassword(newPassword, request);
    revalidatePath("/admin/seguridad");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update admin password", error);
    return NextResponse.json(
      { error: "No se pudo cambiar la contraseña" },
      { status: 500 },
    );
  }
}
