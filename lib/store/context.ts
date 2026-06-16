import { cache } from "react";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb } from "@/lib/db/index";
import { settings, stores, type Settings } from "@/lib/db/schema";

export const STORE_SLUGS = ["libroteck", "streaming"] as const;
export type StoreSlug = (typeof STORE_SLUGS)[number];

export function resolveStoreSlugFromHost(host: string): StoreSlug {
  const hostname = host.split(":")[0].toLowerCase();
  if (hostname === "streaming" || hostname.startsWith("streaming.")) {
    return "streaming";
  }
  return "libroteck";
}

export function getStoreSlugFromRequest(request: Request): StoreSlug {
  const fromHeader = request.headers.get("x-store-slug");
  if (fromHeader === "streaming" || fromHeader === "libroteck") {
    return fromHeader;
  }
  return resolveStoreSlugFromHost(request.headers.get("host") ?? "");
}

export async function getStoreSlug(): Promise<StoreSlug> {
  const requestHeaders = await headers();
  const fromHeader = requestHeaders.get("x-store-slug");
  if (fromHeader === "streaming" || fromHeader === "libroteck") {
    return fromHeader;
  }
  return resolveStoreSlugFromHost(requestHeaders.get("host") ?? "");
}

function defaultSettingsForStore(
  storeId: number,
  slug: StoreSlug,
): Omit<Settings, "id"> & { id: number } {
  const isStreaming = slug === "streaming";
  return {
    id: storeId,
    storeId,
    whatsappNumber: process.env.WHATSAPP_NUMBER ?? "5212345678900",
    storeName: isStreaming ? "XCONDEF" : "LibroTeck",
    welcomeMessage: isStreaming
      ? "Cuentas premium de streaming al mejor precio"
      : "Elige tu país y ordena por WhatsApp",
    adminPasswordHash: null,
    promoEnabled: false,
    promoTitle: "",
    promoMessage: "",
    promoLink: "",
    promoButtonLabel: "Ver promoción",
    adsEnabled: false,
    adsenseClientId: "",
    adSlotTop: "",
    adSlotLeft: "",
    adSlotRight: "",
  };
}

export type StoreRecord = typeof stores.$inferSelect;

export type StoreContext = {
  slug: StoreSlug;
  store: StoreRecord;
  settings: Omit<Settings, "id"> & { id: number };
  storeId: number;
};

export const getStoreContext = cache(async (): Promise<StoreContext> => {
  const slug = await getStoreSlug();
  const db = await getDb();
  const store = await db.query.stores.findFirst({
    where: eq(stores.slug, slug),
  });

  if (!store) {
    throw new Error(
      `Tienda "${slug}" no encontrada. Ejecuta las migraciones de base de datos.`,
    );
  }

  const settingsRow = await db.query.settings.findFirst({
    where: eq(settings.storeId, store.id),
  });

  return {
    slug,
    store,
    storeId: store.id,
    settings: settingsRow ?? defaultSettingsForStore(store.id, slug),
  };
});
