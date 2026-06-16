import type { Store } from "@/lib/db/schema";

export function formatHeroOfferTitle(store: Pick<
  Store,
  "heroOfferServiceName" | "heroOfferPrice" | "heroOfferTitle"
>): string {
  const service = store.heroOfferServiceName.trim();
  const price = store.heroOfferPrice.trim();

  if (service && price) {
    return `${service} desde ${price}`;
  }

  if (service) {
    return service;
  }

  return store.heroOfferTitle.trim() || "Oferta especial";
}
