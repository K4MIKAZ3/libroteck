import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getHostFromRequest,
  setAdminAuthCookie,
  verifyAdminLogin,
} from "@/lib/auth";
import { requireAdminSession } from "@/lib/auth/request";
import { updateAdminUserPassword } from "@/lib/db/admin-users";
import { updateAdminPassword } from "@/lib/db/queries";
import { getStoreSlugFromRequest } from "@/lib/store/context";

export async function PUT(request: Request) {
  try {
    const session = await requireAdminSession(request);
    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
      _token?: string;
    };

    const { verifyFormToken } = await import("@/lib/auth/form-token");
    if (!(await verifyFormToken(body._token, "password"))) {
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

    if (session.userId > 0) {
      const valid = await verifyAdminLogin(
        session.username,
        currentPassword,
        request,
      );
      if (!valid) {
        return NextResponse.json(
          { error: "La contraseña actual no es correcta" },
          { status: 400 },
        );
      }

      await updateAdminUserPassword(session.userId, newPassword, request);
    } else {
      const valid = await verifyAdminLogin("admin", currentPassword, request);
      if (!valid) {
        return NextResponse.json(
          { error: "La contraseña actual no es correcta" },
          { status: 400 },
        );
      }
      await updateAdminPassword(newPassword, request);
    }

    revalidatePath("/admin/seguridad");

    const refreshedSession = await verifyAdminLogin(
      session.username,
      newPassword,
      request,
    );
    const response = NextResponse.json({ success: true });

    if (refreshedSession) {
      const token = await createAdminSessionToken(refreshedSession);
      setAdminAuthCookie(
        response.cookies,
        token,
        getStoreSlugFromRequest(request),
        getHostFromRequest(request),
      );
    }

    return response;
  } catch (error) {
    console.error("Failed to update admin password", error);
    return NextResponse.json(
      { error: "No se pudo cambiar la contraseña" },
      { status: 500 },
    );
  }
}
