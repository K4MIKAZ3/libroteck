import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/auth/request";
import { upsertSettings } from "@/lib/db/queries";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    await requireAdminRequest(request);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      whatsappNumber?: string;
      storeName?: string;
      welcomeMessage?: string;
    };

    if (!body.whatsappNumber?.trim() || !body.storeName?.trim()) {
      return NextResponse.json(
        { error: "WhatsApp y nombre de tienda son obligatorios" },
        { status: 400 },
      );
    }

    const settings = await upsertSettings({
      whatsappNumber: body.whatsappNumber.trim().replace(/\D/g, ""),
      storeName: body.storeName.trim(),
      welcomeMessage:
        body.welcomeMessage?.trim() || "Elige tu país y ordena por WhatsApp",
    });

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
