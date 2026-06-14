import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/auth";
import { requireAdminRequest } from "@/lib/auth/request";
import { updateAdminPassword } from "@/lib/db/queries";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireAdminRequest(request);
  } catch {
    return NextResponse.redirect(
      new URL("/admin/login?next=/admin/configuracion", request.url),
    );
  }

  const redirectUrl = new URL("/admin/configuracion", request.url);

  try {
    const formData = await request.formData();
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword.length < 8) {
      redirectUrl.searchParams.set("passwordError", "password-too-short");
      return NextResponse.redirect(redirectUrl);
    }

    if (newPassword !== confirmPassword) {
      redirectUrl.searchParams.set("passwordError", "password-mismatch");
      return NextResponse.redirect(redirectUrl);
    }

    if (!(await verifyAdminPassword(currentPassword))) {
      redirectUrl.searchParams.set("passwordError", "wrong-password");
      return NextResponse.redirect(redirectUrl);
    }

    await updateAdminPassword(newPassword);
    revalidatePath("/admin/configuracion");

    redirectUrl.searchParams.set("passwordSaved", "1");
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Failed to update admin password", error);
    redirectUrl.searchParams.set("passwordError", "password-failed");
    return NextResponse.redirect(redirectUrl);
  }
}
