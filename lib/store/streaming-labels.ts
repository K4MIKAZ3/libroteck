import type { ProductWithPrices } from "@/lib/db/schema";
import {
  getStreamingCatalogCategory,
  isIaProduct,
  isLegacyComboProduct,
  isPanelProduct,
} from "@/lib/store/streaming-categories";

export const STREAMING_PROFILE_LABEL = "Perfil de cuenta";
export const STREAMING_PROFILE_NOTE =
  "Venta de perfil individual, no cuenta completa. Acceso compartido según las reglas de cada plataforma.";

export function isComboEligibleProduct(product: ProductWithPrices): boolean {
  if (isLegacyComboProduct(product)) {
    return false;
  }

  if (getStreamingCatalogCategory(product) !== "streaming") {
    return false;
  }

  if (isPanelProduct(product) || isIaProduct(product)) {
    return false;
  }

  const excludedSlugs = new Set(["cursos"]);
  if (excludedSlugs.has(product.slug.toLowerCase())) {
    return false;
  }

  return product.type === "subscription";
}

export function getStreamingDisplayName(productName: string): string {
  return `Perfil ${productName}`;
}

export function getStreamingProductSubtitle(
  product: Pick<ProductWithPrices, "slug" | "name" | "type" | "streamingCategory">,
): string {
  const category = getStreamingCatalogCategory(product);

  switch (category) {
    case "panel":
      return "Panel de revendedor";
    case "ia":
      return "Herramienta de IA";
    case "streaming":
      return STREAMING_PROFILE_LABEL;
    default:
      return "Servicio digital";
  }
}

export function getStreamingProductSummary(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) {
    return "";
  }

  const withoutPrefix = trimmed.replace(
    /^Perfil individual \(no cuenta completa\)\.\s*/i,
    "",
  );

  const firstSentence = withoutPrefix.split(/(?<=[.!?])\s+/)[0]?.trim();
  return firstSentence || withoutPrefix;
}
