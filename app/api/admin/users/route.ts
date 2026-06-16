import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createFormToken } from "@/lib/auth/form-token";
import { requireAdminPermission } from "@/lib/auth/request";
import {
  createAdminUser,
  listAdminUsers,
} from "@/lib/db/admin-users";
import { isAdminRole } from "@/lib/auth/roles";

export async function GET(request: Request) {
  try {
    await requireAdminPermission(request, "users:password");
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Sin permiso" : "No autorizado" },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const users = await listAdminUsers(request);
  const token = await createFormToken("users");
  return NextResponse.json({ users, token });
}

export async function POST(request: Request) {
  try {
    await requireAdminPermission(request, "users:manage");
    const body = (await request.json()) as {
      username?: string;
      password?: string;
      role?: string;
      _token?: string;
    };

    const { verifyFormToken } = await import("@/lib/auth/form-token");
    if (!(await verifyFormToken(body._token, "users"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const username = body.username?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const role = body.role ?? "";

    if (!username || username.length < 3) {
      return NextResponse.json(
        { error: "El usuario debe tener al menos 3 caracteres" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 },
      );
    }

    if (!isAdminRole(role) || role === "superadmin") {
      return NextResponse.json(
        { error: "Rol inválido. Usa privilegiado o solo lectura." },
        { status: 400 },
      );
    }

    const user = await createAdminUser(
      { username, password, role },
      request,
    );

    revalidatePath("/admin/seguridad");
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    if (message === "FORBIDDEN") {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    console.error("Failed to create admin user", error);
    return NextResponse.json(
      { error: "No se pudo crear el usuario" },
      { status: 500 },
    );
  }
}
