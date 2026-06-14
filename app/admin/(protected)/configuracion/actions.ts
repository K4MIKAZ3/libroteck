"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { upsertSettings } from "@/lib/db/queries";

function normalizeSettings(formData: FormData) {
  const whatsappNumber = String(formData.get("whatsappNumber") ?? "").trim();
  const storeName = String(formData.get("storeName") ?? "").trim();
  const welcomeMessage = String(formData.get("welcomeMessage") ?? "").trim();

  if (!whatsappNumber || !storeName) {
    return null;
  }

  return {
    whatsappNumber: whatsappNumber.replace(/\D/g, ""),
    storeName,
    welcomeMessage: welcomeMessage || "Elige tu país y ordena por WhatsApp",
  };
}

export async function saveSettingsAction(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login?next=/admin/configuracion");
  }

  const payload = normalizeSettings(formData);
  if (!payload) {
    redirect("/admin/configuracion?error=missing-fields");
  }

  try {
    await upsertSettings(payload);
    revalidatePath("/");
    revalidatePath("/admin/configuracion");
    revalidatePath("/carrito");
    redirect("/admin/configuracion?saved=1");
  } catch (error) {
    console.error("Failed to save settings", error);
    redirect("/admin/configuracion?error=save-failed");
  }
}
