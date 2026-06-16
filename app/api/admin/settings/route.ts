import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/auth";
import { createFormToken, verifyFormToken } from "@/lib/auth/form-token";
import { upsertSettings, updateStoreHeroOffer } from "@/lib/db/queries";

function getCookieToken(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${ADMIN_COOKIE_NAME}=`)) continue;
    return trimmed.slice(ADMIN_COOKIE_NAME.length + 1);
  }

  return null;
}

async function isAuthorized(
  request: Request,
  formToken: string | null | undefined,
  purpose: "settings" | "password",
) {
  if (await verifyFormToken(formToken, purpose)) {
    return true;
  }

  const cookieToken = getCookieToken(request);
  return verifyAdminSessionToken(cookieToken);
}

type SettingsInput = {
  whatsappNumber?: string;
  storeName?: string;
  welcomeMessage?: string;
  whatsappOrderTemplate?: string;
  promoEnabled?: boolean;
  promoTitle?: string;
  promoMessage?: string;
  promoLink?: string;
  promoButtonLabel?: string;
  adsEnabled?: boolean;
  adsenseClientId?: string;
  adSlotTop?: string;
  adSlotLeft?: string;
  adSlotRight?: string;
  heroOfferServiceName?: string;
  heroOfferPrice?: string;
  heroOfferSubtitle?: string;
  heroOfferBackgroundImageUrl?: string;
  _token?: string;
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
    whatsappOrderTemplate: body.whatsappOrderTemplate?.trim() ?? "",
    promoEnabled: Boolean(body.promoEnabled),
    promoTitle: body.promoTitle?.trim() ?? "",
    promoMessage: body.promoMessage?.trim() ?? "",
    promoLink: body.promoLink?.trim() ?? "",
    promoButtonLabel: body.promoButtonLabel?.trim() || "Ver promoción",
    adsEnabled: Boolean(body.adsEnabled),
    adsenseClientId: body.adsenseClientId?.trim() ?? "",
    adSlotTop: body.adSlotTop?.trim() ?? "",
    adSlotLeft: body.adSlotLeft?.trim() ?? "",
    adSlotRight: body.adSlotRight?.trim() ?? "",
  };
}

export async function GET(request: Request) {
  if (!(await isAuthorized(request, null, "settings"))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const token = await createFormToken("settings");
  return NextResponse.json({ token });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as SettingsInput;

    if (!(await isAuthorized(request, body._token, "settings"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const payload = normalizeSettings(body);
    if (!payload) {
      return NextResponse.json(
        { error: "WhatsApp y nombre de tienda son obligatorios" },
        { status: 400 },
      );
    }

    const settings = await upsertSettings(payload, request);
    const store = await updateStoreHeroOffer(
      {
        heroOfferServiceName: body.heroOfferServiceName ?? "",
        heroOfferPrice: body.heroOfferPrice ?? "",
        heroOfferSubtitle: body.heroOfferSubtitle ?? "",
        heroOfferBackgroundImageUrl: body.heroOfferBackgroundImageUrl ?? "",
      },
      request,
    );
    revalidatePath("/");
    revalidatePath("/home");
    revalidatePath("/admin/configuracion");
    revalidatePath("/carrito");
    revalidatePath("/producto/[slug]", "layout");

    return NextResponse.json({ success: true, settings, store });
  } catch (error) {
    console.error("Failed to save settings", error);
    return NextResponse.json(
      { error: "No se pudo guardar la configuración" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const formToken = String(formData.get("_token") ?? "");

  if (!(await isAuthorized(request, formToken, "settings"))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const payload = normalizeSettings({
    whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
    storeName: String(formData.get("storeName") ?? ""),
    welcomeMessage: String(formData.get("welcomeMessage") ?? ""),
    whatsappOrderTemplate: String(formData.get("whatsappOrderTemplate") ?? ""),
    promoEnabled: formData.get("promoEnabled") === "true",
    promoTitle: String(formData.get("promoTitle") ?? ""),
    promoMessage: String(formData.get("promoMessage") ?? ""),
    promoLink: String(formData.get("promoLink") ?? ""),
    promoButtonLabel: String(formData.get("promoButtonLabel") ?? ""),
    adsEnabled: formData.get("adsEnabled") === "true",
    adsenseClientId: String(formData.get("adsenseClientId") ?? ""),
    adSlotTop: String(formData.get("adSlotTop") ?? ""),
    adSlotLeft: String(formData.get("adSlotLeft") ?? ""),
    adSlotRight: String(formData.get("adSlotRight") ?? ""),
  });

  if (!payload) {
    return NextResponse.json(
      { error: "WhatsApp y nombre de tienda son obligatorios" },
      { status: 400 },
    );
  }

  try {
    const settings = await upsertSettings(payload, request);
    const store = await updateStoreHeroOffer(
      {
        heroOfferServiceName: String(formData.get("heroOfferServiceName") ?? ""),
        heroOfferPrice: String(formData.get("heroOfferPrice") ?? ""),
        heroOfferSubtitle: String(formData.get("heroOfferSubtitle") ?? ""),
        heroOfferBackgroundImageUrl: String(
          formData.get("heroOfferBackgroundImageUrl") ?? "",
        ),
      },
      request,
    );
    revalidatePath("/");
    revalidatePath("/home");
    revalidatePath("/admin/configuracion");
    revalidatePath("/carrito");
    revalidatePath("/producto/[slug]", "layout");
    return NextResponse.json({ success: true, settings, store });
  } catch (error) {
    console.error("Failed to save settings", error);
    return NextResponse.json(
      { error: "No se pudo guardar la configuración" },
      { status: 500 },
    );
  }
}
