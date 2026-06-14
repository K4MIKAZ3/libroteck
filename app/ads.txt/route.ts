import {
  adsenseClientIdToPubId,
  isValidAdsenseClientId,
  resolveAdsenseClientId,
} from "@/lib/ads/client-id";
import { getSettings } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSettings();
  const clientId = resolveAdsenseClientId(settings);

  if (!isValidAdsenseClientId(clientId)) {
    return new Response(
      "# Agrega tu ID ca-pub- en Admin > Configuracion o ADSENSE_CLIENT_ID\n",
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      },
    );
  }

  const pubId = adsenseClientIdToPubId(clientId);
  const body = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
