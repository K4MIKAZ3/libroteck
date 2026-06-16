import type { StoreSlug } from "@/lib/store/context";
import type { ProductType } from "@/lib/pricing/countries";
import { PRODUCT_TYPE_LABELS } from "@/lib/pricing/countries";
import { STREAMING_CATALOG_FILTERS } from "@/lib/store/streaming-categories";

export const STORE_PRODUCT_TYPES: Record<StoreSlug, ProductType[]> = {
  libroteck: ["course", "book", "bundle"],
  streaming: ["subscription"],
};

export function getProductTypesForStore(slug: StoreSlug): ProductType[] {
  return STORE_PRODUCT_TYPES[slug];
}

export function getDefaultProductType(slug: StoreSlug): ProductType {
  return STORE_PRODUCT_TYPES[slug][0];
}

export function getCatalogFilters(slug: StoreSlug) {
  if (slug === "streaming") {
    return STREAMING_CATALOG_FILTERS;
  }

  const types = STORE_PRODUCT_TYPES[slug];
  return [
    { value: "all" as const, label: "Todos" },
    ...types.map((type) => ({
      value: type,
      label: PRODUCT_TYPE_LABELS[type],
    })),
  ];
}
