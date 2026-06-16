import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createFormToken } from "@/lib/auth/form-token";
import {
  requireAdminMutation,
  requireAdminSession,
} from "@/lib/auth/request";
import { upsertSettings, updateStoreHeroOffer } from "@/lib/db/queries";
import { toPublicSettings } from "@/lib/security/public-settings";
import { isSafeImageUrl, isSafePromoLink } from "@/lib/security/urls";

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

function normalizeHeroOffer(body: {
  heroOfferServiceName?: string;
  heroOfferPrice?: string;
  heroOfferSubtitle?: string;
  heroOfferBackgroundImageUrl?: string;
}) {
  const heroOfferBackgroundImageUrl =
    body.heroOfferBackgroundImageUrl?.trim() ?? "";

  if (!isSafeImageUrl(heroOfferBackgroundImageUrl)) {
    return { error: "La imagen del banner debe ser una URL segura permitida" };
  }

  return {
    data: {
      heroOfferServiceName: body.heroOfferServiceName?.trim() ?? "",
      heroOfferPrice: body.heroOfferPrice?.trim() ?? "",
      heroOfferSubtitle: body.heroOfferSubtitle?.trim() ?? "",
      heroOfferBackgroundImageUrl,
    },
  };
}

function normalizeSettings(body: SettingsInput) {
  if (!body.whatsappNumber?.trim() || !body.storeName?.trim()) {
    return null;
  }

  const promoLink = body.promoLink?.trim() ?? "";

  if (!isSafePromoLink(promoLink)) {
    return { error: "El enlace promocional debe ser http(s) o una ruta interna" };
  }

  return {
    data: {
      whatsappNumber: body.whatsappNumber.trim().replace(/\D/g, ""),
      storeName: body.storeName.trim(),
      welcomeMessage:
        body.welcomeMessage?.trim() || "Elige tu país y ordena por WhatsApp",
      whatsappOrderTemplate: body.whatsappOrderTemplate?.trim() ?? "",
      promoEnabled: Boolean(body.promoEnabled),
      promoTitle: body.promoTitle?.trim() ?? "",
      promoMessage: body.promoMessage?.trim() ?? "",
      promoLink,
      promoButtonLabel: body.promoButtonLabel?.trim() || "Ver promoción",
      adsEnabled: Boolean(body.adsEnabled),
      adsenseClientId: body.adsenseClientId?.trim() ?? "",
      adSlotTop: body.adSlotTop?.trim() ?? "",
      adSlotLeft: body.adSlotLeft?.trim() ?? "",
      adSlotRight: body.adSlotRight?.trim() ?? "",
    },
  };
}

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const token = await createFormToken("settings");
  return NextResponse.json({ token });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as SettingsInput;

    try {
      await requireAdminMutation(request, body._token, "settings");
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const normalized = normalizeSettings(body);
    if (!normalized) {
      return NextResponse.json(
        { error: "WhatsApp y nombre de tienda son obligatorios" },
        { status: 400 },
      );
    }

    if ("error" in normalized) {
      return NextResponse.json({ error: normalized.error }, { status: 400 });
    }

    const heroOffer = normalizeHeroOffer(body);
    if ("error" in heroOffer) {
      return NextResponse.json({ error: heroOffer.error }, { status: 400 });
    }

    const settings = await upsertSettings(normalized.data, request);
    const store = await updateStoreHeroOffer(heroOffer.data, request);
    revalidatePath("/");
    revalidatePath("/home");
    revalidatePath("/admin/configuracion");
    revalidatePath("/carrito");
    revalidatePath("/producto/[slug]", "layout");

    return NextResponse.json({
      success: true,
      settings: toPublicSettings(settings),
      store,
    });
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

  try {
    await requireAdminMutation(request, formToken, "settings");
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const normalized = normalizeSettings({
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

  if (!normalized) {
    return NextResponse.json(
      { error: "WhatsApp y nombre de tienda son obligatorios" },
      { status: 400 },
    );
  }

  if ("error" in normalized) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  const heroOffer = normalizeHeroOffer({
    heroOfferServiceName: String(formData.get("heroOfferServiceName") ?? ""),
    heroOfferPrice: String(formData.get("heroOfferPrice") ?? ""),
    heroOfferSubtitle: String(formData.get("heroOfferSubtitle") ?? ""),
    heroOfferBackgroundImageUrl: String(
      formData.get("heroOfferBackgroundImageUrl") ?? "",
    ),
  });

  if ("error" in heroOffer) {
    return NextResponse.json({ error: heroOffer.error }, { status: 400 });
  }

  try {
    const settings = await upsertSettings(normalized.data, request);
    const store = await updateStoreHeroOffer(heroOffer.data, request);
    revalidatePath("/");
    revalidatePath("/home");
    revalidatePath("/admin/configuracion");
    revalidatePath("/carrito");
    revalidatePath("/producto/[slug]", "layout");
    return NextResponse.json({
      success: true,
      settings: toPublicSettings(settings),
      store,
    });
  } catch (error) {
    console.error("Failed to save settings", error);
    return NextResponse.json(
      { error: "No se pudo guardar la configuración" },
      { status: 500 },
    );
  }
}
