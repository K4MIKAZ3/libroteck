"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { upsertSettings } from "@/lib/db/queries";

export type SaveSettingsResult =
  | { success: true }
  | { success: false; error: string };

export async function saveSettingsAction(input: {
  whatsappNumber: string;
  storeName: string;
  welcomeMessage: string;
}): Promise<SaveSettingsResult> {
  try {
    await requireAdmin();

    if (!input.whatsappNumber.trim() || !input.storeName.trim()) {
      return {
        success: false,
        error: "WhatsApp y nombre de tienda son obligatorios",
      };
    }

    await upsertSettings({
      whatsappNumber: input.whatsappNumber.trim().replace(/\D/g, ""),
      storeName: input.storeName.trim(),
      welcomeMessage:
        input.welcomeMessage.trim() || "Elige tu país y ordena por WhatsApp",
    });

    revalidatePath("/");
    revalidatePath("/admin/configuracion");
    revalidatePath("/carrito");

    return { success: true };
  } catch (error) {
    console.error("saveSettingsAction failed", error);
    return {
      success: false,
      error:
        error instanceof Error && error.message === "UNAUTHORIZED"
          ? "Sesión expirada. Vuelve a iniciar sesión."
          : error instanceof Error
            ? error.message
            : "No se pudo guardar la configuración",
    };
  }
}
