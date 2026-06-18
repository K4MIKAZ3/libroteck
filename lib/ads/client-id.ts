import type { Settings } from "@/lib/db/schema";

export function resolveAdsenseClientId(
  settings?: Pick<Settings, "adsenseClientId"> | null,
) {
  return (
    process.env.ADSENSE_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() ||
    settings?.adsenseClientId?.trim() ||
    ""
  );
}

export function isValidAdsenseClientId(clientId: string) {
  return /^ca-pub-\d+$/.test(clientId);
}

export function adsenseClientIdToPubId(clientId: string) {
  return clientId.replace(/^ca-pub-/, "pub-");
}

export function shouldLoadAdsenseScript(
  settings?: Pick<Settings, "adsEnabled" | "adsenseClientId"> | null,
) {
  if (!settings?.adsEnabled) {
    return false;
  }

  const clientId = resolveAdsenseClientId(settings);
  return isValidAdsenseClientId(clientId);
}

export function shouldShowAdUnits(
  settings: Pick<
    Settings,
    "adsEnabled" | "adsenseClientId" | "adSlotTop" | "adSlotLeft" | "adSlotRight"
  >,
) {
  const clientId = resolveAdsenseClientId(settings);
  if (!settings.adsEnabled || !isValidAdsenseClientId(clientId)) {
    return false;
  }

  return Boolean(
    settings.adSlotTop.trim() ||
      settings.adSlotLeft.trim() ||
      settings.adSlotRight.trim(),
  );
}
