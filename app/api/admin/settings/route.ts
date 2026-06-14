import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/auth/request";
import { upsertSettings } from "@/lib/db/queries";

export const runtime = "nodejs";

type SettingsInput = {
  whatsappNumber?: string;
  storeName?: string;
  welcomeMessage?: string;
};

function normalizeSettings(body: SettingsInput) {
  if (!body.whatsappNumber?.trim() || !body.storeName?.trim()) {
    return null;
  }

  return {
    whatsappNumber: body.whatsappNumber.trim().replace(/\D/g, ""),
    storeName: body.storeName.trim(),
    welcomeMessage:
      body.welcomeMessage?.trim() || "Elige tu país y ordena por WhatsApp",
  };
}

export async function POST(request: Request) {
  try {
    await requireAdminRequest(request);
  } catch {
    return NextResponse.redirect(
      new URL("/admin/login?next=/admin/configuracion", request.url),
    );
  }

  try {
    const formData = await request.formData();
    const payload = normalizeSettings({
      whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
      storeName: String(formData.get("storeName") ?? ""),
      welcomeMessage: String(formData.get("welcomeMessage") ?? ""),
    });

    if (!payload) {
      const redirectUrl = new URL("/admin/configuracion", request.url);
      redirectUrl.searchParams.set("error", "missing-fields");
      return NextResponse.redirect(redirectUrl);
    }

    await upsertSettings(payload);

    const redirectUrl = new URL("/admin/configuracion", request.url);
    redirectUrl.searchParams.set("saved", "1");
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Failed to save settings", error);
    const redirectUrl = new URL("/admin/configuracion", request.url);
    redirectUrl.searchParams.set(
      "error",
      error instanceof Error ? error.message : "save-failed",
    );
    return NextResponse.redirect(redirectUrl);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdminRequest(request);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as SettingsInput;
    const payload = normalizeSettings(body);

    if (!payload) {
      return NextResponse.json(
        { error: "WhatsApp y nombre de tienda son obligatorios" },
        { status: 400 },
      );
    }

    const settings = await upsertSettings(payload);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Failed to save settings", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo guardar la configuración",
      },
      { status: 500 },
    );
  }
}
