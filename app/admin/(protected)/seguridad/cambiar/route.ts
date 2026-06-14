import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/auth";
import { requireAdminRequest } from "@/lib/auth/request";
import { updateAdminPassword } from "@/lib/db/queries";

export async function POST(request: Request) {
  const redirectBase = new URL("/admin/seguridad", request.url);

  try {
    await requireAdminRequest(request);
  } catch {
    return NextResponse.redirect(
      new URL("/admin/login?next=/admin/seguridad", request.url),
      303,
    );
  }

  const formData = await request.formData();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) {
    redirectBase.searchParams.set("error", "password-too-short");
    return NextResponse.redirect(redirectBase, 303);
  }

  if (newPassword !== confirmPassword) {
    redirectBase.searchParams.set("error", "password-mismatch");
    return NextResponse.redirect(redirectBase, 303);
  }

  if (!(await verifyAdminPassword(currentPassword))) {
    redirectBase.searchParams.set("error", "wrong-password");
    return NextResponse.redirect(redirectBase, 303);
  }

  try {
    await updateAdminPassword(newPassword);
    revalidatePath("/admin/seguridad");
    redirectBase.searchParams.set("saved", "1");
    return NextResponse.redirect(redirectBase, 303);
  } catch (error) {
    console.error("Failed to update admin password", error);
    redirectBase.searchParams.set("error", "password-failed");
    return NextResponse.redirect(redirectBase, 303);
  }
}
