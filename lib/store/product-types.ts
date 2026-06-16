import type { StoreSlug } from "@/lib/store/context";
import type { ProductType } from "@/lib/pricing/countries";
import { PRODUCT_TYPE_LABELS } from "@/lib/pricing/countries";

export const STORE_PRODUCT_TYPES: Record<StoreSlug, ProductType[]> = {
  libroteck: ["course", "book", "bundle"],
  streaming: ["subscription", "bundle"],
};

export function getProductTypesForStore(slug: StoreSlug): ProductType[] {
  return STORE_PRODUCT_TYPES[slug];
}

export function getDefaultProductType(slug: StoreSlug): ProductType {
  return STORE_PRODUCT_TYPES[slug][0];
}

export function getCatalogFilters(slug: StoreSlug) {
  const types = STORE_PRODUCT_TYPES[slug];
  return [
    { value: "all" as const, label: "Todos" },
    ...types.map((type) => ({
      value: type,
      label:
        type === "subscription"
          ? "Streaming"
          : type === "bundle" && slug === "streaming"
            ? "Combos"
            : PRODUCT_TYPE_LABELS[type],
    })),
  ];
}
