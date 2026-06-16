import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getAdminCookieOptions,
  getHostFromRequest,
  verifyAdminPassword,
} from "@/lib/auth";
import { requireAdminMutation } from "@/lib/auth/request";
import { updateAdminPassword } from "@/lib/db/queries";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
      _token?: string;
    };

    try {
      await requireAdminMutation(request, body._token, "password");
    } catch {
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

    const token = await createAdminSessionToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set(
      ADMIN_COOKIE_NAME,
      token,
      getAdminCookieOptions(getHostFromRequest(request)),
    );
    return response;
  } catch (error) {
    console.error("Failed to update admin password", error);
    return NextResponse.json(
      { error: "No se pudo cambiar la contraseña" },
      { status: 500 },
    );
  }
}
