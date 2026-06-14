import { AdSenseScript } from "@/components/ads/ad-unit";

export function AdSenseHead({ clientId }: { clientId: string }) {
  if (!clientId) {
    return null;
  }

  return <AdSenseScript clientId={clientId} />;
}
