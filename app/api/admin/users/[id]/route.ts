import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { canResetUserPassword } from "@/lib/auth/roles";
import { requireAdminPermission } from "@/lib/auth/request";
import {
  deleteAdminUser,
  getAdminUserById,
  updateAdminUser,
  updateAdminUserPassword,
} from "@/lib/db/admin-users";
import { isAdminRole } from "@/lib/auth/roles";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminPermission(request, "users:manage");
    const body = (await request.json()) as {
      role?: string;
      isActive?: boolean;
      _token?: string;
    };

    const { verifyFormToken } = await import("@/lib/auth/form-token");
    if (!(await verifyFormToken(body._token, "users"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const userId = Number(id);
    const existing = await getAdminUserById(userId, request);

    if (!existing) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (existing.role === "superadmin") {
      return NextResponse.json(
        { error: "No se puede modificar al superusuario" },
        { status: 403 },
      );
    }

    if (body.role && (!isAdminRole(body.role) || body.role === "superadmin")) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    const user = await updateAdminUser(
      userId,
      {
        role: body.role as "privileged" | "viewer" | undefined,
        isActive: body.isActive,
      },
      request,
    );

    revalidatePath("/admin/seguridad");
    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Sin permiso" : "No autorizado" },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminPermission(request, "users:manage");
    const body = (await request.json()) as { _token?: string };
    const { verifyFormToken } = await import("@/lib/auth/form-token");
    if (!(await verifyFormToken(body._token, "users"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const userId = Number(id);
    const existing = await getAdminUserById(userId, request);

    if (!existing) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (existing.role === "superadmin") {
      return NextResponse.json(
        { error: "No se puede eliminar al superusuario" },
        { status: 403 },
      );
    }

    await deleteAdminUser(userId, request);
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
