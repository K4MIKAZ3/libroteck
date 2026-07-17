import type { StoreSlug } from "@/lib/store/context";

/** Site keys from Inbox Hub (schema inbox_hub.sites) */
export const INBOX_HUB_SITE_KEYS: Record<StoreSlug, string> = {
  libroteck: "85504ed42c211f75a8892519b77da000",
  streaming: "bf9d411a0820b25229a5652c40dd63ae",
};

export function getInboxHubAppUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_INBOX_HUB_URL?.trim();
  if (!url) return null;
  return url.replace(/\/$/, "");
}

export function buildInboxHubWidgetSrc(
  storeSlug: StoreSlug,
  options?: { product?: string },
): string | null {
  const appUrl = getInboxHubAppUrl();
  const siteKey = INBOX_HUB_SITE_KEYS[storeSlug];
  if (!appUrl || !siteKey) return null;

  const params = new URLSearchParams({
    embed: "1",
    siteKey,
    theme: storeSlug,
  });
  if (options?.product?.trim()) {
    params.set("product", options.product.trim());
  }

  return `${appUrl}/widget?${params.toString()}`;
}
