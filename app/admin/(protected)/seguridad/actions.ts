"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, verifyAdminPassword } from "@/lib/auth";
import { updateAdminPassword } from "@/lib/db/queries";

export async function changePasswordAction(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login?next=/admin/seguridad");
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) {
    redirect("/admin/seguridad?error=password-too-short");
  }

  if (newPassword !== confirmPassword) {
    redirect("/admin/seguridad?error=password-mismatch");
  }

  if (!(await verifyAdminPassword(currentPassword))) {
    redirect("/admin/seguridad?error=wrong-password");
  }

  try {
    await updateAdminPassword(newPassword);
    revalidatePath("/admin/seguridad");
    redirect("/admin/seguridad?saved=1");
  } catch (error) {
    console.error("Failed to update admin password", error);
    redirect("/admin/seguridad?error=password-failed");
  }
}
