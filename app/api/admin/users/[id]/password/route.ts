import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { canResetUserPassword } from "@/lib/auth/roles";
import { requireAdminSession } from "@/lib/auth/request";
import {
  getAdminUserById,
  updateAdminUserPassword,
  verifyAdminUserPassword,
} from "@/lib/db/admin-users";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession(request);
    const body = (await request.json()) as {
      newPassword?: string;
      confirmPassword?: string;
      currentPassword?: string;
      _token?: string;
    };

    const { verifyFormToken } = await import("@/lib/auth/form-token");
    if (!(await verifyFormToken(body._token, "users"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const userId = Number(id);
    const target = await getAdminUserById(userId, request);

    if (!target) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const newPassword = body.newPassword ?? "";
    const confirmPassword = body.confirmPassword ?? "";

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Las contraseñas no coinciden" },
        { status: 400 },
      );
    }

    const isSelf = session.userId === target.id;

    if (isSelf) {
      const currentPassword = body.currentPassword ?? "";
      const valid = await verifyAdminUserPassword(
        target.username,
        currentPassword,
        request,
      );
      if (!valid) {
        return NextResponse.json(
          { error: "La contraseña actual no es correcta" },
          { status: 400 },
        );
      }
    } else if (!canResetUserPassword(session.role, target.role)) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }

    await updateAdminUserPassword(userId, newPassword, request);
    revalidatePath("/admin/seguridad");
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Sin permiso" : "No autorizado" },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }
}
