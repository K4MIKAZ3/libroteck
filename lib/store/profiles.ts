import type { StoreSlug } from "@/lib/store/context";

export type StoreProfile = "courses" | "subscriptions";

export const STORE_PROFILES: Record<StoreSlug, StoreProfile> = {
  libroteck: "courses",
  streaming: "subscriptions",
};

export const STORE_BASE_URLS: Record<StoreSlug, string> = {
  libroteck: "https://libroteck.xyz",
  streaming: "https://streaming.libroteck.xyz",
};

export const STORE_PANEL_NAMES: Record<StoreSlug, string> = {
  libroteck: "LibroTeck",
  streaming: "XCONDEF",
};

export function isSubscriptionStore(slug: StoreSlug): boolean {
  return STORE_PROFILES[slug] === "subscriptions";
}

export function getStoreBaseUrl(slug: StoreSlug): string {
  return STORE_BASE_URLS[slug];
}

export function getStorePanelName(slug: StoreSlug): string {
  return STORE_PANEL_NAMES[slug];
}

export function getDefaultStoreName(slug: StoreSlug): string {
  return STORE_PANEL_NAMES[slug];
}

export function getDefaultWelcomeMessage(slug: StoreSlug): string {
  return isSubscriptionStore(slug)
    ? "Cuentas premium de streaming al mejor precio"
    : "Elige tu país y ordena por WhatsApp";
}
