import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/auth/request";
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

export async function POST(request: Request) {
  const redirectBase = new URL("/admin/configuracion", request.url);

  try {
    await requireAdminRequest(request);
  } catch {
    return NextResponse.redirect(
      new URL("/admin/login?next=/admin/configuracion", request.url),
      303,
    );
  }

  const formData = await request.formData();
  const payload = normalizeSettings(formData);

  if (!payload) {
    redirectBase.searchParams.set("error", "missing-fields");
    return NextResponse.redirect(redirectBase, 303);
  }

  try {
    await upsertSettings(payload);
    revalidatePath("/");
    revalidatePath("/admin/configuracion");
    revalidatePath("/carrito");
    redirectBase.searchParams.set("saved", "1");
    return NextResponse.redirect(redirectBase, 303);
  } catch (error) {
    console.error("Failed to save settings", error);
    redirectBase.searchParams.set("error", "save-failed");
    return NextResponse.redirect(redirectBase, 303);
  }
}
