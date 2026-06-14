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

function useBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function loadSettingsFromBlob(): Promise<StoreSettings | null> {
  try {
    const blob = await head(BLOB_PATHNAME);
    const url = new URL(blob.url);
    url.searchParams.set("_", String(Date.now()));

    const response = await fetch(url.toString(), {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as StoreSettings;
  } catch {
    return null;
  }
}

async function saveSettingsToBlob(data: StoreSettings) {
  await put(BLOB_PATHNAME, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
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
  if (useBlobStorage()) {
    const blobSettings = await loadSettingsFromBlob();
    if (blobSettings) {
      return blobSettings;
    }
    return defaultSettings();
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
  if (useBlobStorage()) {
    await saveSettingsToBlob(data);
    return data;
  }

  const saved = saveSettingsToDb(data);
  return saved ?? data;
}
