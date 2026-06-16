import type { ProductWithPrices } from "@/lib/db/schema";

export const STREAMING_PROFILE_LABEL = "Perfil de cuenta";
export const STREAMING_PROFILE_NOTE =
  "Venta de perfil individual, no cuenta completa. Acceso compartido según las reglas de cada plataforma.";

export function isComboEligibleProduct(product: ProductWithPrices): boolean {
  if (product.type === "bundle") {
    return false;
  }

  const slug = product.slug.toLowerCase();
  const name = product.name.toLowerCase();

  if (slug.includes("panel") || name.includes("panel")) {
    return false;
  }

  const excludedSlugs = new Set(["combos", "combos-triples", "cursos"]);
  if (excludedSlugs.has(slug)) {
    return false;
  }

  return product.type === "subscription";
}

export function getStreamingDisplayName(productName: string): string {
  return `Perfil ${productName}`;
}

export function getStreamingProductSubtitle(type: string): string {
  if (type === "subscription") {
    return STREAMING_PROFILE_LABEL;
  }
  if (type === "bundle") {
    return "Paquete de perfiles";
  }
  return "Servicio digital";
}
