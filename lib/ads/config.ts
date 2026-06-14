import type { Settings } from "@/lib/db/schema";

export type AdSlotConfig = {
  enabled: boolean;
  clientId: string;
  top: string;
  left: string;
  right: string;
};

export function getAdConfig(settings: Settings): AdSlotConfig {
  return {
    enabled: settings.adsEnabled,
    clientId: settings.adsenseClientId.trim(),
    top: settings.adSlotTop.trim(),
    left: settings.adSlotLeft.trim(),
    right: settings.adSlotRight.trim(),
  };
}

export function isAdSenseReady(config: AdSlotConfig) {
  return config.enabled && config.clientId.startsWith("ca-pub-");
}

export const AD_NETWORK_GUIDE = [
  {
    name: "Google AdSense",
    url: "https://www.google.com/adsense/",
    note: "La opción más usada. Te dan un ca-pub-XXXX y un ID de unidad por cada espacio.",
    recommended: true,
  },
  {
    name: "Ezoic",
    url: "https://www.ezoic.com/",
    note: "Optimiza anuncios automáticamente. Requiere más tráfico mensual.",
    recommended: false,
  },
  {
    name: "PropellerAds",
    url: "https://propellerads.com/",
    note: "Alternativa LATAM. Más agresiva; úsala solo en laterales.",
    recommended: false,
  },
] as const;

export const AD_SIZE_GUIDE = {
  top: "728×90 (Leaderboard) o Anuncio adaptable horizontal",
  left: "160×600 (Skyscraper) o 300×600 en pantallas grandes",
  right: "160×600 (Skyscraper) o 300×600 en pantallas grandes",
} as const;
