import type { StoreSettings } from "@/lib/settings/store";

export const SETTINGS_FLASH_COOKIE = "libroteck_settings_flash";

export function encodeSettingsFlash(data: StoreSettings): string {
  return Buffer.from(JSON.stringify(data)).toString("base64url");
}

export function decodeSettingsFlash(value: string): StoreSettings | null {
  try {
    return JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as StoreSettings;
  } catch {
    return null;
  }
}
