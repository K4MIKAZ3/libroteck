import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { upsertSettings } from "@/lib/db/queries";

export async function PUT(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    whatsappNumber: string;
    storeName: string;
    welcomeMessage: string;
  };

  const settings = await upsertSettings(body);
  return NextResponse.json(settings);
}
