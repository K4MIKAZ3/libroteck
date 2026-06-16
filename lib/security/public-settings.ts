import type { Settings } from "@/lib/db/schema";

export type PublicSettings = Omit<Settings, "adminPasswordHash">;

export function toPublicSettings(settings: Settings): PublicSettings {
  const { adminPasswordHash: _hash, ...publicSettings } = settings;
  return publicSettings;
}
