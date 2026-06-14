import { head, put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/index";
import { settings } from "@/lib/db/schema";

export type StoreSettings = {
  whatsappNumber: string;
  storeName: string;
  welcomeMessage: string;
};

const BLOB_PATHNAME = "libroteck/settings.json";

function defaultSettings(): StoreSettings {
  return {
    whatsappNumber: process.env.WHATSAPP_NUMBER ?? "5212345678900",
    storeName: "LibroTeck",
    welcomeMessage: "Elige tu país y ordena por WhatsApp",
  };
}

function canUseBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function loadSettingsFromBlob(): Promise<StoreSettings | null> {
  if (!canUseBlob()) return null;

  try {
    const blob = await head(BLOB_PATHNAME);
    const response = await fetch(blob.url, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as StoreSettings;
  } catch {
    return null;
  }
}

async function saveSettingsToBlob(data: StoreSettings) {
  if (!canUseBlob()) return;

  await put(BLOB_PATHNAME, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
}

function loadSettingsFromDb() {
  const db = getDb();
  return db.select().from(settings).limit(1).get() ?? null;
}

function saveSettingsToDb(data: StoreSettings) {
  const db = getDb();
  const existing = loadSettingsFromDb();

  if (existing) {
    db.update(settings).set(data).where(eq(settings.id, existing.id)).run();
    return { ...existing, ...data };
  }

  return db.insert(settings).values(data).returning().get();
}

export async function loadStoreSettings() {
  const blobSettings = await loadSettingsFromBlob();
  if (blobSettings) {
    return blobSettings;
  }

  const dbSettings = loadSettingsFromDb();
  if (dbSettings) {
    return {
      whatsappNumber: dbSettings.whatsappNumber,
      storeName: dbSettings.storeName,
      welcomeMessage: dbSettings.welcomeMessage,
    };
  }

  return defaultSettings();
}

export async function saveStoreSettings(data: StoreSettings) {
  const saved = saveSettingsToDb(data);

  try {
    await saveSettingsToBlob(data);
  } catch (error) {
    console.error("Failed to save settings to blob", error);
  }

  return saved ?? data;
}
