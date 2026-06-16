import type { ProductWithPrices } from "@/lib/db/schema";

export type StreamingCatalogFilter = "all" | "streaming" | "ia" | "panel";

export const STREAMING_CATALOG_FILTERS: Array<{
  value: StreamingCatalogFilter;
  label: string;
}> = [
  { value: "all", label: "Todos" },
  { value: "streaming", label: "Streaming" },
  { value: "ia", label: "IA" },
  { value: "panel", label: "Panel" },
];

const LEGACY_COMBO_SLUGS = new Set(["combos", "combos-triples"]);

const IA_SLUGS = new Set(["chatgpt"]);

function productText(product: Pick<ProductWithPrices, "slug" | "name">) {
  return `${product.slug} ${product.name}`.toLowerCase();
}

export function isLegacyComboProduct(
  product: Pick<ProductWithPrices, "slug" | "type">,
): boolean {
  return (
    product.type === "bundle" || LEGACY_COMBO_SLUGS.has(product.slug.toLowerCase())
  );
}

export function isPanelProduct(
  product: Pick<ProductWithPrices, "slug" | "name">,
): boolean {
  const text = productText(product);
  return text.includes("panel");
}

export function isIaProduct(
  product: Pick<ProductWithPrices, "slug" | "name">,
): boolean {
  if (IA_SLUGS.has(product.slug.toLowerCase())) {
    return true;
  }

  const text = productText(product);
  return (
    text.includes("chatgpt") ||
    text.includes(" openai") ||
    text.includes("gemini") ||
    text.includes("copilot")
  );
}

export function getStreamingCatalogCategory(
  product: Pick<ProductWithPrices, "slug" | "name" | "type">,
): Exclude<StreamingCatalogFilter, "all"> | null {
  if (isLegacyComboProduct(product)) {
    return null;
  }

  if (isPanelProduct(product)) {
    return "panel";
  }

  if (isIaProduct(product)) {
    return "ia";
  }

  if (product.type === "subscription") {
    return "streaming";
  }

  return null;
}

export function isStreamingCatalogProduct(product: ProductWithPrices): boolean {
  return getStreamingCatalogCategory(product) !== null;
}

export function filterStreamingCatalogProducts(
  products: ProductWithPrices[],
  filter: StreamingCatalogFilter,
): ProductWithPrices[] {
  const visible = products.filter(isStreamingCatalogProduct);

  if (filter === "all") {
    return visible;
  }

  return visible.filter(
    (product) => getStreamingCatalogCategory(product) === filter,
  );
}

export function getStreamingCategoryLabel(
  product: Pick<ProductWithPrices, "slug" | "name" | "type">,
): string {
  const category = getStreamingCatalogCategory(product);

  switch (category) {
    case "panel":
      return "Panel de revendedor";
    case "ia":
      return "Inteligencia artificial";
    case "streaming":
      return "Perfil de streaming";
    default:
      return "Servicio digital";
  }
}
